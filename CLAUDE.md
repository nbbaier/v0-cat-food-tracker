# CLAUDE.md

This file provides context for AI assistants working with this codebase.

## Project Overview

A Next.js application for tracking cat food preferences, inventory, and meal logs. The app allows users to:

-  Track different cat food brands and types
-  Record preferences (likes, dislikes, unknown)
-  Manage inventory quantities and archive foods
-  Add notes about specific foods
-  Filter foods by preference and inventory status
-  Search through food notes
-  Sort foods by name, preference, inventory, or date added
-  Toggle between card and table view modes
-  Log meals (morning/evening) with specific foods and amounts
-  Track meal history with dates and notes

## Technology Stack

-  **Framework**: Next.js 16.0.0 with App Router
-  **Language**: TypeScript
-  **UI Components**:
   -  Radix UI primitives
   -  Custom components with Tailwind CSS
   -  Lucide icons
-  **Database**: PostgreSQL via Supabase
-  **ORM**: Drizzle ORM
-  **Styling**: Tailwind CSS 4.x
-  **Package Manager**: Bun
-  **Linting & Formatting**: Biome
-  **Deployment**: Vercel
-  **Analytics**: Vercel Analytics

## Project Structure

```
/
├── .github/
│   └── workflows/         # GitHub Actions workflows
│       ├── claude.yml     # Claude PR Assistant workflow
│       └── claude-code-review.yml
├── app/
│   ├── api/
│   │   ├── foods/        # API routes for food CRUD operations
│   │   │   ├── route.ts  # GET all, POST new food
│   │   │   └── [id]/
│   │   │       └── route.ts  # GET, PUT, DELETE by ID
│   │   └── meals/        # API routes for meal CRUD operations
│   │       ├── route.ts  # GET all, POST new meal
│   │       └── [id]/
│   │           └── route.ts  # GET, PUT, DELETE by ID
│   ├── meals/
│   │   └── page.tsx      # Meals tracking page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (foods list)
├── components/
│   ├── ui/               # Reusable UI scadcn components
│   ├── add-food-dialog.tsx    # Dialog for adding new food
│   ├── add-meal-dialog.tsx    # Dialog for adding new meal
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
│   └── utils.ts          # Utility functions (cn, etc.)
├── public/               # Static assets (icons, placeholders)
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

### Enums

-  **preference**: `'likes'`, `'dislikes'`, `'unknown'`
-  **meal_time_type**: `'morning'`, `'evening'`

### foods table

| Column             | Type            | Constraints                 |
| ------------------ | --------------- | --------------------------- |
| id                 | uuid            | Primary key, auto-generated |
| name               | text            | Not null                    |
| notes              | text            | Nullable                    |
| preference         | preference enum | Not null                    |
| inventory_quantity | integer         | Default 0, not null         |
| archived           | boolean         | Default false, not null     |
| created_at         | timestamp       | Default now, not null       |
| updated_at         | timestamp       | Default now, not null       |

### meals table

| Column     | Type                | Constraints                                           |
| ---------- | ------------------- | ----------------------------------------------------- |
| id         | uuid                | Primary key, auto-generated                           |
| meal_date  | date                | Not null                                              |
| meal_time  | meal_time_type enum | Not null                                              |
| food_id    | uuid                | Foreign key to foods.id, not null, on delete restrict |
| amount     | text                | Not null                                              |
| notes      | text                | Nullable                                              |
| created_at | timestamp           | Default now, not null                                 |
| updated_at | timestamp           | Default now, not null                                 |

**Indexes:**

-  `idx_meals_food_ids` on `food_id`
-  `meals_date_time_unique` unique index on `(meal_date, meal_time, food_id)`

**Relations:**

-  meals.food_id → foods.id (many-to-one)

Row Level Security (RLS) policies allow public access for all operations (select, insert, update, delete) on both tables.

## Development Setup

### Prerequisites

-  Bun package manager
-  PostgreSQL database (via Supabase)
-  Node.js environment
-  Environment variables configured (see below)

### Environment Variables

Required in `.env.local`:

-  Database URL

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

# Lint code with Biome
bun run lint

# Format code with Biome
bun run format

# Check and fix all issues (lint + format)
bun run check       # Check only
bun run check:fix   # Check and auto-fix

# Database migrations
bunx drizzle-kit generate  # Generate migrations from schema
bunx drizzle-kit migrate   # Apply pending migrations
bunx drizzle-kit push      # Push schema directly to database
```

## Code Conventions

-  **Styling**: Use Tailwind CSS classes, combined with `cn()` utility from `lib/utils.ts`
-  **Components**: Follow the established pattern of separating UI components from feature components
-  **Database**: Use Drizzle ORM for all database operations
-  **Type Safety**: Leverage TypeScript for type safety throughout

## Important Notes

### v0.app Integration

-  This project is automatically synced with v0.app deployments
-  Changes from v0.app are automatically pushed to this repository
-  Continue building on: https://v0.app/chat/dycOOl7Q0rF

### Database Operations

-  All database operations should use Drizzle ORM
-  RLS policies are configured to allow public access (consider restricting in production)

### Styling System

-  Uses Tailwind CSS 4.x with PostCSS
-  Component variants handled via `class-variance-authority`
-  Theme support via `next-themes`
-  Animation classes from `tw-animate-css`

### Data Validation

-  **Foods:**
   -  Preference field is constrained to: 'likes', 'dislikes', or 'unknown'
   -  Inventory quantity defaults to 0 and cannot be null
   -  Archived defaults to false and cannot be null
-  **Meals:**
   -  Meal time is constrained to: 'morning' or 'evening'
   -  Combination of (meal_date, meal_time, food_id) must be unique
   -  Foreign key constraint ensures food_id references a valid food record
   -  Deletion of foods with associated meals is restricted

## Common Tasks

### Adding a New Food

1. Use the `add-food-dialog.tsx` component
2. Required fields: name, preference
3. Optional fields: notes, inventory_quantity, archived
4. Preference must be one of: 'likes', 'dislikes', 'unknown'

### Updating Food Records

1. Use the `edit-food-dialog.tsx` component
2. All fields can be modified (name, preference, notes, inventory_quantity, archived)
3. `updated_at` timestamp is automatically updated

### Adding a Meal Log

1. Navigate to the meals page (`/meals`)
2. Use the `add-meal-dialog.tsx` component
3. Required fields: meal_date, meal_time, food_id, amount
4. Optional fields: notes
5. Meal time must be either 'morning' or 'evening'
6. Each combination of (date, time, food) must be unique

### Filtering and Sorting

The `food-filters.tsx` component provides:

-  **Search**: Filter by text in notes field
-  **Preference Filter**: Toggle filters for likes/dislikes/unknown
-  **Inventory Filter**: Show all, in-stock only, or out-of-stock only
-  **Sort Options**: By name, preference, inventory quantity, or date added
-  **Sort Order**: Toggle between ascending and descending
-  **Minimize/Expand**: Collapse filter controls to save space

### View Modes

-  **Card View**: Visual cards showing food details with icons
-  **Table View**: Compact table format for viewing many items
-  Toggle between views using the button group in the header

### Database Schema Changes

1. Modify `lib/db/schema.ts`
2. Generate migration: `bunx drizzle-kit generate`
3. Apply migration: `bunx drizzle-kit push`
4. Migrations are stored in `supabase/migrations/`

## File Naming Conventions

-  Components: kebab-case (e.g., `food-card.tsx`)
-  Utilities: kebab-case (e.g., `utils.ts`)
-  Types/Interfaces: Follow TypeScript conventions

## GitHub Actions

The project includes GitHub Actions workflows for Claude Code integration:

### Claude PR Assistant (`claude.yml`)

-  Triggers on issue comments, PR review comments, and new issues
-  Activates when `@claude` is mentioned in comments
-  Automatically helps with code reviews, questions, and tasks
-  Requires `CLAUDE_CODE_OAUTH_TOKEN` secret to be configured

### Claude Code Review (`claude-code-review.yml`)

-  Automated code review workflow
-  Provides feedback on pull requests
