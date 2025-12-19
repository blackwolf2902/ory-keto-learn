import { CanActivate, ExecutionContext } from '@nestjs/common';
import { KratosService } from '../../kratos/kratos.service';
import { UsersService } from '../../users/users.service';
export declare class KratosGuard implements CanActivate {
    private readonly kratosService;
    private readonly usersService;
    private readonly logger;
    constructor(kratosService: KratosService, usersService: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
