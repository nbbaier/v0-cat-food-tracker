# CLAUDE.md

This file provides context for AI assistants working with this codebase.

## Project Overview

A Next.js application for tracking cat food preferences and inventory. The app allows users to:
- Track different cat food brands and types
- Record preferences (likes, dislikes, unknown)
- Manage inventory quantities
- Add notes about specific foods

## Technology Stack

- **Framework**: Next.js 16.0.0 with App Router
- **Language**: TypeScript
- **UI Components**:
  - Radix UI primitives
  - Custom components with Tailwind CSS
  - Lucide icons
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4.x
- **Package Manager**: Bun
- **Linting**: Biome
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Project Structure

```
/
├── app/                    # Next.js app directory
├── components/
│   ├── ui/                # Reusable UI components (buttons, cards, etc.)
│   ├── add-food-dialog.tsx
│   ├── edit-food-dialog.tsx
│   ├── food-card.tsx
│   ├── food-list.tsx
│   ├── food-table.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts      # Drizzle schema definitions
│   │   └── index.ts       # Database client
│   ├── supabase/
│   │   ├── client.ts      # Client-side Supabase client
│   │   └── server.ts      # Server-side Supabase client
│   └── utils.ts           # Utility functions (cn, etc.)
└── drizzle/              # Database migrations

```

## Database Schema

### foods table

| Column            | Type      | Constraints                            |
|-------------------|-----------|----------------------------------------|
| id                | uuid      | Primary key, auto-generated            |
| name              | text      | Not null                               |
| notes             | text      | Nullable                               |
| preference        | text      | Not null, check: 'likes', 'dislikes', 'unknown' |
| inventory_quantity| integer   | Default 0, not null                    |
| created_at        | timestamp | Default now, not null                  |
| updated_at        | timestamp | Default now, not null                  |

Row Level Security (RLS) policies allow public access for all operations (select, insert, update, delete).

## Development Setup

### Prerequisites
- Bun package manager
- PostgreSQL database (via Supabase)
- Node.js environment

### Environment Variables
Required in `.env.local`:
- Supabase connection credentials
- Database URL

### Common Commands

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint

# Database migrations
bunx drizzle-kit generate
bunx drizzle-kit migrate
bunx drizzle-kit push
```

## Code Conventions

- **Styling**: Use Tailwind CSS classes, combined with `cn()` utility from `lib/utils.ts`
- **Components**: Follow the established pattern of separating UI components from feature components
- **Database**: Use Drizzle ORM for all database operations
- **Type Safety**: Leverage TypeScript for type safety throughout

## Important Notes

### v0.app Integration
- This project is automatically synced with v0.app deployments
- Changes from v0.app are automatically pushed to this repository
- Continue building on: https://v0.app/chat/dycOOl7Q0rF

### Database Operations
- All database operations should use Drizzle ORM
- RLS policies are configured to allow public access (consider restricting in production)
- Always use the server-side Supabase client for server components

### Styling System
- Uses Tailwind CSS 4.x with PostCSS
- Component variants handled via `class-variance-authority`
- Theme support via `next-themes`
- Animation classes from `tw-animate-css`

### Data Validation
- Preference field is constrained to: 'likes', 'dislikes', or 'unknown'
- Inventory quantity defaults to 0 and cannot be null

## Common Tasks

### Adding a New Food
1. Use the `add-food-dialog.tsx` component
2. Required fields: name, preference
3. Optional fields: notes, inventory_quantity

### Updating Food Records
1. Use the `edit-food-dialog.tsx` component
2. All fields can be modified
3. `updated_at` timestamp is automatically updated

### Database Schema Changes
1. Modify `lib/db/schema.ts`
2. Generate migration: `bunx drizzle-kit generate`
3. Apply migration: `bunx drizzle-kit push`

## File Naming Conventions
- Components: kebab-case (e.g., `food-card.tsx`)
- Utilities: kebab-case (e.g., `utils.ts`)
- Types/Interfaces: Follow TypeScript conventions
