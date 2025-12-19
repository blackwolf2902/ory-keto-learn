import { DrizzleService } from '../drizzle/drizzle.service';
import { DomainEvent, AggregateType, EventType } from './interfaces/event.interface';
export declare class EventStoreService {
    private readonly drizzle;
    private readonly logger;
    constructor(drizzle: DrizzleService);
    append(params: Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>): Promise<DomainEvent>;
    getEvents(aggregateId: string): Promise<DomainEvent[]>;
    getEventsByType(eventType: EventType, options?: {
        since?: Date;
        limit?: number;
    }): Promise<DomainEvent[]>;
    getEventsByAggregateType(aggregateType: AggregateType, options?: {
        since?: Date;
        limit?: number;
    }): Promise<DomainEvent[]>;
    getAllEvents(options?: {
        since?: Date;
        limit?: number;
    }): Promise<DomainEvent[]>;
    getAggregateVersion(aggregateId: string): Promise<number>;
    private mapToDomainEvent;
}
