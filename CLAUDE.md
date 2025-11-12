# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js application for tracking cat food preferences, inventory, and meal logs. The app allows users to:
- Track different cat food brands and types
- Record preferences (likes, dislikes, unknown)
- Manage inventory quantities and archive foods
- Add notes about specific foods
- Filter foods by preference and inventory status
- Search through food notes
- Sort foods by name, preference, inventory, or date added
- Toggle between card and table view modes
- Log daily meals (morning/evening) with specific foods and amounts
- View meal history grouped by date

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
├── app/
│   ├── api/
│   │   ├── foods/        # API routes for food CRUD operations
│   │   │   ├── route.ts  # GET all, POST new food
│   │   │   └── [id]/route.ts  # GET, PUT, DELETE by ID
│   │   └── meals/        # API routes for meal logging
│   │       ├── route.ts  # GET all, POST new meal
│   │       └── [id]/route.ts  # GET, PUT, DELETE by ID
│   ├── meals/
│   │   └── page.tsx      # Meal log page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (food tracker)
├── components/
│   ├── ui/               # Reusable UI components (Radix primitives)
│   ├── add-food-dialog.tsx    # Dialog for adding new food
│   ├── add-meal-dialog.tsx    # Dialog for logging meals
│   ├── edit-food-dialog.tsx   # Dialog for editing food
│   ├── food-card.tsx          # Card view for individual food
│   ├── food-filters.tsx       # Filtering and sorting controls
│   ├── food-list.tsx          # List container for foods
│   ├── food-table.tsx         # Table view for foods
│   ├── theme-provider.tsx     # Theme context provider
│   └── theme-toggle.tsx       # Dark/light mode toggle
├── lib/
│   ├── db/
│   │   ├── schema.ts     # Drizzle schema definitions (foods, meals)
│   │   └── index.ts      # Database client
│   └── utils.ts          # Utility functions (cn, etc.)
├── supabase/
│   └── migrations/       # Database migrations
├── biome.json            # Biome configuration
├── drizzle.config.ts     # Drizzle Kit configuration
└── tsconfig.json         # TypeScript configuration
```

## Database Schema

The schema uses Drizzle ORM with PostgreSQL enums and relations. All tables have RLS policies allowing public access (consider restricting in production).

### foods table

| Column            | Type      | Constraints                            |
|-------------------|-----------|----------------------------------------|
| id                | uuid      | Primary key, auto-generated            |
| name              | text      | Not null                               |
| notes             | text      | Nullable                               |
| preference        | enum      | Not null, 'likes' \| 'dislikes' \| 'unknown' |
| inventory_quantity| integer   | Default 0, not null                    |
| archived          | boolean   | Default false, not null                |
| created_at        | timestamp | Default now, not null, with timezone   |
| updated_at        | timestamp | Default now, not null, with timezone   |

### meals table

| Column     | Type      | Constraints                            |
|------------|-----------|----------------------------------------|
| id         | uuid      | Primary key, auto-generated            |
| meal_date  | date      | Not null                               |
| meal_time  | enum      | Not null, 'morning' \| 'evening'       |
| food_id    | uuid      | Foreign key to foods.id, restrict on delete |
| amount     | text      | Not null                               |
| notes      | text      | Nullable                               |
| created_at | timestamp | Default now, not null, with timezone   |
| updated_at | timestamp | Default now, not null, with timezone   |

**Indexes:**
- `idx_meals_food_ids` on food_id
- `meals_date_time_unique` unique index on (meal_date, meal_time, food_id)

**Relations:**
- meals.food_id → foods.id (many-to-one)
- foods → meals (one-to-many)

## Development Setup

### Prerequisites
- Bun package manager
- PostgreSQL database (via Supabase)
- Node.js environment

### Environment Variables
Required in `.env.local`:
- `DATABASE_URL`: PostgreSQL connection string for Drizzle ORM

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

- **Formatting**: Use Biome for linting and formatting (tabs for indentation, double quotes)
- **Styling**: Use Tailwind CSS classes, combined with `cn()` utility from `lib/utils.ts`
- **Components**: Separate UI components (in `components/ui/`) from feature components
- **Database**: Use Drizzle ORM for all database operations, never raw SQL
- **Type Safety**: Leverage TypeScript for type safety throughout
- **API Routes**: Follow Next.js App Router conventions with proper error handling

## Important Notes

### v0.app Integration
- This project is automatically synced with v0.app deployments
- Changes from v0.app are automatically pushed to this repository
- Continue building on: https://v0.app/chat/dycOOl7Q0rF

### Database Operations
- All database operations use Drizzle ORM (no Supabase client usage in current implementation)
- RLS policies are configured to allow public access (consider restricting in production)
- Foreign key constraint: meals reference foods with `onDelete: "restrict"` to prevent orphaned meals

### Styling System
- Uses Tailwind CSS 4.x with PostCSS
- Component variants handled via `class-variance-authority`
- Theme support via `next-themes`
- Animation classes from `tw-animate-css`

### Data Validation
- Preference field uses enum: 'likes', 'dislikes', or 'unknown'
- Meal time uses enum: 'morning' or 'evening'
- Inventory quantity defaults to 0 and cannot be null
- Unique constraint on meals: one food per meal time per date

## Application Architecture

### Two Main Features

**Food Tracker** (`/` - app/page.tsx):
- Manages cat food inventory and preferences
- Provides filtering, sorting, and search capabilities
- Supports card and table view modes
- Uses `add-food-dialog.tsx` and `edit-food-dialog.tsx` for CRUD operations

**Meal Log** (`/meals` - app/meals/page.tsx):
- Records daily feeding history
- Groups meals by date with morning/evening time slots
- Uses `add-meal-dialog.tsx` to create meal entries
- Displays meals in a card-based timeline view

### API Layer

All API routes follow RESTful conventions:
- `GET /api/foods` - List all foods
- `POST /api/foods` - Create new food
- `GET /api/foods/[id]` - Get specific food
- `PUT /api/foods/[id]` - Update food
- `DELETE /api/foods/[id]` - Delete food

Same pattern for `/api/meals/` endpoints. The meals API includes food information via joins.

### Database Schema Changes

When modifying the schema:
1. Edit `lib/db/schema.ts`
2. Generate migration: `bunx drizzle-kit generate`
3. Apply changes: `bunx drizzle-kit push`
4. Migrations are stored in `supabase/migrations/`

## File Naming Conventions
- Components: kebab-case (e.g., `food-card.tsx`, `add-meal-dialog.tsx`)
- API routes: Follow Next.js conventions (`route.ts`, `[id]/route.ts`)
- All files use `.tsx` for React components, `.ts` for utilities
