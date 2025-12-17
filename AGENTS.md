# AGENTS.md

IMPORTANT: When you have read this file, say "Agents: understood".

This file provides context for AI assistants working with this codebase.

## Project Overview

A Next.js application for tracking cat food preferences, inventory, and meal logs. The app allows users to:

-  Track different cat food brands and types
-  Record preferences (likes, neutral, dislikes, unknown)
-  Manage inventory quantities and archive foods
-  Add notes about specific foods
-  Track nutritional information (phosphorus, protein, fat, fiber on dry matter basis)
-  Filter foods by preference and inventory status
-  Search through food notes
-  Sort foods by name, preference, inventory, or date added
-  Toggle between card and list view modes
-  Log meals (morning/evening) with specific foods and amounts
-  Track meal history with dates and notes
-  User authentication and session management

## Commands

-  **Dev**: `bun run dev`
-  **Build**: `bun run build` (always run after changes to check for errors)
-  **Lint**: `bun run lint`
-  **Format**: `bun run format`
-  **Check/Fix**: `bun run check` (check only), `bun run check:fix` (auto-fix)
-  **DB Generate**: `bunx drizzle-kit generate` (create migrations)
-  **DB Migrate**: `bunx drizzle-kit migrate` (apply pending migrations)
-  **DB Push**: `bunx drizzle-kit push` (push schema directly to database)
-  **Tests**: No test suite configured

## Technology Stack

-  **Framework**: Next.js 16.0.0 with App Router
-  **Language**: TypeScript
-  **UI Components**: Radix UI primitives, Base UI, Lucide icons, custom Tailwind components
-  **Database**: PostgreSQL via Supabase
-  **ORM**: Drizzle ORM
-  **Authentication**: Better Auth
-  **Styling**: Tailwind CSS 4.x
-  **Package Manager**: Bun
-  **Linting & Formatting**: Biome
-  **Form Handling**: React Hook Form with Zod validation
-  **Notifications**: Sonner (toast notifications)
-  **Deployment**: Vercel
-  **Analytics**: Vercel Analytics

## Architecture

-  **Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4.x, Drizzle ORM, PostgreSQL (Supabase)
-  **Structure**: `/app` (pages + API routes), `/components` (UI + feature components), `/lib/db` (schema + client), `/supabase/migrations`
-  **Directory Layout**:
   -  `app/api/` - API routes for auth, foods, meals
   -  `app/foods/` - Foods list page
   -  `app/meals/` - Meals tracking page
   -  `app/sign-in/`, `app/sign-up/` - Authentication pages
   -  `components/auth/` - Authentication components
   -  `components/foods/` - Food-related components
   -  `components/home/` - Home page components
   -  `components/layout/` - Layout components
   -  `components/meals/` - Meal-related components
   -  `components/shared/` - Shared utility components
   -  `components/theme/` - Theme components
   -  `components/ui/` - Reusable shadcn/ui components
   -  `lib/auth/` - Authentication configuration
   -  `lib/db/` - Database schema and client
-  **Database**: Foods table (tracks preferences, inventory), Meals table (tracks meal logs with food_id FK), User/Session/Account tables (Better Auth)
-  **API Routes**: `/api/foods` and `/api/meals` for CRUD operations, `/api/auth` for authentication

## Database Schema

### Enums

-  **preference**: `'likes'`, `'neutral'`, `'dislikes'`, `'unknown'`
-  **meal_time_type**: `'morning'`, `'evening'`

### Main Tables

**foods**

-  id (uuid, PK)
-  name (text)
-  notes (text, nullable)
-  preference (preference enum)
-  inventory_quantity (integer, default 0)
-  archived (boolean, default false)
-  phosphorus_dmb, protein_dmb, fat_dmb, fiber_dmb (numeric(5,2), default 0)
-  created_at, updated_at (timestamp)
-  Indexes: created_at, preference, inventory_quantity, (archived, created_at DESC)

**meals**

-  id (uuid, PK)
-  meal_date (date)
-  meal_time (meal_time_type enum)
-  food_id (uuid, FK to foods.id)
-  amount (text)
-  notes (text, nullable)
-  created_at, updated_at (timestamp)
-  Unique constraint on (meal_date, meal_time, food_id)
-  Indexes: food_id, (meal_date, meal_time), created_at

**user, session, account, verification** (Better Auth tables)

RLS policies allow public access on foods and meals tables.

## Code Conventions

-  **Styling**: Use Tailwind CSS classes, combined with `cn()` utility from `lib/utils.ts`
-  **Formatting**: Tabs (indentStyle), double quotes, Biome for linting/formatting
-  **Naming**: kebab-case for files (e.g., `food-card.tsx`), TypeScript conventions for types
-  **Components**:
   -  Organized into feature-based directories (auth, foods, meals, layout, shared, theme)
   -  UI primitives in `components/ui/`
   -  Follow the established pattern of separating UI components from feature components
-  **Database**: Use Drizzle ORM for all database operations
-  **Type Safety**: Leverage TypeScript for type safety throughout
-  **Validation**: Use Zod schemas for input validation (schemas in `lib/validations.ts`)
-  **Error Handling**: Use `safeLogError` and `getErrorDetails` utilities from `lib/utils.ts`
-  **Imports**: Path alias `@/*` maps to root; organize imports with Biome's auto-organize
-  **Database**: Always use Drizzle ORM; schema in `lib/db/schema.ts`; enums: `preference` (likes/neutral/dislikes/unknown), `meal_time_type` (morning/evening)
-  **Validation**: Use Zod schemas in `lib/validations.ts` for input validation

## Component Patterns

### Client vs Server Components

-  Pages are server components by default
-  Client-side interactivity wrapped in `-client.tsx` components (e.g., `foods-page-client.tsx`)
-  Use `"use client"` directive sparingly, only when needed for hooks/interactivity

### Form Handling

-  Use React Hook Form with Zod validation
-  Form schemas defined in `lib/validations.ts`
-  Error messages displayed via form state
-  Success notifications via Sonner toasts

### State Management

-  React Context for shared UI state (QuickAddContext, HeaderContext)
-  Server-side data fetching in Server Components where possible
-  Client-side state for filters, dialogs, and interactive UI

### Dialogs and Modals

-  Use Radix UI Dialog primitives
-  Confirmation dialogs use the shared `confirm-dialog.tsx` component
-  Quick-add functionality via `quick-add-dialog.tsx` with context provider

### Data Display

-  Card view for visual presentation with detailed information
-  List view for compact, scannable display
-  Nutrition information displayed via `nutrition-display.tsx` component
-  Preference icons via `preference-icon.tsx` component

## API Routes

### Foods API (`/api/foods`)

**GET /api/foods**

-  Supports cursor-based pagination
-  Query parameters:
   -  `limit`: Number of items (default: 100, max: 500)
   -  `cursor`: Timestamp in milliseconds for pagination
   -  `archived`: Filter by archived status ("true" | "false")
-  Returns: `{ foods: Food[], hasMore: boolean }`
-  Ordered by `createdAt DESC` (newest first)
-  Requires authentication

**POST /api/foods**

-  Creates a new food record
-  Request body validated with Zod schema
-  Returns created food object
-  Requires authentication

**GET /api/foods/[id]**

-  Retrieves a specific food by ID
-  Requires authentication

**PUT /api/foods/[id]**

-  Updates a food record
-  Request body validated with Zod schema
-  Requires authentication

**DELETE /api/foods/[id]**

-  Deletes a food record
-  Checks for associated meals before deletion
-  Returns 409 if meals exist (restricted deletion)
-  Requires authentication

### Meals API (`/api/meals`)

**GET /api/meals**

-  Supports cursor-based pagination
-  Query parameters similar to foods API
-  Includes related food data in response
-  Ordered by `createdAt DESC`
-  Requires authentication

**POST /api/meals**

-  Creates a new meal record
-  Validates unique constraint (date, time, food_id)
-  Requires authentication

**GET /api/meals/[id]**

-  Retrieves a specific meal with related food data
-  Requires authentication

**PUT /api/meals/[id]**

-  Updates a meal record
-  Requires authentication

**DELETE /api/meals/[id]**

-  Deletes a meal record
-  Requires authentication

### Authentication API (`/api/auth`)

-  Handled by Better Auth library
-  Endpoints for sign-in, sign-up, session management
-  See Better Auth documentation for details

## Important Notes

### Styling System

-  Tailwind CSS 4.x with PostCSS
-  Component variants via `class-variance-authority`
-  Theme support via `next-themes`
-  Animation classes from `tw-animate-css`

### Data Validation

-  **Foods:**
   -  Preference field is constrained to: 'likes', 'neutral', 'dislikes', or 'unknown'
   -  Inventory quantity defaults to 0 and cannot be null
   -  Archived defaults to false and cannot be null
   -  Nutrition fields (phosphorus_dmb, protein_dmb, fat_dmb, fiber_dmb) are stored as percentages on dry matter basis with 2 decimal precision, default to 0
-  **Meals:**
   -  Meal time is constrained to: 'morning' or 'evening'
   -  Combination of (meal_date, meal_time, food_id) must be unique
   -  Foreign key constraint ensures food_id references a valid food record
   -  Deletion of foods with associated meals is restricted
-  **Authentication:**
   -  User emails must be unique
   -  Sessions and accounts have cascade deletion when user is deleted
   -  Session tokens must be unique

## Common Tasks

### Adding a New Food

1. Use `quick-add-dialog.tsx` or food form
2. Required: name, preference
3. Optional: notes, inventory_quantity, archived, nutrition fields
4. Preference must be one of: 'likes', 'neutral', 'dislikes', 'unknown'
5. Nutrition fields are percentages on dry matter basis (0-100)

### Updating Food Records

1. Use `edit-food-dialog.tsx`
2. All fields can be modified
3. `updated_at` timestamp is automatically updated

### Adding a Meal Log

1. Home page (`/`) shows meal creation form by default
2. Date auto-populates to today, time auto-selects AM (<2pm) or PM (>=2pm)
3. Search/filter foods by typing; create new food inline if not found
4. Required fields: meal_date, meal_time, food_id, amount
5. Optional fields: notes
6. Each combination of (date, time, food) must be unique

### Database Schema Changes

1. Modify `lib/db/schema.ts`
2. Generate migration: `bunx drizzle-kit generate`
3. Apply migration: `bunx drizzle-kit push`
4. Migrations are stored in `supabase/migrations/`

## GitHub Actions

The project includes GitHub Actions workflows for Claude Code integration:

### Claude PR Assistant (`claude.yml`)

-  Triggers on:
   -  Issue comments and new issues (when `@claude` is mentioned)
   -  PR review comments (when `@claude` is mentioned)
   -  PR reviews (when `@claude` is mentioned)
-  Automatically helps with code reviews, questions, and tasks
-  Has permissions to read CI results on PRs
-  Requires `CLAUDE_CODE_OAUTH_TOKEN` secret to be configured

### Claude Code Review (`claude-code-review.yml`)

-  Triggers on PR opened and synchronize events
-  Automatically reviews pull requests for:
   -  Code quality and best practices
   -  Potential bugs or issues
   -  Performance considerations
   -  Security concerns
   -  Test coverage
-  Posts review feedback as PR comments
-  Uses this CLAUDE.md file for context on coding conventions
-  Requires `CLAUDE_CODE_OAUTH_TOKEN` secret to be configured
