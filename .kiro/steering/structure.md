# Project Structure

## Monorepo Organization
This is a Turborepo monorepo with the following structure:

```
better-care/
├── apps/
│   ├── web/         # Next.js frontend application
│   └── server/      # Express backend with tRPC
├── packages/        # Shared packages (if any)
└── [root config files]
```

## Frontend App (`apps/web/`)
```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── ai/                # AI chat interface
│   │   ├── dashboard/         # User dashboard
│   │   ├── login/             # Authentication pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── header.tsx        # App header
│   │   ├── providers.tsx     # Context providers
│   │   └── [auth components] # Authentication forms
│   ├── lib/                  # Utility libraries
│   │   ├── auth-client.ts    # Client-side auth
│   │   └── utils.ts          # General utilities
│   ├── utils/                # App-specific utilities
│   │   └── trpc.ts           # tRPC client setup
│   └── index.css             # Global styles
├── components.json           # shadcn/ui configuration
├── next.config.ts           # Next.js configuration
├── postcss.config.mjs       # PostCSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Backend App (`apps/server/`)
```
apps/server/
├── src/
│   ├── db/                   # Database layer
│   │   ├── schema/          # Drizzle schema definitions
│   │   │   └── auth.ts      # Authentication schema
│   │   └── index.ts         # Database connection
│   ├── lib/                 # Core libraries
│   │   ├── auth.ts          # Better Auth configuration
│   │   ├── context.ts       # tRPC context
│   │   └── trpc.ts          # tRPC setup
│   ├── routers/             # tRPC route handlers
│   └── index.ts             # Express server entry point
├── drizzle.config.ts        # Drizzle ORM configuration
└── tsconfig.json            # TypeScript configuration
```

## Key Conventions

### File Naming
- Use kebab-case for directories and files
- React components use PascalCase for the component name
- TypeScript files use `.ts` extension, React components use `.tsx`

### Import Patterns
- Use absolute imports with `@/` alias for `src/` directory in web app
- Organize imports: external libraries first, then internal modules
- Use named exports for utilities, default exports for components

### Component Organization
- UI components in `components/ui/` (shadcn/ui)
- Feature components in `components/`
- Page components in `app/` directory (Next.js App Router)

### Database Schema
- Schema files organized by domain in `src/db/schema/`
- Use Drizzle ORM for all database operations
- Migrations stored in `src/db/migrations/`

### API Structure
- tRPC routers organized by feature in `src/routers/`
- Type-safe communication between frontend and backend
- Authentication handled via Better Auth middleware

### Environment Configuration
- Separate `.env` files for each app
- `.env.example` files provided as templates
- Database and auth tokens configured per environment