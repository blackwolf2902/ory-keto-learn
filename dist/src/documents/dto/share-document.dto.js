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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareDocumentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ShareDocumentDto {
    userId;
    groupId;
    relation;
}
exports.ShareDocumentDto = ShareDocumentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'user-uuid-here',
        description: 'User ID to share with (mutually exclusive with groupId)'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ShareDocumentDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'group-uuid-here',
        description: 'Group ID to share with (all members get access)'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ShareDocumentDto.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'viewer',
        enum: ['viewer', 'editor'],
        description: 'Permission level to grant'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['viewer', 'editor']),
    __metadata("design:type", String)
], ShareDocumentDto.prototype, "relation", void 0);
//# sourceMappingURL=share-document.dto.js.map