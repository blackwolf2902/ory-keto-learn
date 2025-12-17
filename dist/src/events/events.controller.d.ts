import { EventStoreService } from './event-store.service';
export declare class EventsController {
    private readonly eventStore;
    constructor(eventStore: EventStoreService);
    getAuditLog(since?: string, limit?: string): Promise<{
        count: number;
        events: import("./interfaces/event.interface").DomainEvent[];
    }>;
    getAggregateHistory(aggregateType: string, aggregateId: string): Promise<{
        aggregateType: string;
        aggregateId: string;
        eventCount: number;
        currentVersion: number;
        events: import("./interfaces/event.interface").DomainEvent[];
    }>;
    getEventsByType(eventType: string, since?: string, limit?: string): Promise<{
        eventType: string;
        count: number;
        events: import("./interfaces/event.interface").DomainEvent[];
    }>;
    getEventsByAggregateType(aggregateType: string, since?: string, limit?: string): Promise<{
        aggregateType: string;
        count: number;
        events: import("./interfaces/event.interface").DomainEvent[];
    }>;
}
