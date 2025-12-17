import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventStoreService } from './event-store.service';
import { DomainEvent } from './interfaces/event.interface';
export declare class EventPublisherService {
    private readonly eventStore;
    private readonly eventEmitter;
    private readonly logger;
    constructor(eventStore: EventStoreService, eventEmitter: EventEmitter2);
    publish(params: Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>): Promise<DomainEvent>;
    publishAll(events: Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>[]): Promise<DomainEvent[]>;
}
