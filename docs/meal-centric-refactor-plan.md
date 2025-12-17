# Meal-Centric Data Model Refactor Plan

## Overview

This document outlines the plan to refactor the cat food tracker from a food-centric model (where preference is stored on foods) to a meal-centric model (where reactions are recorded per meal and food preferences are derived from aggregated reactions).

## Current vs. New Data Model

### Current Model
- `foods` table stores a static `preference` field
- `meals` table records what food was served when
- Preference is manually set and updated

### New Model
- `foods` table has no preference field (preference is computed)
- `meals` table records feeding events (amount becomes optional)
- `reactions` table records the cat's response to each meal
- Food preference is derived by aggregating reaction scores over time

## Reaction Scale

| Reaction   | Score | Description                    |
|------------|-------|--------------------------------|
| `loved`    | +2    | Super liked it, wanted more    |
| `liked`    | +1    | Good response, ate happily     |
| `neutral`  | 0     | Ate it, nothing special        |
| `disliked` | -1    | Meh, reluctant, slow to eat    |
| `rejected` | -2    | Didn't touch it at all         |

## Preference Aggregation

Food preferences are computed from average reaction scores:

| Score Range      | Display Label |
|------------------|---------------|
| > 1.5            | Loves         |
| 0.5 to 1.5       | Likes         |
| -0.5 to 0.5      | Neutral       |
| -1.5 to -0.5     | Dislikes      |
| < -1.5           | Hates         |

---

## Implementation Phases

### Phase 1: Schema Changes

#### 1.1 Update `lib/db/schema.ts`

**Remove from `foods` table:**
- `preference` field
- `preferenceEnum` (or repurpose for display labels)

**Modify `meals` table:**
- Make `amount` optional (nullable with no default, or default to a standard value like "1 serving")

**Add new enum:**
```typescript
export const reactionEnum = pgEnum("reaction", [
  "loved",
  "liked",
  "neutral",
  "disliked",
  "rejected",
]);
```

**Add new `reactions` table:**
```typescript
export const reactions = pgTable(
  "reactions",
  (t) => ({
    id: t.uuid().defaultRandom().primaryKey().notNull(),
    mealId: t
      .uuid("meal_id")
      .references(() => meals.id, { onDelete: "cascade" })
      .notNull(),
    reaction: reactionEnum().notNull(),
    createdAt: t
      .timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }),
  (t) => [
    index("idx_reactions_meal_id").on(t.mealId),
    uniqueIndex("reactions_meal_unique").on(t.mealId), // One reaction per meal
    // RLS policies...
  ],
);
```

**Add relations:**
```typescript
export const reactionsRelations = relations(reactions, ({ one }) => ({
  meal: one(meals, {
    fields: [reactions.mealId],
    references: [meals.id],
  }),
}));

// Update mealsRelations to include reaction
export const mealsRelations = relations(meals, ({ one }) => ({
  food: one(foods, {
    fields: [meals.foodId],
    references: [foods.id],
  }),
  reaction: one(reactions),
}));
```

#### 1.2 Generate Migration

```bash
bunx drizzle-kit generate
```

This will create a migration that:
1. Creates the `reaction` enum
2. Creates the `reactions` table
3. Drops the `preference` column from `foods`
4. Alters `amount` to be nullable in `meals`

#### 1.3 Data Migration Strategy

Before dropping `preference`, migrate existing data:

```sql
-- For each food with a preference, create a synthetic "baseline" meal and reaction
-- This preserves historical preference data

-- Option A: Keep a `legacy_preference` column for reference
-- Option B: Create synthetic historical records
-- Option C: Accept data loss (preferences will rebuild from new reactions)
```

**Recommended:** Option A - add a `legacy_preference` text column to preserve the old data, then drop the enum column.

---

### Phase 2: Validation Schema Updates

#### 2.1 Update `lib/validations.ts`

**Modify `foodInputSchema`:**
- Remove `preference` field requirement

**Modify `foodUpdateSchema`:**
- Remove `preference` field

**Modify `mealInputSchema`:**
- Make `amount` optional or provide default

**Add new schemas:**
```typescript
export const reactionInputSchema = z.object({
  mealId: z.string().uuid("Invalid meal ID format"),
  reaction: z.enum(["loved", "liked", "neutral", "disliked", "rejected"], {
    message: "Reaction must be 'loved', 'liked', 'neutral', 'disliked', or 'rejected'",
  }),
}).strict();

export const reactionUpdateSchema = z.object({
  reaction: z.enum(["loved", "liked", "neutral", "disliked", "rejected"], {
    message: "Reaction must be 'loved', 'liked', 'neutral', 'disliked', or 'rejected'",
  }),
}).strict();
```

---

### Phase 3: API Route Changes

#### 3.1 Update `/api/foods/route.ts`

- Remove preference from insert/update operations
- Add computed preference to GET responses via aggregation query

**New helper function:**
```typescript
async function computeFoodPreference(foodId: string): Promise<{
  score: number | null;
  label: string;
  reactionCount: number;
}> {
  const result = await db
    .select({
      avgScore: sql<number>`AVG(CASE 
        WHEN ${reactions.reaction} = 'loved' THEN 2
        WHEN ${reactions.reaction} = 'liked' THEN 1
        WHEN ${reactions.reaction} = 'neutral' THEN 0
        WHEN ${reactions.reaction} = 'disliked' THEN -1
        WHEN ${reactions.reaction} = 'rejected' THEN -2
      END)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(reactions)
    .innerJoin(meals, eq(reactions.mealId, meals.id))
    .where(eq(meals.foodId, foodId));

  const score = result[0]?.avgScore ?? null;
  const count = result[0]?.count ?? 0;

  let label = "unknown";
  if (score !== null) {
    if (score > 1.5) label = "loves";
    else if (score > 0.5) label = "likes";
    else if (score > -0.5) label = "neutral";
    else if (score > -1.5) label = "dislikes";
    else label = "hates";
  }

  return { score, label, reactionCount: count };
}
```

#### 3.2 Update `/api/meals/route.ts`

- Make `amount` optional in POST
- Include reaction data in GET responses
- Support creating meal + reaction in single request (optional enhancement)

#### 3.3 Create `/api/reactions/route.ts`

**GET:** List reactions (with filters)
**POST:** Create a reaction for a meal

#### 3.4 Create `/api/reactions/[id]/route.ts`

**GET:** Get single reaction
**PUT:** Update reaction
**DELETE:** Delete reaction

---

### Phase 4: Component Updates

#### 4.1 Food Components (`components/foods/`)

| File | Changes |
|------|---------|
| `food-form.tsx` | Remove preference field from form |
| `food-item.tsx` | Display computed preference instead of stored value |
| `food-filters.tsx` | Update filters to work with computed preferences |
| `edit-food-dialog.tsx` | Remove preference editing |
| `food-list.tsx` | Fetch and display computed preferences |
| `foods-page-client.tsx` | Update data fetching to include computed preferences |

**New component needed:**
- `preference-badge.tsx` - Display computed preference with score and reaction count

#### 4.2 Meal Components (`components/meals/`)

| File | Changes |
|------|---------|
| `meal-card.tsx` | Add reaction display and editing UI |
| `meals-page-client.tsx` | Fetch reactions with meals |
| `meal-filters.tsx` | Add reaction-based filtering |

**New components needed:**
- `reaction-picker.tsx` - UI for selecting/changing reaction (emoji buttons or similar)
- `reaction-badge.tsx` - Display reaction with appropriate styling

#### 4.3 Home Components (`components/home/`)

| File | Changes |
|------|---------|
| `home-page-client.tsx` | Update meal creation to include optional reaction |
| `food-combobox.tsx` | Display computed preferences in dropdown |

#### 4.4 Shared Components (`components/shared/`)

**Remove or update:**
- `preference-icon.tsx` - Repurpose for computed preferences or create reaction icons

**New components:**
- `reaction-icon.tsx` - Icons for each reaction type

---

### Phase 5: UI/UX Enhancements

#### 5.1 Meal Creation Flow

Update the home page meal creation to:
1. Select food
2. Optionally enter amount (default: "1 serving")
3. Submit meal
4. Prompt for reaction (can be added immediately or later)

#### 5.2 Meal History View

Show meals with:
- Date and time
- Food name
- Amount (if provided)
- Reaction (with ability to add/edit)

#### 5.3 Food Detail View

Show for each food:
- Computed preference (loves/likes/neutral/dislikes/hates)
- Average score
- Reaction breakdown (e.g., "5 loved, 3 liked, 1 neutral")
- Trend over time (optional: chart showing preference changes)

---

## File Change Summary

### Files to Modify

| File | Type of Change |
|------|----------------|
| `lib/db/schema.ts` | Major - schema restructure |
| `lib/validations.ts` | Major - add reaction schemas, update food/meal schemas |
| `app/api/foods/route.ts` | Major - remove preference, add computed preference |
| `app/api/foods/[id]/route.ts` | Moderate - same as above |
| `app/api/meals/route.ts` | Moderate - include reactions, make amount optional |
| `app/api/meals/[id]/route.ts` | Moderate - same as above |
| `components/foods/food-form.tsx` | Moderate - remove preference field |
| `components/foods/food-item.tsx` | Moderate - show computed preference |
| `components/foods/food-filters.tsx` | Moderate - update filter logic |
| `components/foods/edit-food-dialog.tsx` | Moderate - remove preference |
| `components/foods/food-list.tsx` | Minor - update types |
| `components/foods/foods-page-client.tsx` | Moderate - update data fetching |
| `components/meals/meal-card.tsx` | Major - add reaction UI |
| `components/meals/meals-page-client.tsx` | Moderate - fetch reactions |
| `components/home/home-page-client.tsx` | Moderate - update meal flow |
| `components/home/food-combobox.tsx` | Minor - show computed preference |
| `components/shared/preference-icon.tsx` | Moderate - repurpose or replace |

### Files to Create

| File | Purpose |
|------|---------|
| `app/api/reactions/route.ts` | Reactions CRUD (list, create) |
| `app/api/reactions/[id]/route.ts` | Reactions CRUD (get, update, delete) |
| `components/shared/reaction-picker.tsx` | UI for selecting reactions |
| `components/shared/reaction-icon.tsx` | Icons for reaction types |
| `components/shared/preference-badge.tsx` | Computed preference display |
| `lib/preference-utils.ts` | Preference computation helpers |
| `supabase/migrations/XXXX_add_reactions.sql` | Database migration |

### Files to Potentially Remove

| File | Reason |
|------|--------|
| (none - all files are repurposed) | |

---

## Migration Checklist

### Pre-Migration
- [ ] Backup production database
- [ ] Document current preference values for all foods
- [ ] Test migration on staging environment

### Database Migration
- [ ] Create `reaction` enum
- [ ] Create `reactions` table with indexes and RLS policies
- [ ] Add `legacy_preference` column to `foods` (copy existing preferences)
- [ ] Drop `preference` column from `foods`
- [ ] Drop `preference` enum (if no longer needed)
- [ ] Make `amount` nullable in `meals` table

### Code Updates
- [ ] Update schema.ts
- [ ] Update validations.ts
- [ ] Update food API routes
- [ ] Update meal API routes
- [ ] Create reaction API routes
- [ ] Update food components
- [ ] Update meal components
- [ ] Update home components
- [ ] Create new shared components
- [ ] Update AGENTS.md with new schema documentation

### Testing
- [ ] Test food CRUD without preference
- [ ] Test meal CRUD with optional amount
- [ ] Test reaction CRUD
- [ ] Test computed preference aggregation
- [ ] Test UI for adding/editing reactions
- [ ] Test preference display on foods

### Post-Migration
- [ ] Verify all existing data is intact
- [ ] Monitor for errors
- [ ] Update documentation

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 1: Schema Changes | 2-3 hours |
| Phase 2: Validation Updates | 1 hour |
| Phase 3: API Routes | 3-4 hours |
| Phase 4: Component Updates | 4-6 hours |
| Phase 5: UI/UX Polish | 2-3 hours |
| Testing & Bug Fixes | 2-3 hours |
| **Total** | **14-20 hours** |

---

## Open Questions

1. **Reaction timing:** Should reactions be required immediately after logging a meal, or optional to add later?
2. **Multiple reactions:** Should we allow changing reactions, or keep a history of reaction changes?
3. **Amount defaults:** What should the default amount be? ("1 serving", empty, etc.)
4. **Legacy data:** How to handle existing preference data during migration?
5. **Preference recency:** Should recent reactions be weighted more heavily than older ones?
