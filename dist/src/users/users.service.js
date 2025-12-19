"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const schema_1 = require("../drizzle/schema");
let UsersService = class UsersService {
    drizzle;
    constructor(drizzle) {
        this.drizzle = drizzle;
    }
    async create(createUserDto) {
        const [user] = await this.drizzle.db.insert(schema_1.users).values({
            id: createUserDto.id,
            email: createUserDto.email,
            name: createUserDto.name,
        }).returning();
        return user;
    }
    async syncUser(identity) {
        const id = identity.id;
        const email = identity.traits.email;
        const name = identity.traits.name || email.split('@')[0];
        const [userById] = await this.drizzle.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        if (userById) {
            const [updated] = await this.drizzle.db.update(schema_1.users)
                .set({ email, name, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                .returning();
            return updated;
        }
        const [userByEmail] = await this.drizzle.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        if (userByEmail) {
            await this.drizzle.db.execute((0, drizzle_orm_1.sql) `UPDATE users SET id = ${id}, name = ${name} WHERE email = ${email}`);
            return this.findOne(id);
        }
        const [newUser] = await this.drizzle.db.insert(schema_1.users).values({ id, email, name }).returning();
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
        return result.map(user => ({
            ...user,
            groups: user.groupMemberships,
        }));
    }
    async findOne(id) {
        const result = await this.drizzle.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, id),
            with: {
                groupMemberships: {
                    with: { group: true },
                },
                ownedDocuments: true,
                ownedFolders: true,
            },
        });
        if (!result)
            return null;
        return {
            ...result,
            groups: result.groupMemberships,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService])
], UsersService);
//# sourceMappingURL=users.service.js.map