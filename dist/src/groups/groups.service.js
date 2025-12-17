"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const keto_service_1 = require("../keto/keto.service");
const event_publisher_service_1 = require("../events/event-publisher.service");
const group_events_1 = require("./events/group.events");
let GroupsService = class GroupsService {
    prisma;
    ketoService;
    eventPublisher;
    constructor(prisma, ketoService, eventPublisher) {
        this.prisma = prisma;
        this.ketoService = ketoService;
        this.eventPublisher = eventPublisher;
    }
    async create(createGroupDto, userId) {
        const group = await this.prisma.group.create({
            data: createGroupDto,
        });
        if (userId) {
            await this.eventPublisher.publish((0, group_events_1.createGroupCreatedEvent)(group.id, userId, {
                name: group.name,
                description: group.description ?? undefined,
            }));
        }
        return group;
    }
    async addMember(groupId, addMemberDto) {
        const group = await this.prisma.group.findUnique({ where: { id: groupId } });
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        const user = await this.prisma.user.findUnique({ where: { id: addMemberDto.userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const membership = await this.prisma.groupMember.create({
            data: {
                groupId,
                userId: addMemberDto.userId,
                role: addMemberDto.role || 'member',
            },
            include: { user: true, group: true },
        });
        await this.ketoService.createRelation({
            namespace: 'Group',
            object: groupId,
            relation: 'member',
            subjectId: `User:${addMemberDto.userId}`,
        });
        await this.eventPublisher.publish((0, group_events_1.createMemberAddedEvent)(groupId, addMemberDto.userId, {
            memberId: addMemberDto.userId,
            role: addMemberDto.role || 'member',
        }));
        return membership;
    }
    async removeMember(groupId, userId) {
        await this.prisma.groupMember.delete({
            where: {
                userId_groupId: { userId, groupId },
            },
        });
        await this.ketoService.deleteRelation({
            namespace: 'Group',
            object: groupId,
            relation: 'member',
            subjectId: `User:${userId}`,
        });
        await this.eventPublisher.publish((0, group_events_1.createMemberRemovedEvent)(groupId, userId, {
            memberId: userId,
        }));
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
    async findOne(id) {
        return this.prisma.group.findUnique({
            where: { id },
            include: {
                members: {
                    include: { user: true },
                },
            },
        });
    }
    async getMembersFromKeto(groupId) {
        return this.ketoService.expandPermission({
            namespace: 'Group',
            object: groupId,
            relation: 'member',
        });
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        keto_service_1.KetoService,
        event_publisher_service_1.EventPublisherService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map