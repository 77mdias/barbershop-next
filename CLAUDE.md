# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern barbershop appointment booking system built with Next.js 15, TypeScript, Prisma ORM, and NextAuth.js. Features include appointment scheduling, service management, reviews with image uploads, user role-based dashboards, vouchers/promotions, and a comprehensive design system using Tailwind CSS + shadcn/ui.

---

## Essential Commands

> **⚠️ IMPORTANT**: This is a **Docker-first** project. All development commands must be executed inside Docker containers using `docker compose exec app <command>`. Never run npm commands directly on your local machine.

### Docker Container Management
```bash
# Start development environment
docker compose up -d              # Start all containers in background
docker compose up app             # Start with logs visible

# Stop containers
docker compose down               # Stop all containers
docker compose stop               # Stop without removing containers

# View logs and status
docker compose logs app           # View app logs
docker compose logs -f app        # Follow app logs in real-time
docker compose ps                 # List running containers

# Access container shell
docker compose exec app sh        # Access app container shell
```

### Development
```bash
# All commands run inside the Docker container
docker compose exec app npm run dev              # Start Next.js development server
docker compose exec app npm run lint:check       # Check linting issues
docker compose exec app npm run lint:fix         # Auto-fix linting issues
docker compose exec app npm run type-check       # Run TypeScript type checking
docker compose exec app npm run validate         # Run both lint:check and type-check
```

### Build & Production
```bash
docker compose exec app npm run build            # Production build
docker compose exec app npm run build:vercel     # Vercel-specific build (removes sharp dependency)
docker compose exec app npm run start            # Start production server
```

### Database Operations
```bash
# Development database (runs inside container)
docker compose exec app npm run db:migrate       # Create and apply new migration
docker compose exec app npm run db:push          # Push schema changes without migration
docker compose exec app npm run db:generate      # Generate Prisma client
docker compose exec app npm run db:studio        # Open Prisma Studio UI
docker compose exec app npm run db:seed          # Populate database with test data
docker compose exec app npm run db:reset         # Reset database (⚠️ destructive)

# Alternative: Direct Prisma commands
docker compose exec app npx prisma migrate dev   # Create and apply migration
docker compose exec app npx prisma db push       # Push schema without migration
docker compose exec app npx prisma generate      # Generate Prisma client
docker compose exec app npx prisma studio        # Open Prisma Studio
docker compose exec app npx tsx prisma/seed.ts   # Run seed script directly

# Production database (uses scripts/db-prod.sh)
npm run db:migrate:prod          # Apply migrations to production
npm run db:push:prod             # Push schema to production
npm run db:studio:prod           # Open Prisma Studio for production
npm run db:seed:prod             # Seed production database
```

### Package Management
```bash
# Install new dependencies (inside container)
docker compose exec app npm install <package>         # Add dependency
docker compose exec app npm install -D <package>      # Add dev dependency
docker compose exec app npm uninstall <package>       # Remove dependency

# Rebuild containers after package.json changes
docker compose build app                              # Rebuild app image
docker compose up -d --build app                      # Rebuild and restart
```

### Test Credentials
After running `docker compose exec app npm run db:seed`:
- **Admin**: `admin@barbershop.com` / `admin123`
- **Barber**: `joao@barbershop.com` / `barbeiro123`
- **Client**: `carlos@email.com` / `cliente123`

---

## Architecture Overview

### Authentication & Authorization

**Location**: `/src/lib/auth.ts`

- **NextAuth.js** with JWT session strategy (30-day expiration)
- **Providers**: GitHub OAuth, Google OAuth, Email/Password (bcrypt)
- **User Roles**: `CLIENT` (default), `BARBER`, `ADMIN`
- **Middleware**: `/src/middleware.ts` protects routes based on auth status and roles

**Protected Routes**:
- `/profile/*`, `/dashboard/*`, `/scheduling/*`, `/reviews/*` - Requires authentication
- `/admin/*` - Requires ADMIN role

**Key Pattern**:
```typescript
// Session callback always fetches fresh user data from DB
session({ session, token }) {
  const freshUser = await db.user.findUnique(...)
  session.user = { ...token, ...freshUser }
}
```

**Important**: Profile updates (image, nickname) are immediately reflected in the session because the session callback re-queries the database on every request.

### Database Architecture

**Schema**: `/prisma/schema.prisma`

**Core Models**:
```
User
├── Roles: CLIENT, BARBER, ADMIN
├── OAuth accounts (GitHub, Google)
├── Email verification & password reset tokens
└── Relations: appointments, servicesProvided, serviceHistory, vouchers, promotions

Appointment
├── Status: SCHEDULED → CONFIRMED → COMPLETED → CANCELLED/NO_SHOW
├── Relations: user, barber (User), service, voucher, appliedPromotion
└── serviceHistoryId (links to completed service record)

Service
├── Active/inactive services with duration (minutes) and price
└── Relations: appointments, serviceHistory, promotionServices, vouchers

ServiceHistory (Completed services)
├── Rating (1-5), feedback, images (String[] array)
├── finalPrice (after discounts)
└── Relations: user, service, appointments

Voucher
├── Types: FREE_SERVICE, DISCOUNT_PERCENTAGE, DISCOUNT_FIXED, CASHBACK
├── Status: ACTIVE, USED, EXPIRED
└── Relations: user, service, appointments

Promotion
├── Types: DISCOUNT_PERCENTAGE, DISCOUNT_FIXED, FREE_SERVICE, CASHBACK, LOYALTY_BONUS
├── isGlobal (available to all) or user-specific via UserPromotion
├── minFrequency (loyalty requirement)
└── M:M relations: servicePromotions, userPromotions
```

**Key Relationships**:
- Users can be both clients (appointments) and barbers (servicesProvided)
- ServiceHistory.images is a String[] (JSON array of URLs)
- Promotions can be global or targeted via UserPromotion junction table
- Vouchers belong to users and optionally a specific service

### Server Actions Pattern

**Location**: `/src/server/`

All data mutations and server-side operations use Next.js Server Actions with `"use server"` directive.

**Key Files**:
- `appointmentActions.ts` - Booking/appointment management
- `reviewActions.ts` - Review creation/editing with image uploads
- `userActions.ts` - User management
- `profileActions.ts` - Profile updates
- `dashboardActions.ts` - Dashboard metrics and analytics
- `adminActions.ts` - Admin operations (requires ADMIN role)
- `uploadServerActions.ts` - File upload handling

**Service Layer**: `/src/server/services/`
- `userService.ts` - UserService class with static methods
- `appointmentService.ts` - AppointmentService class
- `serviceService.ts` - ServiceService class

**Standard Pattern**:
```typescript
export async function actionName(input: InputType) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    // Validate with Zod
    const validated = Schema.parse(input)

    // Business logic
    const result = await db.model.operation(...)

    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: "User-friendly message" }
  }
}
```

### Component Architecture

**Structure**:
```
src/components/
├── ui/                 # Radix UI + shadcn/ui primitives (button, card, dialog, etc.)
├── forms/              # Feature-specific forms (UserForm, DataTable)
├── scheduling/         # Appointment booking components
├── upload/             # File upload UI components
├── HeaderNavigation.tsx
├── bottom-navigation.tsx
├── ReviewForm.tsx      # Review creation with image uploads
├── ReviewsList.tsx     # Paginated review display
└── EditProfileModal.tsx
```

**Key Patterns**:
- Server Components by default (Next.js 15 App Router)
- Client Components use `'use client'` directive
- Providers wrap the app in `/src/app/layout.tsx` (SessionProvider, Toaster)

### File Upload System

**Hybrid Strategy**: Local filesystem (dev) + Cloudinary (production)

**Configuration**: `/src/lib/upload/config.ts`
```typescript
MAX_FILE_SIZE: 5MB
MAX_FILES_PER_REQUEST: 5
ALLOWED_MIME_TYPES: image/jpeg, image/png, image/webp
```

**Upload Flow**:
```
Client Form
  → Client-side validation (/src/lib/upload.ts)
  → API Route (/api/upload/profile or /api/upload/reviews)
    → Authentication check
    → Rate limiting (10 uploads/hour per user+IP)
    → File validation
  → Server Action (hybridUploadAction or uploadServerActions)
    → Storage strategy selection (local or Cloudinary)
    → Image processing and save
  → Response with URLs → Database update
```

**API Routes**:
- `POST /api/upload/profile` - Single profile image
- `POST /api/upload/reviews` - Multiple review images (max 5)
- `DELETE /api/upload/reviews` - Remove review image

**Rate Limiting**: `/src/lib/rate-limiter.ts`
- 10 uploads per hour per user+IP combination
- 15-minute block on rate limit exceed

**Storage**:
- Dev: `public/uploads/{PROFILES|REVIEWS}/{userId}/`
- Prod: Cloudinary with environment detection

### Validation & Type Safety

**Zod Schemas**: `/src/schemas/`
- `appointmentSchemas.ts` - Appointment creation/filtering
- `reviewSchemas.ts` - Review validation
- `serviceSchemas.ts` - Service operations
- `userSchemas.ts` - User operations
- `profileSchemas.ts` - Profile updates

**NextAuth Type Extensions**: `/src/types/next-auth.d.ts`
- Extends Session and JWT types with role, nickname, phone, image

**Path Aliases**: `@/*` → `./src/*` (configured in tsconfig.json)

---

## Key Technical Patterns

### Environment Detection
```typescript
NODE_ENV === 'production' → Cloudinary storage, secure cookies
NODE_ENV === 'development' → Local filesystem, relaxed security
VERCEL === '1' → Read-only filesystem detected
```

### API Response Pattern
All server actions and API routes return:
```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  pagination?: { page, limit, total, totalPages }
}
```

### Error Handling
- Never expose stack traces to clients
- Always log errors server-side (`console.error(error.stack)`)
- Return user-friendly error messages
- Use structured try-catch blocks

### Appointment Status Lifecycle
`SCHEDULED` → `CONFIRMED` → `COMPLETED` (with ServiceHistory)
OR `SCHEDULED` → `CANCELLED` / `NO_SHOW`

### Promotion System Logic
- **Global promotions**: `isGlobal: true` (available to all users)
- **User-specific**: Via UserPromotion junction table
- **Service-specific**: Via PromotionService junction table (M:M)
- **Frequency-based**: `minFrequency` for loyalty rewards

### Email Verification Flow
1. User registers → Generate token + expiration
2. Send email with verification link
3. User clicks → `POST /api/auth/verify-email`
4. Set `emailVerified: now()`, `isActive: true`

---

## Code Conventions

### Styling
- **Primary**: Tailwind CSS with custom theme
- **Complex Components**: SCSS Modules (`.module.scss`)
- **Utilities**: `cn()` function from `@/lib/utils` for className merging
- **Dark Mode**: Class-based (`darkMode: 'class'` in tailwind.config)

### File Naming
- **Components**: PascalCase (`ServiceCard.tsx`)
- **Pages**: kebab-case (App Router conventions)
- **Utilities/Actions**: camelCase (`userActions.ts`)

### Imports
```typescript
import { Component } from "@/components/ui/component"
import { db } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
```

### TypeScript Configuration
- `strict: false` (legacy code compatibility)
- `strictNullChecks: true` (null safety enabled)
- `forceConsistentCasingInFileNames: true`

---

## Docker Development Workflow

This project is **Docker-first**. All development occurs in containers.

### Key Docker Files
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production (older)
- `docker-compose.pro.yml` - Professional production architecture
- `Dockerfile` - Development Dockerfile
- `Dockerfile.pro` - Multi-stage production Dockerfile

### Initial Setup
```bash
# 1. Build containers
docker compose build

# 2. Start database container
docker compose up -d db

# 3. Run database migrations
docker compose exec app npx prisma migrate dev

# 4. Seed database with test data
docker compose exec app npx prisma db seed
# OR
docker compose exec app npx tsx prisma/seed.ts

# 5. Start development server
docker compose up app              # With logs visible
# OR
docker compose up -d app           # In background
```

### Daily Development Workflow
```bash
# Start development environment
docker compose up app              # Start with logs visible
docker compose up -d               # Start all services in background

# View logs
docker compose logs -f app         # Follow app logs in real-time

# Run development commands
docker compose exec app npm run dev              # Start Next.js dev server
docker compose exec app npm run lint:check       # Check linting
docker compose exec app npm run type-check       # Type checking

# Database operations
docker compose exec app npx prisma studio        # Open Prisma Studio
docker compose exec app npx prisma migrate dev   # Create new migration

# Install dependencies
docker compose exec app npm install <package>    # Add new package

# Access container shell (for debugging)
docker compose exec app sh

# Stop containers
docker compose down                # Stop all and remove containers
docker compose stop                # Stop without removing
```

### Production Deployment
```bash
# Using deployment script (recommended)
./scripts/deploy-pro.sh deploy     # Full deployment (migrations + app)
./scripts/deploy-pro.sh migrate    # Run migrations only
./scripts/deploy-pro.sh app-only   # Deploy app only
./scripts/deploy-pro.sh logs       # View logs
./scripts/deploy-pro.sh status     # Check service status

# Manual production operations
docker compose -f docker-compose.pro.yml build                    # Build production images
docker compose -f docker-compose.pro.yml --profile migration up migrator  # Run migrations
docker compose -f docker-compose.pro.yml up -d app               # Start application
```

### Container Management
```bash
# Rebuild after Dockerfile changes
docker compose build app                    # Rebuild app image
docker compose up -d --build app           # Rebuild and restart

# Clean up
docker compose down -v                     # Stop and remove volumes (⚠️ data loss)
docker compose exec app npm run docker:clean  # Clean Docker resources

# View container status
docker compose ps                          # List running containers
docker compose top app                     # View processes in app container
```

**Critical Rules**:
- ⛔ **NEVER** run npm/npx commands directly on your local machine
- ✅ **ALWAYS** use `docker compose exec app [command]` for npm/npx/node commands
- ⚠️ Dependencies are NOT installed locally - they only exist inside containers
- 🐳 Production uses specialized containers (separate migration and app containers)
- 📦 After modifying `package.json`, rebuild containers with `docker compose build app`

---

## Critical Implementation Details

### Session Management
The NextAuth session callback **always re-queries the database** for fresh user data. This means profile image updates, role changes, and nickname updates are immediately reflected in the session without requiring sign-out/sign-in.

### Upload Storage Strategy
The upload system detects the environment and automatically switches between local filesystem (dev) and Cloudinary (prod). Vercel's read-only filesystem is detected via `process.env.VERCEL === '1'`.

### Rate Limiting Implementation
Rate limiting tracks both IP address AND user ID to prevent both unauthenticated and authenticated abuse. The rate limiter stores timestamps in memory (resets on server restart).

### Review Images Storage
ServiceHistory.images is stored as a JSON array of strings (not a separate Image model). This allows flexible storage of both local paths (`/uploads/reviews/...`) and Cloudinary URLs (`https://res.cloudinary.com/...`).

### Voucher vs Promotion
- **Vouchers**: User-owned, code-based, single-use, can expire
- **Promotions**: Time-based, can be global or user-specific, reusable, service-specific

### Appointment-ServiceHistory Link
When an appointment is marked COMPLETED, a ServiceHistory record is created with `completedAt`, `finalPrice`, and optional `rating`/`feedback`. The appointment's `serviceHistoryId` links to this record.

---

## Common Pitfalls & Solutions

### Issue: Profile image not updating in UI
**Solution**: The session callback refetches user data on every request. If the image isn't updating, check:
1. Database was actually updated (`db.user.update`)
2. Image URL is accessible (correct path/Cloudinary URL)
3. Browser cache (hard refresh with Ctrl+Shift+R)

### Issue: Upload fails with "Rate limit exceeded"
**Solution**: Rate limiter allows 10 uploads/hour per user+IP. Wait or clear the in-memory rate limit store by restarting the server:
```bash
docker compose restart app
```

### Issue: Docker container can't connect to database
**Solution**: Ensure database container is running first:
```bash
docker compose up -d db
docker compose logs db  # Check for errors
```

### Issue: Prisma Client not generating
**Solution**: Run `npx prisma generate` after schema changes:
```bash
docker compose exec app npx prisma generate
```

### Issue: NextAuth session not persisting
**Solution**: Check:
1. `NEXTAUTH_SECRET` is set in `.env`
2. `NEXTAUTH_URL` matches your domain
3. Cookies are enabled in browser
4. Session strategy is JWT (not database)

---

## Documentation References

Comprehensive documentation exists in `/docs/`:
- `/docs/database/GUIA-DESENVOLVIMENTO.md` - Database development best practices
- `/docs/database/EXEMPLOS-PRATICOS.md` - Practical database examples
- `/docs/review-system.md` - Review system documentation
- `/docs/upload-system.md` - Upload system documentation
- `/docs/dashboard-admin.md` - Admin dashboard
- `/docs/dashboard-barber.md` - Barber dashboard
- `/docs/development/ROADMAP.md` - Project roadmap
- `/docs/docker/GUIA-MULTI-STAGE.md` - Docker multi-stage build guide

---

## Testing Approach

**Testing Library**: Jest + React Testing Library (configured)

**Test Location**: `/src/__tests__/`

**Test Commands**:
```bash
# Run inside Docker container
docker compose exec app npm run test              # Run all tests (not yet implemented in package.json)
docker compose exec app npm run type-check        # TypeScript type checking
docker compose exec app npm run validate          # Lint + Type check
```

**Key Testing Areas** (as mentioned in copilot-instructions.md):
- Authentication flows (login, registration, email verification)
- Appointment booking logic
- Voucher validation and redemption
- Role-based access control
- Rate limiting behavior

---

## Important Notes for AI Assistants

1. **Always check authentication** before performing server actions that modify data
2. **Use transactions** for multi-model operations (e.g., creating appointment + updating voucher status)
3. **Validate input** with Zod schemas before database operations
4. **Handle errors gracefully** with user-friendly messages, never expose stack traces
5. **Consider role-based access** - not all users can access all data
6. **Image uploads require rate limiting checks** - enforce limits via `/src/lib/rate-limiter.ts`
7. **ServiceHistory.images is an array** - handle multiple image URLs correctly
8. **Promotions can be global or targeted** - check both `isGlobal` and `UserPromotion` table
9. **Appointment status transitions** follow a strict lifecycle - validate state changes
10. **Session data is always fresh** - no need to manually refetch user data after updates
11. **⚠️ CRITICAL: All npm/npx commands MUST run inside Docker** - Use `docker compose exec app npm run <command>` instead of running npm directly. The ONLY exceptions are production scripts (`npm run db:*:prod`) which use shell scripts that handle their own Docker orchestration.