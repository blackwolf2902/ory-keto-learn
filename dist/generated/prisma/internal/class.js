"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.1.0",
    "engineVersion": "ab635e6b9d606fa5c8fb8b1a7f909c3c3c1c98ba",
    "activeProvider": "postgresql",
    "inlineSchema": "// Prisma Schema for Ory Keto Learning Project\n// This stores application data. Authorization data is in Ory Keto.\n\ngenerator client {\n  provider = \"prisma-client\"\n  output   = \"../generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\n// ============================================\n// USER MODEL\n// ============================================\n// Represents users in our system.\n// User authentication is simulated via headers.\n// Authorization is handled by Ory Keto.\nmodel User {\n  id        String   @id @default(uuid())\n  email     String   @unique\n  name      String\n  createdAt DateTime @default(now()) @map(\"created_at\")\n  updatedAt DateTime @updatedAt @map(\"updated_at\")\n\n  // Relations (application-level, not authorization)\n  ownedDocuments Document[]    @relation(\"DocumentOwner\")\n  ownedFolders   Folder[]      @relation(\"FolderOwner\")\n  groups         GroupMember[]\n\n  @@map(\"users\")\n}\n\n// ============================================\n// GROUP MODEL\n// ============================================\n// Groups allow team-based access control.\n// Group membership is ALSO stored in Keto for permission checks.\nmodel Group {\n  id          String   @id @default(uuid())\n  name        String   @unique\n  description String?\n  createdAt   DateTime @default(now()) @map(\"created_at\")\n  updatedAt   DateTime @updatedAt @map(\"updated_at\")\n\n  members GroupMember[]\n\n  @@map(\"groups\")\n}\n\nmodel GroupMember {\n  id        String   @id @default(uuid())\n  userId    String   @map(\"user_id\")\n  groupId   String   @map(\"group_id\")\n  role      String   @default(\"member\") // member, admin\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)\n  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, groupId])\n  @@map(\"group_members\")\n}\n\n// ============================================\n// FOLDER MODEL\n// ============================================\n// Folders organize documents hierarchically.\n// Folder permissions in Keto can inherit from parent folders.\nmodel Folder {\n  id          String   @id @default(uuid())\n  name        String\n  description String?\n  parentId    String?  @map(\"parent_id\")\n  ownerId     String   @map(\"owner_id\")\n  createdAt   DateTime @default(now()) @map(\"created_at\")\n  updatedAt   DateTime @updatedAt @map(\"updated_at\")\n\n  // Self-referential relation for hierarchy\n  parent   Folder?  @relation(\"FolderHierarchy\", fields: [parentId], references: [id], onDelete: Cascade)\n  children Folder[] @relation(\"FolderHierarchy\")\n\n  // Owner relation\n  owner User @relation(\"FolderOwner\", fields: [ownerId], references: [id])\n\n  // Documents in this folder\n  documents Document[]\n\n  @@map(\"folders\")\n}\n\n// ============================================\n// DOCUMENT MODEL\n// ============================================\n// Documents are the protected resources.\n// All access checks happen through Ory Keto.\nmodel Document {\n  id        String   @id @default(uuid())\n  title     String\n  content   String?\n  folderId  String?  @map(\"folder_id\")\n  ownerId   String   @map(\"owner_id\")\n  createdAt DateTime @default(now()) @map(\"created_at\")\n  updatedAt DateTime @updatedAt @map(\"updated_at\")\n\n  // Relations\n  folder Folder? @relation(fields: [folderId], references: [id], onDelete: SetNull)\n  owner  User    @relation(\"DocumentOwner\", fields: [ownerId], references: [id])\n\n  @@map(\"documents\")\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"created_at\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"updated_at\"},{\"name\":\"ownedDocuments\",\"kind\":\"object\",\"type\":\"Document\",\"relationName\":\"DocumentOwner\"},{\"name\":\"ownedFolders\",\"kind\":\"object\",\"type\":\"Folder\",\"relationName\":\"FolderOwner\"},{\"name\":\"groups\",\"kind\":\"object\",\"type\":\"GroupMember\",\"relationName\":\"GroupMemberToUser\"}],\"dbName\":\"users\"},\"Group\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"created_at\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"updated_at\"},{\"name\":\"members\",\"kind\":\"object\",\"type\":\"GroupMember\",\"relationName\":\"GroupToGroupMember\"}],\"dbName\":\"groups\"},\"GroupMember\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"user_id\"},{\"name\":\"groupId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"group_id\"},{\"name\":\"role\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"created_at\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"GroupMemberToUser\"},{\"name\":\"group\",\"kind\":\"object\",\"type\":\"Group\",\"relationName\":\"GroupToGroupMember\"}],\"dbName\":\"group_members\"},\"Folder\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"parentId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"parent_id\"},{\"name\":\"ownerId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"owner_id\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"created_at\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"updated_at\"},{\"name\":\"parent\",\"kind\":\"object\",\"type\":\"Folder\",\"relationName\":\"FolderHierarchy\"},{\"name\":\"children\",\"kind\":\"object\",\"type\":\"Folder\",\"relationName\":\"FolderHierarchy\"},{\"name\":\"owner\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"FolderOwner\"},{\"name\":\"documents\",\"kind\":\"object\",\"type\":\"Document\",\"relationName\":\"DocumentToFolder\"}],\"dbName\":\"folders\"},\"Document\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"content\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"folderId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"folder_id\"},{\"name\":\"ownerId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"owner_id\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"created_at\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"updated_at\"},{\"name\":\"folder\",\"kind\":\"object\",\"type\":\"Folder\",\"relationName\":\"DocumentToFolder\"},{\"name\":\"owner\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"DocumentOwner\"}],\"dbName\":\"documents\"}},\"enums\":{},\"types\":{}}");
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await import('node:buffer');
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await import("@prisma/client/runtime/query_compiler_bg.postgresql.mjs"),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_bg.postgresql.wasm-base64.mjs");
        return await decodeBase64AsWasm(wasm);
    }
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map