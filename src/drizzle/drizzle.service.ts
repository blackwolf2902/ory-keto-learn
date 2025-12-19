import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * DrizzleService - Database Access Layer
 * 
 * Provides a Drizzle ORM instance connected to PostgreSQL.
 * Handles connection lifecycle with NestJS.
 */
@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;
    public db: NodePgDatabase<typeof schema>;

    constructor() {
        const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/app?schema=public';
        this.pool = new Pool({ connectionString });
        this.db = drizzle(this.pool, { schema });
    }

    async onModuleInit() {
        // Test the connection
        await this.pool.query('SELECT 1');
        console.log('Drizzle database connected');
    }

    async onModuleDestroy() {
        await this.pool.end();
    }
}
