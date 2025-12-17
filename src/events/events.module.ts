import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventStoreService } from './event-store.service';
import { EventPublisherService } from './event-publisher.service';
import { EventsController } from './events.controller';

/**
 * ============================================
 * EVENTS MODULE
 * ============================================
 *
 * Global module providing event sourcing infrastructure.
 *
 * Exports:
 * - EventStoreService: For querying events directly
 * - EventPublisherService: For publishing new events
 *
 * All other modules inject EventPublisherService to record
 * domain events when state changes occur.
 */
@Global()
@Module({
    imports: [
        EventEmitterModule.forRoot({
            // Use wildcard listeners for debugging
            wildcard: true,
            // Show errors in console during development
            verboseMemoryLeak: true,
        }),
    ],
    controllers: [EventsController],
    providers: [EventStoreService, EventPublisherService],
    exports: [EventStoreService, EventPublisherService],
})
export class EventsModule { }
