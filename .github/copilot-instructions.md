# Barbershop Next.js - AI Coding Guidelines

## Project Overview
A modern barbershop appointment booking system built with Next.js 14, TypeScript, Prisma, and NextAuth.js. Uses mobile-first design with shadcn/ui components and a comprehensive design system.

## Architecture Patterns

### Component Structure
- **UI Components**: `/src/components/ui/` - Base reusable components (Button, Card, Avatar) following shadcn/ui patterns
- **App Components**: `/src/components/` - Application-specific components (Header, ServiceCard, etc.)
- **Pattern**: Components use `class-variance-authority` for variants and `cn()` utility for className merging

### Authentication Flow
- **NextAuth.js** with multiple providers (GitHub, Google, Credentials)
- **Middleware**: `/src/middleware.ts` protects routes based on authentication status and user roles
- **Session Strategy**: JWT with 30-day expiration, role-based access control (CLIENT, BARBER, ADMIN)
- **Pattern**: Use `getServerSession(authOptions)` for server-side auth checks

### Database & ORM
- **Prisma** with PostgreSQL for complex business domain (appointments, services, vouchers, promotions)
- **Key Models**: User (with roles), Service, Appointment, Voucher, Promotion with many-to-many relationships
- **Pattern**: Use `@/lib/prisma` singleton client, always use transactions for multi-model operations

### Development Workflows
- **Database**: Use `npm run db:*` scripts for local dev, `./scripts/db-prod.sh` for production
- **Docker**: `docker-compose.yml` for local development (simplified config), `docker-compose.prod.yml` for production
- **Environment**: Separate `.env.development` and `.env.production` files
- **Security**: Development config uses root user for volume compatibility - NEVER use in production

## Coding Conventions

### Styling
- **Primary**: Tailwind CSS with custom CSS tokens in `:root`
- **Complex Components**: SCSS Modules for advanced styling (`.module.scss`)
- **Utilities**: Use `@/lib/utils` `cn()` function for conditional classes

### File Naming
- **Components**: PascalCase (e.g., `ServiceCard.tsx`)
- **Pages**: kebab-case (App Router conventions)
- **Utilities**: camelCase (e.g., `userActions.ts`)

### Import Patterns
```typescript
import { Component } from "@/components/ui/component"
import { db } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
```

## Key Integration Points

### Form Handling
- **react-hook-form** with **Zod** validation schemas in `/src/schemas/`
- **Pattern**: Use `@hookform/resolvers/zod` for form validation

### State Management
- **Server State**: Prisma queries with proper error handling
- **Client State**: React hooks, NextAuth session state via SessionProvider

### API Routes
- **NextAuth**: Authentication endpoints in `/src/app/api/auth/`
- **Pattern**: Use server actions in `/src/server/` for data mutations

## Business Logic Patterns

### Appointment System
- Complex state machine with statuses: SCHEDULED → CONFIRMED → COMPLETED
- Supports barber assignments, service history tracking, and voucher redemption

### Voucher/Promotion System
- Type-based vouchers (FREE_SERVICE, DISCOUNT_PERCENTAGE, etc.)
- User-specific and global promotions with service relationships

### User Roles
- Multi-role system: CLIENT (default), BARBER, ADMIN
- Role-based UI rendering and route protection

## Development Guidelines

### Error Handling
- Use structured logging via `@/lib/logger` for auth events and errors
- Implement proper error boundaries for client-side errors

### Performance
- Leverage Next.js App Router for optimal loading
- Use Prisma query optimization for complex joins

### Testing Approach
- Focus on auth flows, appointment booking logic, and voucher validation
- Test role-based access control thoroughly

## Quick Start Commands
```bash
npm run dev          # Start development server
npm run db:migrate   # Apply database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed development data
```

For production database operations, use `./scripts/db-prod.sh [command]`.