# Project Scout Report: Ygritte's Picky Picks

**Last Updated:** November 19, 2025

## High-Level Overview
A Next.js 16 application for tracking cat food preferences, inventory, and meal logs. The app helps manage what your cat likes/dislikes, tracks food inventory, and logs daily meals with detailed nutrition information.

## Core Architecture

### Data Flow
1. **Frontend**: React components use custom hooks (`useFoods`, `useMeals`) to fetch data
2. **API Layer**: Next.js API routes handle CRUD operations with authentication
3. **Database**: PostgreSQL via Supabase with Drizzle ORM
4. **Authentication**: Better Auth for user management

### Key Pages & Routing
- **`/`**: Landing page (redirects to `/meals` if authenticated)
- **`/meals`**: Main dashboard - meal logging and history
- **`/foods`**: Food management - add/edit foods, track preferences/inventory
- **`/sign-in` & `/sign-up`**: Authentication pages

### Database Schema
**Foods Table**: Complete food catalog with preferences, inventory, and nutrition
- Core: `name`, `notes`, `preference` (likes/neutral/dislikes/unknown)
- Status: `inventory_quantity`, `archived` 
- Nutrition: `phosphorus_dmb`, `protein_dmb`, `fat_dmb`, `fiber_dmb` (dry matter basis %)
- Relations: One-to-many with meals

**Meals Table**: Daily feeding log
- `meal_date`, `meal_time` (morning/evening)
- `food_id` (FK to foods), `amount`, `notes`
- Unique constraint: one food per meal time per day

## Component Organization

### Feature Components
- **`foods/`**: Food management (forms, lists, filters, dialogs)
- **`meals/`**: Meal logging (cards, filters, page client)
- **`auth/`**: Authentication (sign-in/up forms, user dropdown)
- **`layout/`**: App header, quick-add functionality

### UI Components (`ui/`)
Reusable primitives built on Radix UI: buttons, dialogs, forms, inputs, etc. Follows shadcn/ui patterns with Tailwind styling.

### Custom Hooks (`hooks/`)
- **`useFoods`**: Manages food data with cursor-based pagination
- **`useMeals`**: Handles meal operations
- **`useFoodMutations`**: Food CRUD operations
- **`useMealMutations`**: Meal CRUD operations

## API Structure

### Foods API (`/api/foods`)
- **GET**: Cursor-based pagination, filters by archived status
- **POST**: Create new food with validation
- **PATCH**: Update existing food
- **DELETE**: Remove food (cascade handles meals)

### Meals API (`/api/meals`)
- Similar CRUD pattern with meal-specific validation
- Enforces unique constraint on date/time/food combinations

## Development Workflow

### Essential Commands
```bash
bun run dev          # Start development server
bun run build        # Build for production (always run after changes)
bun run check        # Lint/format check only
bun run check:fix    # Auto-fix lint/format issues
bun run db:push      # Apply schema changes to database
```

### Code Quality
- **Biome**: Handles both linting and formatting
- **TypeScript**: Strict typing throughout
- **Zod**: Runtime validation for API inputs

## First Tasks When Resuming

1. **Check Authentication**: Verify auth is working (`/sign-in`)
2. **Test Core Flows**: 
   - Add a new food via `/foods`
   - Log a meal via `/meals`
   - Check data persistence
3. **Run Quality Checks**: `bun run check` to catch any issues
4. **Review Recent Changes**: Check git log for latest modifications
5. **Database Status**: Ensure migrations are up to date

## Key Implementation Details

### State Management
- Client-side state via React hooks
- No global state management (Redux/Zustand)
- Optimistic updates in mutation hooks
- Manual cache invalidation for related data

### Performance Considerations
- Cursor-based pagination for large food lists
- Meal counts included in food queries to avoid N+1
- Proper database indexes on frequently queried fields

### Error Handling
- Consistent error patterns across API routes
- User-friendly toast notifications
- Detailed logging in development mode
- Graceful fallbacks for network issues