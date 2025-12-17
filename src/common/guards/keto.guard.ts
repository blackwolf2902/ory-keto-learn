import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { KetoService } from '../../keto/keto.service';
import {
    PERMISSION_METADATA_KEY,
    SKIP_PERMISSION_CHECK_KEY,
    PERMISSION_ANY_METADATA_KEY,
    PERMISSION_ALL_METADATA_KEY,
    PermissionRequirement,
} from '../decorators/permission.decorator';

/**
 * ============================================
 * KETO GUARD - Authorization Enforcement
 * ============================================
 * 
 * CONCEPT: NestJS Guards for Authorization
 * 
 * Guards are executed BEFORE the route handler.
 * They decide whether the request should proceed.
 * 
 * Flow:
 * 1. Request arrives at controller
 * 2. Guard intercepts and reads permission decorators
 * 3. Guard extracts user ID and object ID from request
 * 4. Guard calls KetoService.checkPermission()
 * 5. If allowed → proceed to handler
 * 6. If denied → throw ForbiddenException
 * 
 * IMPORTANT: User identification
 * For this learning project, we simulate authentication
 * by reading user ID from the 'x-user-id' header.
 * In production, integrate with Ory Kratos or your auth system.
 */
@Injectable()
export class KetoGuard implements CanActivate {
    private readonly logger = new Logger(KetoGuard.name);

    constructor(
        private readonly ketoService: KetoService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if permission check should be skipped
        const skipCheck = this.reflector.getAllAndOverride<boolean>(
            SKIP_PERMISSION_CHECK_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (skipCheck) {
            this.logger.debug('Permission check skipped due to @SkipPermissionCheck decorator');
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();

        // Extract user ID from request
        // In production: Get from JWT, session, or Ory Kratos
        const userId = this.extractUserId(request);
        if (!userId) {
            this.logger.warn('No user ID found in request');
            throw new ForbiddenException('Authentication required');
        }

        // Check single permission requirement
        const singleRequirement = this.reflector.get<PermissionRequirement>(
            PERMISSION_METADATA_KEY,
            context.getHandler(),
        );

        if (singleRequirement) {
            const objectId = this.extractObjectId(request, singleRequirement);
            return this.checkPermission(singleRequirement, objectId, userId);
        }

        // Check ANY permission (OR logic)
        const anyRequirements = this.reflector.get<PermissionRequirement[]>(
            PERMISSION_ANY_METADATA_KEY,
            context.getHandler(),
        );

        if (anyRequirements && anyRequirements.length > 0) {
            return this.checkAnyPermission(anyRequirements, request, userId);
        }

        // Check ALL permissions (AND logic)
        const allRequirements = this.reflector.get<PermissionRequirement[]>(
            PERMISSION_ALL_METADATA_KEY,
            context.getHandler(),
        );

        if (allRequirements && allRequirements.length > 0) {
            return this.checkAllPermissions(allRequirements, request, userId);
        }

        // No permission requirements found - allow by default
        // Consider making this stricter in production (deny by default)
        this.logger.debug('No permission requirements found, allowing request');
        return true;
    }

    /**
     * Extract user ID from request
     * 
     * LEARNING NOTE: Authentication vs Authorization
     * - Authentication: WHO are you? (handled elsewhere)
     * - Authorization: WHAT can you do? (handled by Keto)
     * 
     * We simulate auth by reading x-user-id header.
     * In production, integrate with your auth system.
     */
    private extractUserId(request: Request): string | null {
        // Option 1: Header (for development/testing)
        const headerUserId = request.headers['x-user-id'];
        if (headerUserId) {
            return Array.isArray(headerUserId) ? headerUserId[0] : headerUserId;
        }

        // Option 2: From user object (set by auth middleware)
        const user = (request as unknown as { user?: { id?: string } }).user;
        if (user?.id) {
            return user.id;
        }

        return null;
    }

    /**
     * Extract object ID from request based on configuration
     */
    private extractObjectId(
        request: Request,
        requirement: PermissionRequirement,
    ): string {
        const source = requirement.objectIdSource || 'params';
        const param = requirement.objectIdParam || 'id';

        let objectId: string | undefined;

        switch (source) {
            case 'params':
                objectId = request.params[param];
                break;
            case 'body':
                objectId = (request.body as Record<string, unknown>)?.[param] as string;
                break;
            default:
                objectId = request.params[param];
        }

        if (!objectId) {
            throw new ForbiddenException(`Missing object ID for permission check`);
        }

        return objectId;
    }

    /**
     * Check a single permission requirement
     */
    private async checkPermission(
        requirement: PermissionRequirement,
        objectId: string,
        userId: string,
    ): Promise<boolean> {
        this.logger.debug(
            `Checking permission: ${requirement.namespace}:${objectId}#${requirement.relation}@User:${userId}`,
        );

        const allowed = await this.ketoService.checkPermission({
            namespace: requirement.namespace,
            object: objectId,
            relation: requirement.relation,
            subjectId: `User:${userId}`,
        });

        if (!allowed) {
            throw new ForbiddenException(
                `Insufficient permissions: requires ${requirement.relation} on ${requirement.namespace}:${objectId}`,
            );
        }

        return true;
    }

    /**
     * Check if user has ANY of the permissions (OR logic)
     */
    private async checkAnyPermission(
        requirements: PermissionRequirement[],
        request: Request,
        userId: string,
    ): Promise<boolean> {
        for (const requirement of requirements) {
            try {
                const objectId = this.extractObjectId(request, requirement);
                const allowed = await this.ketoService.checkPermission({
                    namespace: requirement.namespace,
                    object: objectId,
                    relation: requirement.relation,
                    subjectId: `User:${userId}`,
                });

                if (allowed) {
                    return true; // At least one permission granted
                }
            } catch {
                // Continue checking other permissions
            }
        }

        throw new ForbiddenException('Insufficient permissions');
    }

    /**
     * Check if user has ALL of the permissions (AND logic)
     */
    private async checkAllPermissions(
        requirements: PermissionRequirement[],
        request: Request,
        userId: string,
    ): Promise<boolean> {
        for (const requirement of requirements) {
            const objectId = this.extractObjectId(request, requirement);
            const allowed = await this.ketoService.checkPermission({
                namespace: requirement.namespace,
                object: objectId,
                relation: requirement.relation,
                subjectId: `User:${userId}`,
            });

            if (!allowed) {
                throw new ForbiddenException(
                    `Insufficient permissions: requires ${requirement.relation} on ${requirement.namespace}:${objectId}`,
                );
            }
        }

        return true; // All permissions granted
    }
}
