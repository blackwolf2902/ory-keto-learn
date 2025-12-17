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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const event_store_service_1 = require("./event-store.service");
let EventsController = class EventsController {
    eventStore;
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    async getAuditLog(since, limit) {
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
    async getAggregateHistory(aggregateType, aggregateId) {
        const events = await this.eventStore.getEvents(aggregateId);
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
    async getEventsByType(eventType, since, limit) {
        const options = {
            since: since ? new Date(since) : undefined,
            limit: limit ? parseInt(limit, 10) : 50,
        };
        const events = await this.eventStore.getEventsByType(eventType, options);
        return {
            eventType,
            count: events.length,
            events,
        };
    }
    async getEventsByAggregateType(aggregateType, since, limit) {
        const options = {
            since: since ? new Date(since) : undefined,
            limit: limit ? parseInt(limit, 10) : 50,
        };
        const events = await this.eventStore.getEventsByAggregateType(aggregateType, options);
        return {
            aggregateType,
            count: events.length,
            events,
        };
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Get)('audit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get audit log',
        description: 'Returns recent events across all aggregates',
    }),
    (0, swagger_1.ApiQuery)({ name: 'since', required: false, type: String, description: 'ISO date string' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Max events to return' }),
    __param(0, (0, common_1.Query)('since')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getAuditLog", null);
__decorate([
    (0, common_1.Get)(':aggregateType/:aggregateId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get aggregate history',
        description: 'Returns all events for a specific entity (Document, Folder, Group)',
    }),
    __param(0, (0, common_1.Param)('aggregateType')),
    __param(1, (0, common_1.Param)('aggregateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getAggregateHistory", null);
__decorate([
    (0, common_1.Get)('type/:eventType'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get events by type',
        description: 'Returns all events of a specific type (e.g., DocumentCreated, FolderShared)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'since', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('eventType')),
    __param(1, (0, common_1.Query)('since')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getEventsByType", null);
__decorate([
    (0, common_1.Get)('aggregate/:aggregateType'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get events by aggregate type',
        description: 'Returns all events for an aggregate type (Document, Folder, Group)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'since', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('aggregateType')),
    __param(1, (0, common_1.Query)('since')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getEventsByAggregateType", null);
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)('Events'),
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [event_store_service_1.EventStoreService])
], EventsController);
//# sourceMappingURL=events.controller.js.map