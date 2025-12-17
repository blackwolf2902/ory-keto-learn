import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventStoreService } from './event-store.service';
import { DomainEvent } from './interfaces/event.interface';

/**
 * ============================================
 * EVENT PUBLISHER SERVICE
 * ============================================
 *
 * Service for publishing domain events.
 * Combines event persistence with in-process event emission.
 *
 * CONCEPT: Event Publishing
 * When something happens in the domain:
 * 1. Create an event describing what happened
 * 2. Persist it to the event store (durability)
 * 3. Emit it in-process (for immediate reactions)
 *
 * This allows:
 * - Audit trail (persisted events)
 * - Real-time reactions (event handlers)
 * - Eventual consistency patterns
 */
@Injectable()
export class EventPublisherService {
    private readonly logger = new Logger(EventPublisherService.name);

    constructor(
        private readonly eventStore: EventStoreService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    /**
     * Publish a domain event
     *
     * This method:
     * 1. Persists the event to the store
     * 2. Emits it for any listeners
     */
    async publish(
        params: Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>,
    ): Promise<DomainEvent> {
        // Persist the event first (durability)
        const event = await this.eventStore.append(params);

        // Emit the event for any listeners
        this.eventEmitter.emit(event.eventType, event);
        this.eventEmitter.emit('event.*', event); // Wildcard for logging/debugging

        this.logger.debug(`Published event: ${event.eventType} (${event.eventId})`);

        return event;
    }

    /**
     * Publish multiple events in order
     *
     * Useful when a single operation produces multiple events.
     */
    async publishAll(
        events: Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>[],
    ): Promise<DomainEvent[]> {
        const publishedEvents: DomainEvent[] = [];

        for (const eventParams of events) {
            const event = await this.publish(eventParams);
            publishedEvents.push(event);
        }

        return publishedEvents;
    }
}
