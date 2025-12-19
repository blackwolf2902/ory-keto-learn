import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { groups, groupMembers, users } from '../drizzle/schema';
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
 */
@Injectable()
export class GroupsService {
    constructor(
        private readonly drizzle: DrizzleService,
        private readonly ketoService: KetoService,
        private readonly eventPublisher: EventPublisherService,
    ) { }

    /**
     * Create a new group
     */
    async create(createGroupDto: CreateGroupDto, userId?: string) {
        const [group] = await this.drizzle.db.insert(groups).values({
            name: createGroupDto.name,
            description: createGroupDto.description,
            creatorId: userId,
        }).returning();

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
     */
    async addMember(groupId: string, addMemberDto: AddMemberDto) {
        // Verify group exists
        const [group] = await this.drizzle.db.select().from(groups).where(eq(groups.id, groupId));
        if (!group) throw new NotFoundException('Group not found');

        // Verify user exists
        const [user] = await this.drizzle.db.select().from(users).where(eq(users.id, addMemberDto.userId));
        if (!user) throw new NotFoundException('User not found');

        // Create membership in database
        const [membership] = await this.drizzle.db.insert(groupMembers).values({
            groupId,
            userId: addMemberDto.userId,
            role: addMemberDto.role || 'member',
        }).returning();

        // CREATE RELATION IN KETO
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

        return { ...membership, user, group };
    }

    /**
     * Remove a member from a group
     */
    async removeMember(groupId: string, userId: string) {
        await this.drizzle.db.delete(groupMembers).where(
            and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId))
        );

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
        return this.drizzle.db.query.groups.findMany({
            with: {
                members: {
                    with: { user: true },
                },
            },
        });
    }

    /**
     * Get groups created by a specific user
     * SESSION ISOLATION: Users only see their own groups
     */
    async findAllByCreator(creatorId: string) {
        return this.drizzle.db.query.groups.findMany({
            where: eq(groups.creatorId, creatorId),
            with: {
                members: {
                    with: { user: true },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.drizzle.db.query.groups.findFirst({
            where: eq(groups.id, id),
            with: {
                members: {
                    with: { user: true },
                },
            },
        });
    }

    /**
     * Get all members of a group from Keto
     */
    async getMembersFromKeto(groupId: string) {
        return this.ketoService.expandPermission({
            namespace: 'Group',
            object: groupId,
            relation: 'member',
        });
    }
}
