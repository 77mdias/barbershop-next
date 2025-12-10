# Gemini Code Assistant Context

This file provides context for the Gemini Code Assistant to understand the project and provide better assistance.

# Project Overview

This is a modern barbershop application built with Next.js 14, TypeScript, and Tailwind CSS. It features a comprehensive set of functionalities including appointment scheduling, user management with different roles (client, barber, admin), a review system, real-time chat and notifications, and a promotion/voucher system.

The backend is powered by Next.js Server Actions and Prisma ORM with a PostgreSQL database. The frontend uses a component-based architecture with shadcn/ui and Radix UI. The project is set up with Docker for a consistent development and production environment.

# Building and Running

## Prerequisites

- Node.js 18+
- npm, yarn, pnpm or bun
- Docker (optional, but recommended)

## Development

The recommended way to run the project for development is using the provided script:

```bash
# Start the development environment (Next.js app and database)
./scripts/docker-manager.sh up dev
```

Alternatively, you can use npm/yarn/pnpm/bun:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Building for Production

To build the application for production, you can use the following command:

```bash
npm run build
```

To run the production build:

```bash
npm run start
```

For production deployment with Docker, refer to the `README.md` and the scripts in the `/scripts` directory.

## Testing

To run the tests:

```bash
npm test
```

# Development Conventions

## Code Style

The project uses ESLint and Prettier for code linting and formatting. Please ensure your code adheres to the project's coding standards by running the linter before committing your changes:

```bash
npm run lint
```

## Database Migrations

Database migrations are managed by Prisma. To create a new migration, use the following command:

```bash
npm run db:migrate -- --name <migration_name>
```

To apply migrations, use:

```bash
npm run db:migrate
```

For production environments, it is recommended to use the provided scripts to ensure a safe migration process. See the `README.md` for more details.

## Contribution Guidelines

- Follow the existing code style and conventions.
- Write tests for new features and bug fixes.
- Keep the documentation up-to-date.
- For major changes, please open an issue first to discuss what you would like to change.
