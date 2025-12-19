import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * CurrentUser Decorator
 * 
 * Extracts the current authenticated user from the request.
 * The user is attached by KratosGuard after session validation.
 * 
 * Usage:
 *   @Get()
 *   findAll(@CurrentUser() user: KratosIdentity) {
 *     return this.service.findAll(user.id);
 *   }
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);

/**
 * Type for Kratos Identity attached to request
 */
export interface KratosIdentity {
    id: string;
    traits: {
        email: string;
        name?: string;
    };
    created_at?: string;
    updated_at?: string;
}
