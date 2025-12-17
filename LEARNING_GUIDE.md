# 🎓 Ory Keto Learning Guide

Welcome to the Ory Keto Learning Project! This guide will take you through all the key concepts of **Relationship-Based Access Control (ReBAC)** step by step.

---

## 📚 Table of Contents

1. [Core Concepts](#core-concepts)
2. [Getting Started](#getting-started)
3. [Tutorial: Step-by-Step Exercises](#tutorial-step-by-step-exercises)
4. [Deep Dive: How Each Concept Works](#deep-dive-how-each-concept-works)
5. [Common Patterns](#common-patterns)
6. [Troubleshooting](#troubleshooting)

---

## 🧠 Core Concepts

### What is Ory Keto?

Ory Keto is an **authorization** service based on Google's Zanzibar paper. It answers one question:

> **"Does subject X have permission Y on object Z?"**

### Key Terminology

| Term | Definition | Example |
|------|------------|---------|
| **Namespace** | Category of objects | `User`, `Document`, `Folder`, `Group` |
| **Object** | A specific resource | `Document:readme.md` |
| **Relation** | Type of relationship | `owner`, `editor`, `viewer`, `member` |
| **Subject** | Who has the relation | `User:alice` |
| **Relation Tuple** | Complete permission entry | `Document:readme.md#viewer@User:alice` |
| **Subject Set** | Reference to members of another relation | `Group:engineering#member` |

### The Relation Tuple Format

```
namespace:object#relation@subject
```

Examples:
```
Document:readme.md#owner@User:alice          ← Alice owns readme.md
Document:readme.md#viewer@User:bob           ← Bob can view readme.md
Document:readme.md#viewer@Group:devs#member  ← All devs can view readme.md
Folder:projects#parent@Document:spec.pdf     ← spec.pdf inherits from projects folder
```

---

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- pnpm (`npm install -g pnpm`)

### 1. Start Infrastructure

```bash
# Start PostgreSQL and Ory Keto
docker-compose up -d

# Wait for services to be ready
docker-compose logs -f keto
# Look for: "Starting the http server"
```

### 2. Set Up Database

```bash
# Copy environment file
cp .env.example .env

# Apply Prisma migrations
pnpm exec prisma migrate dev --name init

# Generate Prisma client
pnpm exec prisma generate
```

### 3. Start the Application

```bash
pnpm run start:dev
```

### 4. Access the Application

- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api

---

## 📝 Tutorial: Step-by-Step Exercises

### Exercise 1: Simple Owner/Viewer Permissions

**Goal**: Understand basic relation tuples and permission checks.

#### Step 1: Create Users

```bash
# Create Alice
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "name": "Alice"}'

# Response: {"id": "alice-uuid", ...}

# Create Bob
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "bob@example.com", "name": "Bob"}'

# Response: {"id": "bob-uuid", ...}
```

#### Step 2: Alice Creates a Document

```bash
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -H "x-user-id: alice-uuid" \
  -d '{"title": "Project Roadmap", "content": "Q4 Goals..."}'

# Response: {"id": "doc-uuid", ...}
```

**What happened in Keto:**
```
Document:doc-uuid#owner@User:alice-uuid
```

#### Step 3: Alice Can Access (Owner)

```bash
curl http://localhost:3000/documents/doc-uuid \
  -H "x-user-id: alice-uuid"

# ✅ Returns the document
```

#### Step 4: Bob Cannot Access (No Permission)

```bash
curl http://localhost:3000/documents/doc-uuid \
  -H "x-user-id: bob-uuid"

# ❌ 403 Forbidden
```

#### Step 5: Alice Shares with Bob

```bash
curl -X POST http://localhost:3000/documents/doc-uuid/share \
  -H "Content-Type: application/json" \
  -H "x-user-id: alice-uuid" \
  -d '{"userId": "bob-uuid", "relation": "viewer"}'

# Response: {"success": true, "relation": "Document:doc-uuid#viewer@User:bob-uuid"}
```

**What happened in Keto:**
```
Document:doc-uuid#owner@User:alice-uuid   (existing)
Document:doc-uuid#viewer@User:bob-uuid    (new!)
```

#### Step 6: Bob Can Now Access

```bash
curl http://localhost:3000/documents/doc-uuid \
  -H "x-user-id: bob-uuid"

# ✅ Returns the document
```

#### Step 7: But Bob Cannot Edit

```bash
curl -X PUT http://localhost:3000/documents/doc-uuid \
  -H "Content-Type: application/json" \
  -H "x-user-id: bob-uuid" \
  -d '{"title": "New Title"}'

# ❌ 403 Forbidden (needs editor or owner)
```

---

### Exercise 2: Group-Based Access (Subject Sets)

**Goal**: Learn how to use groups for scalable team permissions.

#### Step 1: Create a Group

```bash
curl -X POST http://localhost:3000/groups \
  -H "Content-Type: application/json" \
  -d '{"name": "Engineering Team", "description": "All engineers"}'

# Response: {"id": "eng-group-uuid", ...}
```

#### Step 2: Add Alice and Charlie to the Group

```bash
# Add Alice
curl -X POST http://localhost:3000/groups/eng-group-uuid/members \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin-uuid" \
  -d '{"userId": "alice-uuid"}'

# Add Charlie
curl -X POST http://localhost:3000/groups/eng-group-uuid/members \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin-uuid" \
  -d '{"userId": "charlie-uuid"}'
```

**What happened in Keto:**
```
Group:eng-group-uuid#member@User:alice-uuid
Group:eng-group-uuid#member@User:charlie-uuid
```

#### Step 3: Share Document with Entire Group

```bash
curl -X POST http://localhost:3000/documents/doc-uuid/share \
  -H "Content-Type: application/json" \
  -H "x-user-id: alice-uuid" \
  -d '{"groupId": "eng-group-uuid", "relation": "editor"}'
```

**What happened in Keto:**
```
Document:doc-uuid#editor@Group:eng-group-uuid#member
```

This is a **Subject Set** - instead of listing each user, we reference "anyone who is a member of the engineering group".

#### Step 4: All Group Members Can Now Edit

```bash
# Charlie can edit (he's in the group)
curl -X PUT http://localhost:3000/documents/doc-uuid \
  -H "Content-Type: application/json" \
  -H "x-user-id: charlie-uuid" \
  -d '{"title": "Updated by Charlie"}'

# ✅ Success!
```

#### Step 5: Remove from Group = Remove Access

```bash
curl -X DELETE http://localhost:3000/groups/eng-group-uuid/members/charlie-uuid \
  -H "x-user-id: admin-uuid"

# Now Charlie cannot access anymore!
```

---

### Exercise 3: Hierarchical Permissions (Folders)

**Goal**: Understand how permissions cascade through folder hierarchies.

#### Step 1: Create a Folder Structure

```bash
# Create parent folder
curl -X POST http://localhost:3000/folders \
  -H "Content-Type: application/json" \
  -H "x-user-id: alice-uuid" \
  -d '{"name": "Projects"}'

# Response: {"id": "projects-folder-uuid", ...}

# Create child folder
curl -X POST http://localhost:3000/folders \
  -H "Content-Type: application/json" \
  -H "x-user-id: alice-uuid" \
  -d '{"name": "Frontend", "parentId": "projects-folder-uuid"}'

# Response: {"id": "frontend-folder-uuid", ...}
```

#### Step 2: Create Document in Subfolder

```bash
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -H "x-user-id: alice-uuid" \
  -d '{"title": "Frontend Spec", "folderId": "frontend-folder-uuid"}'
```

**What happened in Keto:**
```
# Folder relations
Folder:projects-folder-uuid#owner@User:alice-uuid
Folder:frontend-folder-uuid#owner@User:alice-uuid
Folder:frontend-folder-uuid#parent@Folder:projects-folder-uuid

# Document relations
Document:frontend-spec-uuid#owner@User:alice-uuid
Document:frontend-spec-uuid#parent@Folder:frontend-folder-uuid
```

#### Step 3: Share Top Folder = Access to Everything Below

```bash
curl -X POST http://localhost:3000/folders/projects-folder-uuid/share \
  -H "Content-Type: application/json" \
  -H "x-user-id: alice-uuid" \
  -d '{"userId": "bob-uuid", "relation": "viewer"}'
```

Now Bob can access:
- `/Projects` folder ✅
- `/Projects/Frontend` subfolder ✅  
- Frontend Spec document ✅

All through **one** share action!

---

## 🔍 Deep Dive: How Each Concept Works

### 1. Relation Tuples

Relation tuples are the "rows" in Keto's permission database. Each tuple defines one relationship.

```typescript
// In KetoService
await this.ketoService.createRelation({
  namespace: 'Document',
  object: documentId,
  relation: 'viewer',
  subjectId: `User:${userId}`,
});
```

### 2. Permission Checks

When checking permissions, Keto traverses the relation graph:

```typescript
// In KetoGuard
const allowed = await this.ketoService.checkPermission({
  namespace: 'Document',
  object: documentId,
  relation: 'view',
  subjectId: `User:${userId}`,
});
```

Keto evaluates (based on permission model):
1. Is user a direct viewer? → Check `viewer` relation
2. Is user an editor? → Editors can view
3. Is user an owner? → Owners can view
4. Does user have access through parent folder? → Check inheritance

### 3. Subject Sets

Subject sets reference another relation:

```typescript
// Instead of this (tedious):
await keto.createRelation({ ..., subjectId: 'User:alice' });
await keto.createRelation({ ..., subjectId: 'User:bob' });
await keto.createRelation({ ..., subjectId: 'User:charlie' });

// Do this (scalable):
await keto.createRelation({
  namespace: 'Document',
  object: documentId,
  relation: 'viewer',
  subjectSet: {
    namespace: 'Group',
    object: groupId,
    relation: 'member',
  },
});
```

### 4. Permission Inheritance

Inheritance works through `parent` relations:

```typescript
// When creating a document in a folder:
await keto.createRelation({
  namespace: 'Document',
  object: documentId,
  relation: 'parent',
  subjectSet: {
    namespace: 'Folder',
    object: folderId,
    relation: 'viewer',  // Folder viewers become document viewers
  },
});
```

---

## 📊 Common Patterns

### Pattern 1: RBAC (Role-Based Access Control)

Create roles as groups:

```
Group:admin#member@User:alice
Group:editor#member@User:bob
Group:viewer#member@User:charlie

Document:*#owner@Group:admin#member
Document:*#editor@Group:editor#member
Document:*#viewer@Group:viewer#member
```

### Pattern 2: Organization Hierarchy

```
Org:acme#member@User:alice
Team:engineering#member@User:bob
Team:engineering#parent@Org:acme

Document:internal-docs#viewer@Org:acme#member
```

### Pattern 3: Public/Private Resources

```
Document:public-doc#viewer@*   ← Anyone can view
Document:private-doc#viewer@User:alice  ← Only Alice
```

---

## 🔧 Troubleshooting

### "Permission denied" when you expect access

1. Check if the relation exists:
   ```bash
   curl -X GET "http://localhost:4466/relation-tuples?namespace=Document&object=doc-id"
   ```

2. Check if the permission check is correct:
   ```bash
   curl -X POST "http://localhost:4466/relation-tuples/check" \
     -H "Content-Type: application/json" \
     -d '{"namespace":"Document","object":"doc-id","relation":"view","subject_id":"User:alice"}'
   ```

### Keto not responding

```bash
# Check if Keto is running
docker-compose ps

# Check Keto logs
docker-compose logs keto
```

### Database issues

```bash
# Reset everything
docker-compose down -v
docker-compose up -d
pnpm exec prisma migrate reset
```

---

## 📖 Further Reading

- [Ory Keto Documentation](https://www.ory.sh/docs/keto)
- [Google Zanzibar Paper](https://research.google/pubs/pub48190/)
- [Ory Permission Language (OPL)](https://www.ory.sh/docs/keto/reference/ory-permission-language)

---

Happy learning! 🚀
