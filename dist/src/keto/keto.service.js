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
var KetoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KetoService = void 0;
const common_1 = require("@nestjs/common");
const keto_client_1 = require("@ory/keto-client");
let KetoService = KetoService_1 = class KetoService {
    logger = new common_1.Logger(KetoService_1.name);
    permissionApi;
    relationshipApi;
    constructor() {
        const readConfig = new keto_client_1.Configuration({
            basePath: process.env.KETO_READ_URL || 'http://localhost:4466',
        });
        const writeConfig = new keto_client_1.Configuration({
            basePath: process.env.KETO_WRITE_URL || 'http://localhost:4467',
        });
        this.permissionApi = new keto_client_1.PermissionApi(readConfig);
        this.relationshipApi = new keto_client_1.RelationshipApi(writeConfig);
    }
    async onModuleInit() {
        this.logger.log('KetoService initialized');
        this.logger.log(`Read API: ${process.env.KETO_READ_URL || 'http://localhost:4466'}`);
        this.logger.log(`Write API: ${process.env.KETO_WRITE_URL || 'http://localhost:4467'}`);
    }
    async createRelation(params) {
        const { namespace, object, relation, subjectId, subjectSet } = params;
        const relationship = {
            namespace,
            object,
            relation,
            subject_id: subjectId,
            subject_set: subjectSet,
        };
        try {
            await this.relationshipApi.createRelationship({ createRelationshipBody: relationship });
            this.logger.debug(`Created relation: ${namespace}:${object}#${relation}@${subjectId || `${subjectSet?.namespace}:${subjectSet?.object}#${subjectSet?.relation}`}`);
        }
        catch (error) {
            this.logger.error(`Failed to create relation: ${JSON.stringify(error)}`);
            throw error;
        }
    }
    async deleteRelation(params) {
        const { namespace, object, relation, subjectId, subjectSet } = params;
        try {
            await this.relationshipApi.deleteRelationships({
                namespace,
                object,
                relation,
                subjectId,
                subjectSetNamespace: subjectSet?.namespace,
                subjectSetObject: subjectSet?.object,
                subjectSetRelation: subjectSet?.relation,
            });
            this.logger.debug(`Deleted relation: ${namespace}:${object}#${relation}@${subjectId || `${subjectSet?.namespace}:${subjectSet?.object}#${subjectSet?.relation}`}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete relation: ${JSON.stringify(error)}`);
            throw error;
        }
    }
    async deleteAllRelationsForObject(namespace, object) {
        try {
            await this.relationshipApi.deleteRelationships({
                namespace,
                object,
            });
            this.logger.debug(`Deleted all relations for ${namespace}:${object}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete relations: ${JSON.stringify(error)}`);
            throw error;
        }
    }
    permissionHierarchy = {
        'view': ['viewer', 'editor', 'owner'],
        'edit': ['editor', 'owner'],
        'delete': ['owner'],
        'share': ['owner'],
    };
    async checkPermission(params) {
        const { namespace, object, relation, subjectId } = params;
        const impliedRelations = this.permissionHierarchy[relation] || [relation];
        this.logger.debug(`Permission check: ${namespace}:${object}#${relation}@${subjectId} (checking: ${impliedRelations.join(', ')})`);
        for (const rel of impliedRelations) {
            try {
                const response = await this.permissionApi.checkPermission({
                    namespace,
                    object,
                    relation: rel,
                    subjectId,
                });
                if (response.data.allowed === true) {
                    this.logger.debug(`Permission GRANTED via ${rel} relation`);
                    return true;
                }
            }
            catch (error) {
                if (!this.isAxiosError(error) || error.response?.status !== 403) {
                    this.logger.error(`Permission check failed: ${JSON.stringify(error)}`);
                    throw error;
                }
            }
        }
        this.logger.debug(`Permission DENIED: no matching relation found`);
        return false;
    }
    async expandPermission(params) {
        const { namespace, object, relation } = params;
        try {
            const response = await this.permissionApi.expandPermissions({
                namespace,
                object,
                relation,
            });
            const subjects = [];
            this.extractSubjectsFromTree(response.data, subjects);
            return subjects;
        }
        catch (error) {
            this.logger.error(`Permission expansion failed: ${JSON.stringify(error)}`);
            throw error;
        }
    }
    async getRelationships(params) {
        const { namespace, object } = params;
        try {
            const response = await this.relationshipApi.getRelationships({
                namespace,
                object,
            });
            return response.data.relation_tuples || [];
        }
        catch (error) {
            this.logger.error(`Failed to get relationships: ${JSON.stringify(error)}`);
            throw error;
        }
    }
    userSubject(userId) {
        return `User:${userId}`;
    }
    groupMembersSubjectSet(groupId) {
        return {
            namespace: 'Group',
            object: groupId,
            relation: 'member',
        };
    }
    extractSubjectsFromTree(node, subjects) {
        if (!node || typeof node !== 'object')
            return;
        const nodeObj = node;
        if (nodeObj.subject_id && typeof nodeObj.subject_id === 'string') {
            subjects.push(nodeObj.subject_id);
        }
        if (nodeObj.subject_set && typeof nodeObj.subject_set === 'object') {
            const subjectSet = nodeObj.subject_set;
            subjects.push(`${subjectSet.namespace}:${subjectSet.object}#${subjectSet.relation}`);
        }
        if (nodeObj.children && Array.isArray(nodeObj.children)) {
            for (const child of nodeObj.children) {
                this.extractSubjectsFromTree(child, subjects);
            }
        }
    }
    isAxiosError(error) {
        return typeof error === 'object' && error !== null && 'response' in error;
    }
};
exports.KetoService = KetoService;
exports.KetoService = KetoService = KetoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], KetoService);
//# sourceMappingURL=keto.service.js.map