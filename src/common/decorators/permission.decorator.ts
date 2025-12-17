import { SetMetadata, applyDecorators } from '@nestjs/common';

/**
 * ============================================
 * PERMISSION DECORATORS
 * ============================================
 * 
 * These decorators provide a DECLARATIVE way to specify
 * authorization requirements on controller methods.
 * 
 * CONCEPT: Declarative Authorization
 * Instead of writing permission logic in every endpoint:
 * 
 *   // ❌ Imperative (tedious, error-prone)
 *   async getDocument(@Param('id') id: string, @Req() req) {
 *     const allowed = await this.keto.checkPermission(...);
 *     if (!allowed) throw new ForbiddenException();
 *     return this.documentsService.findOne(id);
 *   }
 * 
 * You can declaratively specify requirements:
 * 
 *   // ✅ Declarative (clean, reusable)
 *   @RequirePermission({ namespace: 'Document', relation: 'view' })
 *   async getDocument(@Param('id') id: string) {
 *     return this.documentsService.findOne(id);
 *   }
 * 
 * The KetoGuard reads these decorators and enforces permissions.
 */

// Metadata keys
export const PERMISSION_METADATA_KEY = 'keto:permission';
export const SKIP_PERMISSION_CHECK_KEY = 'keto:skip';

/**
 * Permission requirement definition
 */
export interface PermissionRequirement {
    /** Keto namespace (User, Group, Document, Folder) */
    namespace: string;

    /** Relation to check (owner, editor, viewer, member) */
    relation: string;

    /** 
     * Source of the object ID from the request
     * 'params' → req.params[objectIdParam]
     * 'body' → req.body[objectIdParam]
     * 'custom' → Use a custom extractor function
     */
    objectIdSource?: 'params' | 'body' | 'custom';

    /** Name of the parameter containing the object ID */
    objectIdParam?: string;
}

/**
 * Require a specific permission for accessing an endpoint
 * 
 * @example
 * // Check if user can view the document with ID from :id param
 * @RequirePermission({
 *   namespace: 'Document',
 *   relation: 'view',
 *   objectIdSource: 'params',
 *   objectIdParam: 'id'
 * })
 * @Get(':id')
 * findOne(@Param('id') id: string) {}
 * 
 * @example
 * // Check if user can edit the folder from request body
 * @RequirePermission({
 *   namespace: 'Folder',
 *   relation: 'edit',
 *   objectIdSource: 'body',
 *   objectIdParam: 'folderId'
 * })
 * @Post('move')
 * moveDocument(@Body() dto: MoveDto) {}
 */
export function RequirePermission(requirement: PermissionRequirement) {
    return applyDecorators(
        SetMetadata(PERMISSION_METADATA_KEY, requirement),
    );
}

/**
 * Skip permission check for this endpoint
 * 
 * Useful for public endpoints or endpoints that do their own checks.
 * 
 * @example
 * @SkipPermissionCheck()
 * @Get('public')
 * getPublicData() {}
 */
export function SkipPermissionCheck() {
    return SetMetadata(SKIP_PERMISSION_CHECK_KEY, true);
}

/**
 * Combine multiple permission checks (OR logic)
 * 
 * User must have AT LEAST ONE of the specified permissions.
 * 
 * @example
 * @RequireAnyPermission([
 *   { namespace: 'Document', relation: 'edit' },
 *   { namespace: 'Document', relation: 'owner' },
 * ])
 */
export const PERMISSION_ANY_METADATA_KEY = 'keto:permission:any';

export function RequireAnyPermission(requirements: PermissionRequirement[]) {
    return SetMetadata(PERMISSION_ANY_METADATA_KEY, requirements);
}

/**
 * Combine multiple permission checks (AND logic)
 * 
 * User must have ALL specified permissions.
 * 
 * @example
 * @RequireAllPermissions([
 *   { namespace: 'Document', relation: 'view' },
 *   { namespace: 'Folder', relation: 'view' },
 * ])
 */
export const PERMISSION_ALL_METADATA_KEY = 'keto:permission:all';

export function RequireAllPermissions(requirements: PermissionRequirement[]) {
    return SetMetadata(PERMISSION_ALL_METADATA_KEY, requirements);
}
