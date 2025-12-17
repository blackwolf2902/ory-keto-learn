# 🔐 Ory Keto Learning Project

A hands-on NestJS project to learn **Relationship-Based Access Control (ReBAC)** with Ory Keto.

## 🎯 What You'll Learn

- **Relation Tuples**: The core data structure (`namespace:object#relation@subject`)
- **Permission Checks**: "Does user X have permission Y on resource Z?"
- **Subject Sets**: Group-based permissions for scalable team access
- **Permission Inheritance**: Folder → Document cascading permissions
- **NestJS Guards & Decorators**: Declarative authorization in controllers

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- pnpm (`npm install -g pnpm`)

### 1. Setup

```bash
# Start PostgreSQL and Ory Keto
docker-compose up -d

# Install dependencies
pnpm install

# Setup database
cp .env.example .env
pnpm exec prisma migrate dev --name init
pnpm exec prisma generate
```

### 2. Run

```bash
pnpm run start:dev
```

### 3. Explore

- **Application**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api
- **Learning Guide**: [LEARNING_GUIDE.md](./LEARNING_GUIDE.md)

## 📁 Project Structure

```
├── docker-compose.yml          # PostgreSQL + Ory Keto
├── keto/
│   ├── keto.yml               # Keto configuration
│   └── namespaces.keto.ts     # Permission model (OPL)
├── src/
│   ├── keto/                  # Keto integration
│   │   ├── keto.module.ts
│   │   └── keto.service.ts    # Core Keto operations
│   ├── common/
│   │   ├── guards/            # KetoGuard
│   │   └── decorators/        # @RequirePermission
│   ├── users/                 # User management
│   ├── groups/                # Team-based access
│   ├── documents/             # Protected resources
│   └── folders/               # Hierarchical permissions
└── LEARNING_GUIDE.md          # Step-by-step tutorials
```

## 🎓 Learning Path

1. Read the [Learning Guide](./LEARNING_GUIDE.md)
2. Follow the exercises in order
3. Explore the Swagger UI
4. Study the annotated source code

## 📚 Resources

- [Ory Keto Documentation](https://www.ory.sh/docs/keto)
- [Google Zanzibar Paper](https://research.google/pubs/pub48190/)
- [NestJS Guards](https://docs.nestjs.com/guards)

## ⚠️ Note

This is a **learning project**. For production:
- Use proper authentication (Ory Kratos, Auth0, etc.)
- Configure Keto with proper namespaces file
- Use environment-specific configurations
- Add comprehensive logging and monitoring
