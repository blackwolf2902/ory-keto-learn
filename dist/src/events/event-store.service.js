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
const prisma_service_1 = require("../prisma.service");
let EventStoreService = EventStoreService_1 = class EventStoreService {
    prisma;
    logger = new common_1.Logger(EventStoreService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async append(params) {
        const { aggregateType, aggregateId, eventType, userId, payload, metadata } = params;
        const lastEvent = await this.prisma.event.findFirst({
            where: { aggregateId },
            orderBy: { version: 'desc' },
        });
        const nextVersion = (lastEvent?.version ?? 0) + 1;
        const event = await this.prisma.event.create({
            data: {
                eventType,
                aggregateType,
                aggregateId,
                version: nextVersion,
                userId,
                payload: payload,
                metadata: metadata,
            },
        });
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
        const events = await this.prisma.event.findMany({
            where: { aggregateId },
            orderBy: { version: 'asc' },
        });
        return events.map(this.mapTodomainEvent);
    }
    async getEventsByType(eventType, options) {
        const events = await this.prisma.event.findMany({
            where: {
                eventType,
                ...(options?.since && { createdAt: { gte: options.since } }),
            },
            orderBy: { createdAt: 'asc' },
            take: options?.limit,
        });
        return events.map(this.mapTodomainEvent);
    }
    async getEventsByAggregateType(aggregateType, options) {
        const events = await this.prisma.event.findMany({
            where: {
                aggregateType,
                ...(options?.since && { createdAt: { gte: options.since } }),
            },
            orderBy: { createdAt: 'asc' },
            take: options?.limit,
        });
        return events.map(this.mapTodomainEvent);
    }
    async getAllEvents(options) {
        const events = await this.prisma.event.findMany({
            where: options?.since ? { createdAt: { gte: options.since } } : undefined,
            orderBy: { createdAt: 'asc' },
            take: options?.limit ?? 100,
        });
        return events.map(this.mapTodomainEvent);
    }
    async getAggregateVersion(aggregateId) {
        const lastEvent = await this.prisma.event.findFirst({
            where: { aggregateId },
            orderBy: { version: 'desc' },
        });
        return lastEvent?.version ?? 0;
    }
    mapTodomainEvent(event) {
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventStoreService);
//# sourceMappingURL=event-store.service.js.map