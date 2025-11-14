# CLAUDE.md

This file provides context for AI assistants working with this codebase.

## Project Overview

A Next.js application for tracking cat food preferences, inventory, and meal logs. The app allows users to:

- Track different cat food brands and types
- Record preferences (likes, dislikes, unknown)
- Manage inventory quantities and archive foods
- Add notes about specific foods
- Track nutritional information (phosphorus, protein, fat, fiber on dry matter basis)
- Filter foods by preference and inventory status
- Search through food notes
- Sort foods by name, preference, inventory, or date added
- Toggle between card and list view modes
- Log meals (morning/evening) with specific foods and amounts
- Track meal history with dates and notes
- User authentication and session management

## Technology Stack

- **Framework**: Next.js 16.0.0 with App Router
- **Language**: TypeScript
- **UI Components**:
   - Radix UI primitives
   - Base UI components (React)
   - Custom components with Tailwind CSS
   - Lucide icons
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **Styling**: Tailwind CSS 4.x
- **Package Manager**: Bun
- **Linting & Formatting**: Biome
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: Sonner (toast notifications)
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Project Structure

```
/
├── .github/
│   └── workflows/             # GitHub Actions workflows
│       ├── claude.yml         # Claude PR Assistant workflow
│       └── claude-code-review.yml
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication API routes
│   │   ├── foods/             # API routes for food CRUD operations
│   │   │   ├── route.ts       # GET all, POST new food
│   │   │   └── [id]/
│   │   │       └── route.ts   # GET, PUT, DELETE by ID
│   │   └── meals/             # API routes for meal CRUD operations
│   │       ├── route.ts       # GET all, POST new meal
│   │       └── [id]/
│   │           └── route.ts   # GET, PUT, DELETE by ID
│   ├── foods/
│   │   └── page.tsx           # Foods list page
│   ├── meals/
│   │   └── page.tsx           # Meals tracking page
│   ├── sign-in/
│   │   └── page.tsx           # Sign in page
│   ├── sign-up/
│   │   └── page.tsx           # Sign up page
│   ├── error.tsx              # Error boundary
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   ├── auth/                  # Authentication components
│   │   ├── auth-buttons.tsx   # Auth action buttons
│   │   ├── sign-in-form.tsx   # Sign in form
│   │   ├── sign-up-form.tsx   # Sign up form
│   │   ├── user-button.tsx    # User menu button
│   │   └── user-dropdown.tsx  # User dropdown menu
│   ├── foods/                 # Food-related components
│   │   ├── edit-food-dialog.tsx      # Dialog for editing food
│   │   ├── food-card.tsx             # Card view for individual food
│   │   ├── food-filters.tsx          # Filtering and sorting controls
│   │   ├── food-form.tsx             # Food form component
│   │   ├── food-item.tsx             # Individual food item
│   │   ├── food-list.tsx             # List container for foods
│   │   └── foods-page-client.tsx     # Client-side foods page wrapper
│   ├── layout/                # Layout components
│   │   ├── app-header.tsx     # Application header
│   │   ├── header-context.tsx # Header state management
│   │   └── quick-add-dialog.tsx      # Quick add dialog
│   ├── meals/                 # Meal-related components
│   │   ├── meal-card.tsx      # Meal card display
│   │   ├── meal-filters.tsx   # Meal filtering controls
│   │   └── meals-page-client.tsx     # Client-side meals page wrapper
│   ├── shared/                # Shared utility components
│   │   ├── confirm-dialog.tsx        # Confirmation dialog
│   │   ├── nutrition-display.tsx     # Nutrition info display
│   │   ├── preference-icon.tsx       # Preference icon component
│   │   ├── preference-radio-group.tsx # Preference selection
│   │   └── quick-add-context.tsx     # Quick add state management
│   ├── theme/                 # Theme components
│   │   └── theme-toggle.tsx   # Dark/light mode toggle
│   └── ui/                    # Reusable UI components (shadcn/ui)
├── lib/
│   ├── auth/                  # Authentication configuration
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema definitions
│   │   └── index.ts           # Database client
│   └── utils.ts               # Utility functions (cn, etc.)
├── public/                    # Static assets (icons, placeholders)
├── supabase/
│   └── migrations/            # Database migrations
├── biome.json                 # Biome configuration
├── components.json            # Shadcn component configuration
├── drizzle.config.ts          # Drizzle Kit configuration
├── next.config.mjs            # Next.js configuration
├── postcss.config.mjs         # PostCSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Database Schema

### Enums

- **preference**: `'likes'`, `'dislikes'`, `'unknown'`
- **meal_time_type**: `'morning'`, `'evening'`

### foods table

| Column             | Type            | Constraints                 |
| ------------------ | --------------- | --------------------------- |
| id                 | uuid            | Primary key, auto-generated |
| name               | text            | Not null                    |
| notes              | text            | Nullable                    |
| preference         | preference enum | Not null                    |
| inventory_quantity | integer         | Default 0, not null         |
| archived           | boolean         | Default false, not null     |
| phosphorus_dmb     | numeric(5,2)    | Default 0, not null         |
| protein_dmb        | numeric(5,2)    | Default 0, not null         |
| fat_dmb            | numeric(5,2)    | Default 0, not null         |
| fiber_dmb          | numeric(5,2)    | Default 0, not null         |
| created_at         | timestamp       | Default now, not null       |
| updated_at         | timestamp       | Default now, not null       |

**Indexes:**

- `idx_foods_created_at` on `created_at`
- `idx_foods_preference` on `preference`
- `idx_foods_inventory` on `inventory_quantity`
- `idx_foods_archived_created` on `(archived, created_at DESC)`

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

- `idx_meals_food_ids` on `food_id`
- `idx_meals_mealdate_mealtime` on `(meal_date, meal_time)`
- `idx_meals_created_at` on `created_at`
- `meals_date_time_unique` unique index on `(meal_date, meal_time, food_id)`

**Relations:**

- meals.food_id → foods.id (many-to-one)

### user table

| Column         | Type      | Constraints                 |
| -------------- | --------- | --------------------------- |
| id             | text      | Primary key                 |
| name           | text      | Not null                    |
| email          | text      | Not null, unique            |
| email_verified | boolean   | Default false, not null     |
| image          | text      | Nullable                    |
| created_at     | timestamp | Default now, not null       |
| updated_at     | timestamp | Default now, not null       |

### session table

| Column     | Type      | Constraints                                            |
| ---------- | --------- | ------------------------------------------------------ |
| id         | text      | Primary key                                            |
| expires_at | timestamp | Not null                                               |
| token      | text      | Not null, unique                                       |
| created_at | timestamp | Default now, not null                                  |
| updated_at | timestamp | Not null                                               |
| ip_address | text      | Nullable                                               |
| user_agent | text      | Nullable                                               |
| user_id    | text      | Foreign key to user.id, not null, on delete cascade    |

**Indexes:**

- `idx_session_user_id` on `user_id`

### account table

| Column                    | Type      | Constraints                                            |
| ------------------------- | --------- | ------------------------------------------------------ |
| id                        | text      | Primary key                                            |
| account_id                | text      | Not null                                               |
| provider_id               | text      | Not null                                               |
| user_id                   | text      | Foreign key to user.id, not null, on delete cascade    |
| access_token              | text      | Nullable                                               |
| refresh_token             | text      | Nullable                                               |
| id_token                  | text      | Nullable                                               |
| access_token_expires_at   | timestamp | Nullable                                               |
| refresh_token_expires_at  | timestamp | Nullable                                               |
| scope                     | text      | Nullable                                               |
| password                  | text      | Nullable                                               |
| created_at                | timestamp | Default now, not null                                  |
| updated_at                | timestamp | Not null                                               |

**Indexes:**

- `idx_account_user_id` on `user_id`

### verification table

| Column     | Type      | Constraints                 |
| ---------- | --------- | --------------------------- |
| id         | text      | Primary key                 |
| identifier | text      | Not null                    |
| value      | text      | Not null                    |
| expires_at | timestamp | Not null                    |
| created_at | timestamp | Default now, not null       |
| updated_at | timestamp | Default now, not null       |

**Indexes:**

- `idx_verification_identifier` on `identifier`

Row Level Security (RLS) policies allow public access for all operations (select, insert, update, delete) on the foods and meals tables.

## Development Setup

### Prerequisites

- Bun package manager
- PostgreSQL database (via Supabase)
- Node.js environment
- Environment variables configured (see below)

### Environment Variables

Required in `.env.local`:

- `DATABASE_URL`: PostgreSQL connection string (Supabase)
- Better Auth configuration variables (see Better Auth documentation)

Note: Never commit `.env.local` to version control

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

- **Styling**: Use Tailwind CSS classes, combined with `cn()` utility from `lib/utils.ts`
- **Components**:
  - Organized into feature-based directories (auth, foods, meals, layout, shared, theme)
  - UI primitives in `components/ui/`
  - Follow the established pattern of separating UI components from feature components
- **Database**: Use Drizzle ORM for all database operations
- **Type Safety**: Leverage TypeScript for type safety throughout
- **Validation**: Use Zod schemas for input validation (schemas in `lib/validations.ts`)
- **Error Handling**: Use `safeLogError` and `getErrorDetails` utilities from `lib/utils.ts`

## Component Patterns

### Client vs Server Components

- Pages are server components by default
- Client-side interactivity wrapped in `-client.tsx` components (e.g., `foods-page-client.tsx`)
- Use `"use client"` directive sparingly, only when needed for hooks/interactivity

### Form Handling

- Use React Hook Form with Zod validation
- Form schemas defined in `lib/validations.ts`
- Error messages displayed via form state
- Success notifications via Sonner toasts

### State Management

- React Context for shared UI state (QuickAddContext, HeaderContext)
- Server-side data fetching in Server Components where possible
- Client-side state for filters, dialogs, and interactive UI

### Dialogs and Modals

- Use Radix UI Dialog primitives
- Confirmation dialogs use the shared `confirm-dialog.tsx` component
- Quick-add functionality via `quick-add-dialog.tsx` with context provider

### Data Display

- Card view for visual presentation with detailed information
- List view for compact, scannable display
- Nutrition information displayed via `nutrition-display.tsx` component
- Preference icons via `preference-icon.tsx` component

## API Routes

### Foods API (`/api/foods`)

**GET /api/foods**
- Supports cursor-based pagination
- Query parameters:
  - `limit`: Number of items (default: 100, max: 500)
  - `cursor`: Timestamp in milliseconds for pagination
  - `archived`: Filter by archived status ("true" | "false")
- Returns: `{ foods: Food[], hasMore: boolean }`
- Ordered by `createdAt DESC` (newest first)
- Requires authentication

**POST /api/foods**
- Creates a new food record
- Request body validated with Zod schema
- Returns created food object
- Requires authentication

**GET /api/foods/[id]**
- Retrieves a specific food by ID
- Requires authentication

**PUT /api/foods/[id]**
- Updates a food record
- Request body validated with Zod schema
- Requires authentication

**DELETE /api/foods/[id]**
- Deletes a food record
- Checks for associated meals before deletion
- Returns 409 if meals exist (restricted deletion)
- Requires authentication

### Meals API (`/api/meals`)

**GET /api/meals**
- Supports cursor-based pagination
- Query parameters similar to foods API
- Includes related food data in response
- Ordered by `createdAt DESC`
- Requires authentication

**POST /api/meals**
- Creates a new meal record
- Validates unique constraint (date, time, food_id)
- Requires authentication

**GET /api/meals/[id]**
- Retrieves a specific meal with related food data
- Requires authentication

**PUT /api/meals/[id]**
- Updates a meal record
- Requires authentication

**DELETE /api/meals/[id]**
- Deletes a meal record
- Requires authentication

### Authentication API (`/api/auth`)

- Handled by Better Auth library
- Endpoints for sign-in, sign-up, session management
- See Better Auth documentation for details

## Important Notes

### v0.app Integration

- This project is automatically synced with v0.app deployments
- Changes from v0.app are automatically pushed to this repository
- Continue building on: https://v0.app/chat/dycOOl7Q0rF

### Database Operations

- All database operations should use Drizzle ORM
- RLS policies are configured to allow public access (consider restricting in production)

### Styling System

- Uses Tailwind CSS 4.x with PostCSS
- Component variants handled via `class-variance-authority`
- Theme support via `next-themes`
- Animation classes from `tw-animate-css`

### Data Validation

- **Foods:**
   - Preference field is constrained to: 'likes', 'dislikes', or 'unknown'
   - Inventory quantity defaults to 0 and cannot be null
   - Archived defaults to false and cannot be null
   - Nutrition fields (phosphorus_dmb, protein_dmb, fat_dmb, fiber_dmb) are stored as percentages on dry matter basis with 2 decimal precision, default to 0
- **Meals:**
   - Meal time is constrained to: 'morning' or 'evening'
   - Combination of (meal_date, meal_time, food_id) must be unique
   - Foreign key constraint ensures food_id references a valid food record
   - Deletion of foods with associated meals is restricted
- **Authentication:**
   - User emails must be unique
   - Sessions and accounts have cascade deletion when user is deleted
   - Session tokens must be unique

## Common Tasks

### Adding a New Food

1. Use the `quick-add-dialog.tsx` component or the food form
2. Required fields: name, preference
3. Optional fields: notes, inventory_quantity, archived, nutrition fields (phosphorus_dmb, protein_dmb, fat_dmb, fiber_dmb)
4. Preference must be one of: 'likes', 'dislikes', 'unknown'
5. Nutrition fields are percentages on dry matter basis (0-100)

### Updating Food Records

1. Use the `edit-food-dialog.tsx` component
2. All fields can be modified (name, preference, notes, inventory_quantity, archived, nutrition fields)
3. `updated_at` timestamp is automatically updated

### Adding a Meal Log

1. Navigate to the meals page (`/meals`)
2. Use the quick-add dialog or meal form
3. Required fields: meal_date, meal_time, food_id, amount
4. Optional fields: notes
5. Meal time must be either 'morning' or 'evening'
6. Each combination of (date, time, food) must be unique

### Authentication

- Sign up: Navigate to `/sign-up` to create a new account
- Sign in: Navigate to `/sign-in` to log into existing account
- User menu: Access via the user button in the header when authenticated
- Authentication is handled via Better Auth with session management

### Filtering and Sorting

The `food-filters.tsx` component provides:

- **Search**: Filter by text in notes field
- **Preference Filter**: Toggle filters for likes/dislikes/unknown
- **Inventory Filter**: Show all, in-stock only, or out-of-stock only
- **Sort Options**: By name, preference, inventory quantity, or date added
- **Sort Order**: Toggle between ascending and descending
- **Minimize/Expand**: Collapse filter controls to save space

### View Modes

- **Card View**: Visual cards showing food details with icons and nutrition information
- **List View**: Compact list format for viewing many items
- Toggle between views using the view mode controls
- Both views support the same filtering, sorting, and search capabilities

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

- Triggers on:
  - Issue comments and new issues (when `@claude` is mentioned)
  - PR review comments (when `@claude` is mentioned)
  - PR reviews (when `@claude` is mentioned)
- Automatically helps with code reviews, questions, and tasks
- Has permissions to read CI results on PRs
- Requires `CLAUDE_CODE_OAUTH_TOKEN` secret to be configured

### Claude Code Review (`claude-code-review.yml`)

- Triggers on PR opened and synchronize events
- Automatically reviews pull requests for:
  - Code quality and best practices
  - Potential bugs or issues
  - Performance considerations
  - Security concerns
  - Test coverage
- Posts review feedback as PR comments
- Uses this CLAUDE.md file for context on coding conventions
- Requires `CLAUDE_CODE_OAUTH_TOKEN` secret to be configured
