import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KetoService } from '../../keto/keto.service';
export declare class KetoGuard implements CanActivate {
    private readonly ketoService;
    private readonly reflector;
    private readonly logger;
    constructor(ketoService: KetoService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractUserId;
    private extractObjectId;
    private checkPermission;
    private checkAnyPermission;
    private checkAllPermissions;
}
