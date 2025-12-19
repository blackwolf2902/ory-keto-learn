import { Injectable, Logger } from '@nestjs/common';
import { Configuration, FrontendApi, IdentityApi } from '@ory/client';

@Injectable()
export class KratosService {
    private readonly logger = new Logger(KratosService.name);
    public readonly frontend: FrontendApi;
    public readonly admin: IdentityApi;

    constructor() {
        const publicConfig = new Configuration({
            basePath: process.env.KRATOS_PUBLIC_URL || 'http://localhost:4433',
            baseOptions: {
                withCredentials: true,
            },
        });

        const adminConfig = new Configuration({
            basePath: process.env.KRATOS_ADMIN_URL || 'http://localhost:4434',
        });

        this.frontend = new FrontendApi(publicConfig);
        this.admin = new IdentityApi(adminConfig);
    }

    /**
     * Validate a session by cookie or authorization header
     * @param cookie The session cookie
     * @param authorization The authorization header
     */
    async validateSession(cookie?: string, authorization?: string) {
        try {
            const { data: session } = await this.frontend.toSession({
                cookie,
                xSessionToken: authorization?.replace('Bearer ', ''),
            });
            return session;
        } catch (error) {
            this.logger.debug('Session validation failed', error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Get identity by ID
     * @param id The identity ID
     */
    async getIdentity(id: string) {
        try {
            const { data: identity } = await this.admin.getIdentity({ id });
            return identity;
        } catch (error) {
            this.logger.error(`Failed to fetch identity ${id}`, error.response?.data || error.message);
            return null;
        }
    }
}
