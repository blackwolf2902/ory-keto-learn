import { OnModuleInit } from '@nestjs/common';
import { Relationship } from '@ory/keto-client';
export declare class KetoService implements OnModuleInit {
    private readonly logger;
    private permissionApi;
    private relationshipApi;
    constructor();
    onModuleInit(): Promise<void>;
    createRelation(params: {
        namespace: string;
        object: string;
        relation: string;
        subjectId?: string;
        subjectSet?: {
            namespace: string;
            object: string;
            relation: string;
        };
    }): Promise<void>;
    deleteRelation(params: {
        namespace: string;
        object: string;
        relation: string;
        subjectId?: string;
        subjectSet?: {
            namespace: string;
            object: string;
            relation: string;
        };
    }): Promise<void>;
    deleteAllRelationsForObject(namespace: string, object: string): Promise<void>;
    private readonly permissionHierarchy;
    checkPermission(params: {
        namespace: string;
        object: string;
        relation: string;
        subjectId: string;
    }): Promise<boolean>;
    expandPermission(params: {
        namespace: string;
        object: string;
        relation: string;
    }): Promise<string[]>;
    getRelationships(params: {
        namespace: string;
        object: string;
    }): Promise<Relationship[]>;
    userSubject(userId: string): string;
    groupMembersSubjectSet(groupId: string): {
        namespace: string;
        object: string;
        relation: string;
    };
    private extractSubjectsFromTree;
    private isAxiosError;
}
