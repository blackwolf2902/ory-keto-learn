import { Injectable, Logger } from '@nestjs/common';
import { eq, desc, gte, and } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { events } from '../drizzle/schema';
import { DomainEvent, AggregateType, EventType } from './interfaces/event.interface';

/**
 * ============================================
 * EVENT STORE SERVICE
 * ============================================
 *
 * Core service for persisting and retrieving domain events.
 */
@Injectable()
export class EventStoreService {
    private readonly logger = new Logger(EventStoreService.name);

    constructor(private readonly drizzle: DrizzleService) { }

    /**
     * Append a new event to the event store
     */
    async append(
        params: Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>,
    ): Promise<DomainEvent> {
        const { aggregateType, aggregateId, eventType, userId, payload, metadata } = params;

        // Get the next version number for this aggregate
        const [lastEvent] = await this.drizzle.db
            .select({ version: events.version })
            .from(events)
            .where(eq(events.aggregateId, aggregateId))
            .orderBy(desc(events.version))
            .limit(1);
        const nextVersion = (lastEvent?.version ?? 0) + 1;

        // Create the event
        const [event] = await this.drizzle.db.insert(events).values({
            eventType,
            aggregateType,
            aggregateId,
            version: nextVersion,
            userId,
            payload: payload as object,
            metadata: metadata as object,
        }).returning();

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
     */
    async getEvents(aggregateId: string): Promise<DomainEvent[]> {
        const result = await this.drizzle.db
            .select()
            .from(events)
            .where(eq(events.aggregateId, aggregateId))
            .orderBy(events.version);

        return result.map(this.mapToDomainEvent);
    }

    /**
     * Get events of a specific type
     */
    async getEventsByType(
        eventType: EventType,
        options?: { since?: Date; limit?: number },
    ): Promise<DomainEvent[]> {
        const conditions = [eq(events.eventType, eventType)];
        if (options?.since) {
            conditions.push(gte(events.createdAt, options.since));
        }

        let query = this.drizzle.db
            .select()
            .from(events)
            .where(and(...conditions))
            .orderBy(events.createdAt);

        if (options?.limit) {
            query = query.limit(options.limit) as typeof query;
        }

        const result = await query;
        return result.map(this.mapToDomainEvent);
    }

    /**
     * Get events for a specific aggregate type
     */
    async getEventsByAggregateType(
        aggregateType: AggregateType,
        options?: { since?: Date; limit?: number },
    ): Promise<DomainEvent[]> {
        const conditions = [eq(events.aggregateType, aggregateType)];
        if (options?.since) {
            conditions.push(gte(events.createdAt, options.since));
        }

        let query = this.drizzle.db
            .select()
            .from(events)
            .where(and(...conditions))
            .orderBy(events.createdAt);

        if (options?.limit) {
            query = query.limit(options.limit) as typeof query;
        }

        const result = await query;
        return result.map(this.mapToDomainEvent);
    }

    /**
     * Get all events in the system
     */
    async getAllEvents(options?: { since?: Date; limit?: number }): Promise<DomainEvent[]> {
        const conditions = options?.since ? [gte(events.createdAt, options.since)] : [];

        const result = conditions.length > 0
            ? await this.drizzle.db
                .select()
                .from(events)
                .where(and(...conditions))
                .orderBy(events.createdAt)
                .limit(options?.limit ?? 100)
            : await this.drizzle.db
                .select()
                .from(events)
                .orderBy(events.createdAt)
                .limit(options?.limit ?? 100);

        return result.map(this.mapToDomainEvent);
    }

    /**
     * Get the current version of an aggregate
     */
    async getAggregateVersion(aggregateId: string): Promise<number> {
        const [lastEvent] = await this.drizzle.db
            .select({ version: events.version })
            .from(events)
            .where(eq(events.aggregateId, aggregateId))
            .orderBy(desc(events.version))
            .limit(1);
        return lastEvent?.version ?? 0;
    }

    /**
     * Map event to DomainEvent interface
     */
    private mapToDomainEvent(event: {
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
