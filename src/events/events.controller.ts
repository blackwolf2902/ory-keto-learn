import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EventStoreService } from './event-store.service';
import type { AggregateType, EventType } from './interfaces/event.interface';

/**
 * ============================================
 * EVENTS CONTROLLER
 * ============================================
 *
 * REST API for querying the event store.
 *
 * LEARNING: Event Store Queries
 * 
 * Common use cases:
 * 1. /events/audit - Get recent events (audit log)
 * 2. /events/Document/{id} - Get history of a document
 * 3. /events/type/DocumentShared - Find all sharing events
 */
@ApiTags('Events')
@Controller('events')
export class EventsController {
    constructor(private readonly eventStore: EventStoreService) { }

    /**
     * Get audit log (all recent events)
     */
    @Get('audit')
    @ApiOperation({
        summary: 'Get audit log',
        description: 'Returns recent events across all aggregates',
    })
    @ApiQuery({ name: 'since', required: false, type: String, description: 'ISO date string' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max events to return' })
    async getAuditLog(
        @Query('since') since?: string,
        @Query('limit') limit?: string,
    ) {
        const options = {
            since: since ? new Date(since) : undefined,
            limit: limit ? parseInt(limit, 10) : 50,
        };

        const events = await this.eventStore.getAllEvents(options);

        return {
            count: events.length,
            events,
        };
    }

    /**
     * Get all events for a specific aggregate
     */
    @Get(':aggregateType/:aggregateId')
    @ApiOperation({
        summary: 'Get aggregate history',
        description: 'Returns all events for a specific entity (Document, Folder, Group)',
    })
    async getAggregateHistory(
        @Param('aggregateType') aggregateType: string,
        @Param('aggregateId') aggregateId: string,
    ) {
        const events = await this.eventStore.getEvents(aggregateId);

        // Filter by aggregate type to ensure we only return events for the correct type
        const filteredEvents = events.filter((e) => e.aggregateType === aggregateType);

        return {
            aggregateType,
            aggregateId,
            eventCount: filteredEvents.length,
            currentVersion: filteredEvents.length > 0
                ? filteredEvents[filteredEvents.length - 1].version
                : 0,
            events: filteredEvents,
        };
    }

    /**
     * Get events by type
     */
    @Get('type/:eventType')
    @ApiOperation({
        summary: 'Get events by type',
        description: 'Returns all events of a specific type (e.g., DocumentCreated, FolderShared)',
    })
    @ApiQuery({ name: 'since', required: false, type: String })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getEventsByType(
        @Param('eventType') eventType: string,
        @Query('since') since?: string,
        @Query('limit') limit?: string,
    ) {
        const options = {
            since: since ? new Date(since) : undefined,
            limit: limit ? parseInt(limit, 10) : 50,
        };

        const events = await this.eventStore.getEventsByType(eventType as EventType, options);

        return {
            eventType,
            count: events.length,
            events,
        };
    }

    /**
     * Get events by aggregate type
     */
    @Get('aggregate/:aggregateType')
    @ApiOperation({
        summary: 'Get events by aggregate type',
        description: 'Returns all events for an aggregate type (Document, Folder, Group)',
    })
    @ApiQuery({ name: 'since', required: false, type: String })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getEventsByAggregateType(
        @Param('aggregateType') aggregateType: string,
        @Query('since') since?: string,
        @Query('limit') limit?: string,
    ) {
        const options = {
            since: since ? new Date(since) : undefined,
            limit: limit ? parseInt(limit, 10) : 50,
        };

        const events = await this.eventStore.getEventsByAggregateType(aggregateType as AggregateType, options);

        return {
            aggregateType,
            count: events.length,
            events,
        };
    }
}

