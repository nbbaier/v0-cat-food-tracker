# AGENTS.md

Quick reference for AI coding assistants working with this codebase.

## Commands

- **Dev**: `bun run dev`
- **Build**: `bun run build` (always run after changes to check for errors)
- **Lint/Format**: `bun run check` (check only), `bun run check:fix` (auto-fix)
- **Database**: `bun run db:generate` (create migrations), `bun run db:push` (apply to DB)
- **Tests**: No test suite configured

## Architecture

- **Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4.x, Drizzle ORM, PostgreSQL (Supabase)
- **Structure**: `/app` (pages + API routes), `/components` (UI + feature components), `/lib/db` (schema + client), `/supabase/migrations`
- **Database**: Foods table (tracks preferences, inventory), Meals table (tracks meal logs with food_id FK)
- **API Routes**: `/api/foods` and `/api/meals` for CRUD operations

## Code Style

- **Formatting**: Tabs (indentStyle), double quotes, Biome for linting/formatting
- **Naming**: kebab-case for files (e.g., `add-food-dialog.tsx`), TypeScript conventions for types
- **Components**: Separate UI components (in `components/ui/`) from feature components; use shadcn/Radix UI patterns
- **Styling**: Tailwind classes with `cn()` utility from `@/lib/utils`; use `class-variance-authority` for variants
- **Imports**: Path alias `@/*` maps to root; organize imports with Biome's auto-organize
- **Database**: Always use Drizzle ORM; schema in `lib/db/schema.ts`; enums: `preference` (likes/dislikes/unknown), `meal_time_type` (morning/evening)
