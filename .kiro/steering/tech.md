# Technology Stack

## Build System & Package Management
- **Turborepo**: Monorepo build system for optimized builds and caching
- **pnpm**: Package manager (version 10.4.0)
- **TypeScript**: Primary language for type safety

## Frontend (Web App)
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TailwindCSS 4**: Utility-first CSS framework
- **shadcn/ui**: Reusable component library
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library
- **next-themes**: Theme management
- **Sonner**: Toast notifications

## Backend (Server)
- **Express 5**: Web framework
- **tRPC 11**: Type-safe API layer
- **Drizzle ORM**: TypeScript-first database ORM
- **SQLite/Turso**: Database engine
- **Better Auth**: Authentication system
- **AI SDK**: AI integration with Google Gemini

## Development Tools
- **tsx**: TypeScript execution for development
- **tsdown**: TypeScript build tool
- **Drizzle Kit**: Database migration and studio tools

## Common Commands

### Development
```bash
pnpm dev              # Start all apps in development
pnpm dev:web          # Start only web app (port 3001)
pnpm dev:server       # Start only server (port 3000)
```

### Building
```bash
pnpm build            # Build all applications
pnpm check-types      # Type check all apps
```

### Database Operations
```bash
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open Drizzle Studio UI
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
cd apps/server && pnpm db:local  # Start local SQLite database
```

### Installation
```bash
pnpm install          # Install all dependencies
```

## Environment Setup
- Web app runs on port 3001
- Server runs on port 3000
- Environment variables are managed per app in `.env` files
- Database connection configured via `DATABASE_URL` and `DATABASE_AUTH_TOKEN`