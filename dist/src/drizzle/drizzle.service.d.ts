import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
export declare class DrizzleService implements OnModuleInit, OnModuleDestroy {
    private pool;
    db: NodePgDatabase<typeof schema>;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
