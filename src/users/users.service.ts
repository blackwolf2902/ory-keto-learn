import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { users, groupMembers, groups, documents, folders } from '../drizzle/schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly drizzle: DrizzleService) { }

    async create(createUserDto: CreateUserDto & { id?: string }) {
        const [user] = await this.drizzle.db.insert(users).values({
            id: createUserDto.id,
            email: createUserDto.email,
            name: createUserDto.name,
        }).returning();
        return user;
    }

    async syncUser(identity: any) {
        const id = identity.id;
        const email = identity.traits.email;
        const name = identity.traits.name || email.split('@')[0];

        // Check if user exists by ID first
        const [userById] = await this.drizzle.db.select().from(users).where(eq(users.id, id));
        if (userById) {
            const [updated] = await this.drizzle.db.update(users)
                .set({ email, name, updatedAt: new Date() })
                .where(eq(users.id, id))
                .returning();
            return updated;
        }

        // Check if user exists by email (conflict case)
        const [userByEmail] = await this.drizzle.db.select().from(users).where(eq(users.email, email));
        if (userByEmail) {
            // Migrate record to new Kratos ID
            await this.drizzle.db.execute(
                sql`UPDATE users SET id = ${id}, name = ${name} WHERE email = ${email}`
            );
            return this.findOne(id);
        }

        // New user
        const [newUser] = await this.drizzle.db.insert(users).values({ id, email, name }).returning();
        return newUser;
    }

    async findAll() {
        const result = await this.drizzle.db.query.users.findMany({
            with: {
                groupMemberships: {
                    with: { group: true },
                },
            },
        });
        // Transform to match expected format
        return result.map(user => ({
            ...user,
            groups: user.groupMemberships,
        }));
    }

    async findOne(id: string) {
        const result = await this.drizzle.db.query.users.findFirst({
            where: eq(users.id, id),
            with: {
                groupMemberships: {
                    with: { group: true },
                },
                ownedDocuments: true,
                ownedFolders: true,
            },
        });
        if (!result) return null;
        return {
            ...result,
            groups: result.groupMemberships,
        };
    }
}
