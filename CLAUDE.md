# CLAUDE.md

This file provides context for AI assistants working with this codebase.

## Project Overview

A Next.js application for tracking cat food preferences and inventory. The app allows users to:
- Track different cat food brands and types
- Record preferences (likes, dislikes, unknown)
- Manage inventory quantities
- Add notes about specific foods
- Filter foods by preference and inventory status
- Search through food notes
- Sort foods by name, preference, inventory, or date added
- Toggle between card and table view modes

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
├── .github/
│   └── workflows/         # GitHub Actions workflows
│       ├── claude.yml     # Claude PR Assistant workflow
│       └── claude-code-review.yml
├── app/
│   ├── api/
│   │   └── foods/        # API routes for food CRUD operations
│   │       ├── route.ts  # GET all, POST new food
│   │       └── [id]/
│   │           └── route.ts  # GET, PUT, DELETE by ID
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── button-group.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── radio-group.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   └── textarea.tsx
│   ├── add-food-dialog.tsx    # Dialog for adding new food
│   ├── edit-food-dialog.tsx   # Dialog for editing food
│   ├── food-card.tsx          # Card view for individual food
│   ├── food-filters.tsx       # Filtering and sorting controls
│   ├── food-list.tsx          # List container for foods
│   ├── food-table.tsx         # Table view for foods
│   ├── theme-provider.tsx     # Theme context provider
│   └── theme-toggle.tsx       # Dark/light mode toggle
├── lib/
│   ├── db/
│   │   ├── schema.ts     # Drizzle schema definitions
│   │   └── index.ts      # Database client
│   ├── supabase/
│   │   ├── client.ts     # Client-side Supabase client
│   │   └── server.ts     # Server-side Supabase client
│   └── utils.ts          # Utility functions (cn, etc.)
├── supabase/
│   └── migrations/       # Database migrations
├── biome.json            # Biome configuration
├── components.json       # Shadcn component configuration
├── drizzle.config.ts     # Drizzle Kit configuration
├── next.config.mjs       # Next.js configuration
├── postcss.config.mjs    # PostCSS configuration
└── tsconfig.json         # TypeScript configuration
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
- Environment variables configured (see below)

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

# Lint and format code with Biome
bunx biome check .
bunx biome check --write .  # Fix issues automatically

# Database migrations
bunx drizzle-kit generate  # Generate migrations from schema
bunx drizzle-kit migrate   # Apply pending migrations
bunx drizzle-kit push      # Push schema directly to database
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

### Filtering and Sorting
The `food-filters.tsx` component provides:
- **Search**: Filter by text in notes field
- **Preference Filter**: Toggle filters for likes/dislikes/unknown
- **Inventory Filter**: Show all, in-stock only, or out-of-stock only
- **Sort Options**: By name, preference, inventory quantity, or date added
- **Sort Order**: Toggle between ascending and descending
- **Minimize/Expand**: Collapse filter controls to save space

### View Modes
- **Card View**: Visual cards showing food details with icons
- **Table View**: Compact table format for viewing many items
- Toggle between views using the button group in the header

### Database Schema Changes
1. Modify `lib/db/schema.ts`
2. Generate migration: `bunx drizzle-kit generate`
3. Apply migration: `bunx drizzle-kit push`
4. Migrations are stored in `supabase/migrations/`

## File Naming Conventions
- Components: kebab-case (e.g., `food-card.tsx`)
- Utilities: kebab-case (e.g., `utils.ts`)
- Types/Interfaces: Follow TypeScript conventions

## GitHub Actions

The project includes GitHub Actions workflows for Claude Code integration:

### Claude PR Assistant (`claude.yml`)
- Triggers on issue comments, PR review comments, and new issues
- Activates when `@claude` is mentioned in comments
- Automatically helps with code reviews, questions, and tasks
- Requires `CLAUDE_CODE_OAUTH_TOKEN` secret to be configured

### Claude Code Review (`claude-code-review.yml`)
- Automated code review workflow
- Provides feedback on pull requests
