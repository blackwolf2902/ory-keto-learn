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
var EventPublisherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPublisherService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_store_service_1 = require("./event-store.service");
let EventPublisherService = EventPublisherService_1 = class EventPublisherService {
    eventStore;
    eventEmitter;
    logger = new common_1.Logger(EventPublisherService_1.name);
    constructor(eventStore, eventEmitter) {
        this.eventStore = eventStore;
        this.eventEmitter = eventEmitter;
    }
    async publish(params) {
        const event = await this.eventStore.append(params);
        this.eventEmitter.emit(event.eventType, event);
        this.eventEmitter.emit('event.*', event);
        this.logger.debug(`Published event: ${event.eventType} (${event.eventId})`);
        return event;
    }
    async publishAll(events) {
        const publishedEvents = [];
        for (const eventParams of events) {
            const event = await this.publish(eventParams);
            publishedEvents.push(event);
        }
        return publishedEvents;
    }
};
exports.EventPublisherService = EventPublisherService;
exports.EventPublisherService = EventPublisherService = EventPublisherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_store_service_1.EventStoreService,
        event_emitter_1.EventEmitter2])
], EventPublisherService);
//# sourceMappingURL=event-publisher.service.js.map