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
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const schema_1 = require("../drizzle/schema");
const keto_service_1 = require("../keto/keto.service");
const event_publisher_service_1 = require("../events/event-publisher.service");
const group_events_1 = require("./events/group.events");
let GroupsService = class GroupsService {
    drizzle;
    ketoService;
    eventPublisher;
    constructor(drizzle, ketoService, eventPublisher) {
        this.drizzle = drizzle;
        this.ketoService = ketoService;
        this.eventPublisher = eventPublisher;
    }
    async create(createGroupDto, userId) {
        const [group] = await this.drizzle.db.insert(schema_1.groups).values({
            name: createGroupDto.name,
            description: createGroupDto.description,
            creatorId: userId,
        }).returning();
        if (userId) {
            await this.eventPublisher.publish((0, group_events_1.createGroupCreatedEvent)(group.id, userId, {
                name: group.name,
                description: group.description ?? undefined,
            }));
        }
        return group;
    }
    async addMember(groupId, addMemberDto) {
        const [group] = await this.drizzle.db.select().from(schema_1.groups).where((0, drizzle_orm_1.eq)(schema_1.groups.id, groupId));
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        const [user] = await this.drizzle.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, addMemberDto.userId));
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const [membership] = await this.drizzle.db.insert(schema_1.groupMembers).values({
            groupId,
            userId: addMemberDto.userId,
            role: addMemberDto.role || 'member',
        }).returning();
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
        return { ...membership, user, group };
    }
    async removeMember(groupId, userId) {
        await this.drizzle.db.delete(schema_1.groupMembers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.groupMembers.userId, userId), (0, drizzle_orm_1.eq)(schema_1.groupMembers.groupId, groupId)));
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
        return this.drizzle.db.query.groups.findMany({
            with: {
                members: {
                    with: { user: true },
                },
            },
        });
    }
    async findAllByCreator(creatorId) {
        return this.drizzle.db.query.groups.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.groups.creatorId, creatorId),
            with: {
                members: {
                    with: { user: true },
                },
            },
        });
    }
    async findOne(id) {
        return this.drizzle.db.query.groups.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.groups.id, id),
            with: {
                members: {
                    with: { user: true },
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
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService,
        keto_service_1.KetoService,
        event_publisher_service_1.EventPublisherService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map