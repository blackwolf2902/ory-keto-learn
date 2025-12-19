import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { KratosService } from '../../kratos/kratos.service';
import { UsersService } from '../../users/users.service';

/**
 * ============================================
 * KRATOS GUARD - Authentication Enforcement
 * ============================================
 * 
 * Flow:
 * 1. Request arrives
 * 2. Guard extracts cookies/auth header
 * 3. Guard calls KratosService.validateSession()
 * 4. If valid → attached session/identity to request.user
 * 5. Sync user with local database
 * 6. If invalid → throw UnauthorizedException
 */
@Injectable()
export class KratosGuard implements CanActivate {
    private readonly logger = new Logger(KratosGuard.name);

    constructor(
        private readonly kratosService: KratosService,
        private readonly usersService: UsersService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        // 1. Extract session information
        const cookie = request.headers.cookie;
        const authHeader = request.headers.authorization;

        if (!cookie && !authHeader) {
            this.logger.warn('No session cookie or auth header found');
            throw new UnauthorizedException('Authentication required');
        }

        // 2. Validate session with Kratos
        const session = await this.kratosService.validateSession(cookie, authHeader);

        if (!session || !session.active) {
            this.logger.warn('Invalid or inactive Kratos session');
            throw new UnauthorizedException('Invalid session');
        }

        if (!session.identity) {
            this.logger.warn('Kratos session has no identity');
            throw new UnauthorizedException('Invalid identity');
        }

        // 3. Attach identity to request
        (request as any).user = session.identity;

        // 4. Sync user with local database
        // This ensures the user exists in our DB for relations/Keto
        try {
            await this.usersService.syncUser(session.identity);
        } catch (error) {
            this.logger.error(`Failed to sync user ${session.identity.id}`, error.message);
            // We still allow the request if Kratos is valid
        }

        this.logger.debug(`Authenticated user: ${session.identity.id}`);

        return true;
    }
}
