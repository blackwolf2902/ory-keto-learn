import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DomainEvent, AggregateType, EventType } from './interfaces/event.interface';
import { randomUUID } from 'crypto';

/**
 * ============================================
 * EVENT STORE SERVICE
 * ============================================
 *
 * Core service for persisting and retrieving domain events.
 *
 * CONCEPT: Event Store
 * The event store is an append-only log of all domain events.
 * Events are immutable once stored - we never update or delete them.
 *
 * KEY OPERATIONS:
 * 1. append() - Store a new event
 * 2. getEvents() - Get all events for an aggregate
 * 3. getEventsByType() - Get events of a specific type
 * 4. getAllEvents() - Get all events (with optional time filter)
 */
@Injectable()
export class EventStoreService {
    private readonly logger = new Logger(EventStoreService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Append a new event to the event store
     *
     * CONCEPT: Event Immutability
     * Events represent facts that happened - they cannot be changed.
     * We only ever append new events, never update or delete.
     */
    async append(
        params: Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>,
    ): Promise<DomainEvent> {
        const { aggregateType, aggregateId, eventType, userId, payload, metadata } = params;

        // Get the next version number for this aggregate
        const lastEvent = await this.prisma.event.findFirst({
            where: { aggregateId },
            orderBy: { version: 'desc' },
        });
        const nextVersion = (lastEvent?.version ?? 0) + 1;

        // Create the event
        const event = await this.prisma.event.create({
            data: {
                eventType,
                aggregateType,
                aggregateId,
                version: nextVersion,
                userId,
                payload: payload as object,
                metadata: metadata as object | undefined,
            },
        });

        const domainEvent: DomainEvent = {
            eventId: event.id,
            eventType: event.eventType,
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
            version: event.version,
            timestamp: event.createdAt,
            userId: event.userId,
            payload: event.payload as Record<string, unknown>,
            metadata: event.metadata as Record<string, unknown> | undefined,
        };

        this.logger.debug(
            `Event stored: ${eventType} for ${aggregateType}:${aggregateId} (v${nextVersion})`,
        );

        return domainEvent;
    }

    /**
     * Get all events for a specific aggregate
     *
     * CONCEPT: Event Replay
     * By getting all events for an aggregate, we can rebuild its state
     * by replaying them in order.
     */
    async getEvents(aggregateId: string): Promise<DomainEvent[]> {
        const events = await this.prisma.event.findMany({
            where: { aggregateId },
            orderBy: { version: 'asc' },
        });

        return events.map(this.mapTodomainEvent);
    }

    /**
     * Get events of a specific type
     *
     * Useful for analytics and projections.
     * Example: Get all 'DocumentShared' events to build a sharing report.
     */
    async getEventsByType(
        eventType: EventType,
        options?: { since?: Date; limit?: number },
    ): Promise<DomainEvent[]> {
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

    /**
     * Get events for a specific aggregate type
     *
     * Example: Get all Document events, or all Folder events.
     */
    async getEventsByAggregateType(
        aggregateType: AggregateType,
        options?: { since?: Date; limit?: number },
    ): Promise<DomainEvent[]> {
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

    /**
     * Get all events in the system
     *
     * CONCEPT: Audit Log
     * This provides a complete audit trail of everything that happened.
     */
    async getAllEvents(options?: { since?: Date; limit?: number }): Promise<DomainEvent[]> {
        const events = await this.prisma.event.findMany({
            where: options?.since ? { createdAt: { gte: options.since } } : undefined,
            orderBy: { createdAt: 'asc' },
            take: options?.limit ?? 100,
        });

        return events.map(this.mapTodomainEvent);
    }

    /**
     * Get the current version of an aggregate
     */
    async getAggregateVersion(aggregateId: string): Promise<number> {
        const lastEvent = await this.prisma.event.findFirst({
            where: { aggregateId },
            orderBy: { version: 'desc' },
        });
        return lastEvent?.version ?? 0;
    }

    /**
     * Map Prisma event to DomainEvent interface
     */
    private mapTodomainEvent(event: {
        id: string;
        eventType: string;
        aggregateType: string;
        aggregateId: string;
        version: number;
        userId: string;
        payload: unknown;
        metadata: unknown;
        createdAt: Date;
    }): DomainEvent {
        return {
            eventId: event.id,
            eventType: event.eventType,
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
            version: event.version,
            timestamp: event.createdAt,
            userId: event.userId,
            payload: event.payload as Record<string, unknown>,
            metadata: event.metadata as Record<string, unknown> | undefined,
        };
    }
}
