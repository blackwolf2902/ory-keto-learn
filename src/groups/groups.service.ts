import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { KetoService } from '../keto/keto.service';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import {
    createGroupCreatedEvent,
    createMemberAddedEvent,
    createMemberRemovedEvent,
} from './events/group.events';

/**
 * ============================================
 * GROUPS SERVICE - Team-Based Access Control
 * ============================================
 * 
 * CONCEPT: Subject Sets (Group Membership)
 * 
 * Instead of granting permissions to individual users:
 *   Document:spec.pdf#viewer@User:alice
 *   Document:spec.pdf#viewer@User:bob
 *   Document:spec.pdf#viewer@User:charlie
 * 
 * You can grant to a group:
 *   Document:spec.pdf#viewer@Group:engineering#member
 * 
 * Then add users to the group:
 *   Group:engineering#member@User:alice
 *   Group:engineering#member@User:bob
 *   Group:engineering#member@User:charlie
 * 
 * Benefits:
 * 1. Easier to manage large teams
 * 2. Single point of access change (add/remove group member)
 * 3. Clear organizational structure in permissions
 */
@Injectable()
export class GroupsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly ketoService: KetoService,
        private readonly eventPublisher: EventPublisherService,
    ) { }

    /**
     * Create a new group
     */
    async create(createGroupDto: CreateGroupDto, userId?: string) {
        const group = await this.prisma.group.create({
            data: createGroupDto,
        });

        // EVENT SOURCING: Record group creation
        if (userId) {
            await this.eventPublisher.publish(
                createGroupCreatedEvent(group.id, userId, {
                    name: group.name,
                    description: group.description ?? undefined,
                }),
            );
        }

        return group;
    }

    /**
     * Add a member to a group
     * 
     * KETO INTEGRATION:
     * When adding a member, we create a relation tuple:
     *   Group:{groupId}#member@User:{userId}
     * 
     * This means the user is now a member of the group.
     * Any permission granted to "Group:xxx#member" now applies to this user.
     */
    async addMember(groupId: string, addMemberDto: AddMemberDto) {
        // Verify group and user exist
        const group = await this.prisma.group.findUnique({ where: { id: groupId } });
        if (!group) throw new NotFoundException('Group not found');

        const user = await this.prisma.user.findUnique({ where: { id: addMemberDto.userId } });
        if (!user) throw new NotFoundException('User not found');

        // Create membership in database
        const membership = await this.prisma.groupMember.create({
            data: {
                groupId,
                userId: addMemberDto.userId,
                role: addMemberDto.role || 'member',
            },
            include: { user: true, group: true },
        });

        // CREATE RELATION IN KETO
        // This is the critical step that enables group-based permissions!
        await this.ketoService.createRelation({
            namespace: 'Group',
            object: groupId,
            relation: 'member',
            subjectId: `User:${addMemberDto.userId}`,
        });

        // EVENT SOURCING: Record member added
        await this.eventPublisher.publish(
            createMemberAddedEvent(groupId, addMemberDto.userId, {
                memberId: addMemberDto.userId,
                role: addMemberDto.role || 'member',
            }),
        );

        return membership;
    }

    /**
     * Remove a member from a group
     * 
     * KETO INTEGRATION:
     * Removing the relation tuple also removes all permissions
     * that were granted through group membership.
     */
    async removeMember(groupId: string, userId: string) {
        await this.prisma.groupMember.delete({
            where: {
                userId_groupId: { userId, groupId },
            },
        });

        // DELETE RELATION IN KETO
        await this.ketoService.deleteRelation({
            namespace: 'Group',
            object: groupId,
            relation: 'member',
            subjectId: `User:${userId}`,
        });

        // EVENT SOURCING: Record member removed
        await this.eventPublisher.publish(
            createMemberRemovedEvent(groupId, userId, {
                memberId: userId,
            }),
        );

        return { success: true };
    }

    async findAll() {
        return this.prisma.group.findMany({
            include: {
                members: {
                    include: { user: true },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.group.findUnique({
            where: { id },
            include: {
                members: {
                    include: { user: true },
                },
            },
        });
    }

    /**
     * Get all members of a group from Keto
     * 
     * CONCEPT: Permission Expansion
     * You can ask Keto "who has this relation on this object?"
     * This is useful for auditing and displaying sharing info.
     */
    async getMembersFromKeto(groupId: string) {
        return this.ketoService.expandPermission({
            namespace: 'Group',
            object: groupId,
            relation: 'member',
        });
    }
}
