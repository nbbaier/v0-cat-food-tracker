# Multi-Cat Support

**Category:** New Feature
**Quarter:** Q1
**T-shirt Size:** L

## Why This Matters

The current application assumes a single-cat household, which fundamentally limits its usefulness. The majority of multi-cat households (approximately 53% of cat owners have more than one cat) cannot effectively use this tool because food preferences, portion sizes, and health considerations vary dramatically between individual cats. A 15-year-old cat with kidney disease has completely different nutritional needs than a 2-year-old active cat.

By enabling multi-cat support, we unlock the ability to track which specific cat ate what, identify individual preferences and health patterns, and provide personalized recommendations per cat. This is the foundational architectural change that enables nearly every other ambitious feature on the roadmap—you can't build AI predictions, health correlations, or community features without knowing which cat the data belongs to.

## Current State

- Single implicit cat assumed across all data
- `foods` table tracks food preferences globally, not per-cat
- `meals` table records what was fed but not to whom
- No `cats` or `pets` table exists in the schema
- UI shows food preferences and meal logs without any cat context
- Database schema: `lib/db/schema.ts` has no pet/cat entity

## Proposed Future State

Every food preference, meal log, and nutritional decision is associated with a specific cat. The application supports:

- **Cat profiles** with name, photo, birth date, weight, health conditions
- **Per-cat preferences** - Whiskers might love chicken while Luna hates it
- **Cat-specific meal logging** - Log that Luna ate 2oz of Brand X at 8am
- **Cat switcher in UI** - Quick toggle between cats or view aggregated household data
- **Individual health tracking** - Each cat's weight history, vet notes, dietary restrictions
- **Smart defaults** - Pre-fill common foods for each cat based on their history

The mental model shifts from "tracking cat food" to "managing my cats' nutrition."

## Key Deliverables

- [ ] Design and implement `cats` table schema (id, name, photo_url, birth_date, weight, health_notes, household_id, created_at, updated_at)
- [ ] Create `cat_food_preferences` junction table (cat_id, food_id, preference, notes)
- [ ] Modify `meals` table to include `cat_id` foreign key
- [ ] Build cat profile management UI (create, edit, delete, photo upload)
- [ ] Implement cat switcher component in header with avatar display
- [ ] Create per-cat dashboard views
- [ ] Build migration path for existing data (assign to "default" cat, prompt user to confirm)
- [ ] Update all API routes to filter by cat_id
- [ ] Modify meal logging flow to require cat selection
- [ ] Add cat-specific preference views and filters
- [ ] Implement "all cats" aggregate view for household-level insights
- [ ] Update food combobox to show cat-specific preference indicators

## Prerequisites

None - this is foundational work that other initiatives depend on.

## Risks & Open Questions

- **Data migration complexity**: Existing users have data without cat associations. Need graceful migration flow that doesn't disrupt current workflows.
- **UI complexity**: Adding cat selection to every interaction could slow down the meal logging flow. Need to design smart defaults and quick selection patterns.
- **Photo storage**: Where to store cat photos? Supabase Storage or external service?
- **Multi-cat meals**: How to handle feeding multiple cats at once from the same food? Separate meal entries or a single entry with multiple cats?
- **Default cat**: Should there be a "primary" cat concept for users who mostly track one cat but occasionally track others?

## Notes

Key files that need modification:
- `lib/db/schema.ts` - Add cats table and modify relationships
- `app/api/foods/route.ts` - Filter by cat context
- `app/api/meals/route.ts` - Require cat_id, filter appropriately
- `components/home/home-page-client.tsx` - Add cat selection to meal form
- `components/layout/app-header.tsx` - Add cat switcher
- `hooks/use-foods.ts` and `hooks/use-meals.ts` - Accept cat filter parameter

This initiative unblocks: Health Outcome Tracking (#04), AI-Powered Prediction (#08), Community Features (#10)
