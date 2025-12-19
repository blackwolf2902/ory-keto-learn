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
var EventStoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const schema_1 = require("../drizzle/schema");
let EventStoreService = EventStoreService_1 = class EventStoreService {
    drizzle;
    logger = new common_1.Logger(EventStoreService_1.name);
    constructor(drizzle) {
        this.drizzle = drizzle;
    }
    async append(params) {
        const { aggregateType, aggregateId, eventType, userId, payload, metadata } = params;
        const [lastEvent] = await this.drizzle.db
            .select({ version: schema_1.events.version })
            .from(schema_1.events)
            .where((0, drizzle_orm_1.eq)(schema_1.events.aggregateId, aggregateId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.events.version))
            .limit(1);
        const nextVersion = (lastEvent?.version ?? 0) + 1;
        const [event] = await this.drizzle.db.insert(schema_1.events).values({
            eventType,
            aggregateType,
            aggregateId,
            version: nextVersion,
            userId,
            payload: payload,
            metadata: metadata,
        }).returning();
        const domainEvent = {
            eventId: event.id,
            eventType: event.eventType,
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
            version: event.version,
            timestamp: event.createdAt,
            userId: event.userId,
            payload: event.payload,
            metadata: event.metadata,
        };
        this.logger.debug(`Event stored: ${eventType} for ${aggregateType}:${aggregateId} (v${nextVersion})`);
        return domainEvent;
    }
    async getEvents(aggregateId) {
        const result = await this.drizzle.db
            .select()
            .from(schema_1.events)
            .where((0, drizzle_orm_1.eq)(schema_1.events.aggregateId, aggregateId))
            .orderBy(schema_1.events.version);
        return result.map(this.mapToDomainEvent);
    }
    async getEventsByType(eventType, options) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.events.eventType, eventType)];
        if (options?.since) {
            conditions.push((0, drizzle_orm_1.gte)(schema_1.events.createdAt, options.since));
        }
        let query = this.drizzle.db
            .select()
            .from(schema_1.events)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(schema_1.events.createdAt);
        if (options?.limit) {
            query = query.limit(options.limit);
        }
        const result = await query;
        return result.map(this.mapToDomainEvent);
    }
    async getEventsByAggregateType(aggregateType, options) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.events.aggregateType, aggregateType)];
        if (options?.since) {
            conditions.push((0, drizzle_orm_1.gte)(schema_1.events.createdAt, options.since));
        }
        let query = this.drizzle.db
            .select()
            .from(schema_1.events)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(schema_1.events.createdAt);
        if (options?.limit) {
            query = query.limit(options.limit);
        }
        const result = await query;
        return result.map(this.mapToDomainEvent);
    }
    async getAllEvents(options) {
        const conditions = options?.since ? [(0, drizzle_orm_1.gte)(schema_1.events.createdAt, options.since)] : [];
        const result = conditions.length > 0
            ? await this.drizzle.db
                .select()
                .from(schema_1.events)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy(schema_1.events.createdAt)
                .limit(options?.limit ?? 100)
            : await this.drizzle.db
                .select()
                .from(schema_1.events)
                .orderBy(schema_1.events.createdAt)
                .limit(options?.limit ?? 100);
        return result.map(this.mapToDomainEvent);
    }
    async getAggregateVersion(aggregateId) {
        const [lastEvent] = await this.drizzle.db
            .select({ version: schema_1.events.version })
            .from(schema_1.events)
            .where((0, drizzle_orm_1.eq)(schema_1.events.aggregateId, aggregateId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.events.version))
            .limit(1);
        return lastEvent?.version ?? 0;
    }
    mapToDomainEvent(event) {
        return {
            eventId: event.id,
            eventType: event.eventType,
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
            version: event.version,
            timestamp: event.createdAt,
            userId: event.userId,
            payload: event.payload,
            metadata: event.metadata,
        };
    }
};
exports.EventStoreService = EventStoreService;
exports.EventStoreService = EventStoreService = EventStoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService])
], EventStoreService);
//# sourceMappingURL=event-store.service.js.map