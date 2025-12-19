import { FrontendApi, IdentityApi } from '@ory/client';
export declare class KratosService {
    private readonly logger;
    readonly frontend: FrontendApi;
    readonly admin: IdentityApi;
    constructor();
    validateSession(cookie?: string, authorization?: string): Promise<import("@ory/client").Session | null>;
    getIdentity(id: string): Promise<import("@ory/client").Identity | null>;
}
