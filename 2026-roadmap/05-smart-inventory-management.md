# Smart Inventory Management

**Category:** New Feature
**Quarter:** Q2
**T-shirt Size:** M

## Why This Matters

Currently, inventory is a single integer field (`inventory_quantity`) that users manually increment or decrement. There's no intelligence around it—no alerts when stock is low, no consumption tracking, no shopping list generation. Users discover they're out of food when they go to log a meal and realize the can is empty.

Smart inventory management transforms passive tracking into proactive planning. The app knows how much food you have, how fast you're using it, and can tell you when to reorder before you run out. This reduces the cognitive load of cat care and prevents the dreaded "we're out of food" emergency.

For multi-cat households (enabled by #01), this becomes even more valuable. Different cats may eat different foods, and tracking consumption across multiple products is complex without automated help.

## Current State

- `inventory_quantity` field exists on foods table (integer, default 0)
- No unit specification (cans? bags? ounces?)
- No consumption tracking (meals don't decrement inventory)
- No low-stock alerts
- No shopping list functionality
- No reorder reminders
- Manual increment/decrement only
- No historical inventory data

## Proposed Future State

**Intelligent Inventory Tracking:**
- Inventory with units (12 cans, 2 bags, 24 pouches, etc.)
- Automatic decrement when meals are logged
- Package size tracking (12-pack, 24-pack, single cans)
- Multiple package types per food (cans and pouches of same brand)

**Predictive Stock Management:**
- Consumption rate calculation per food item
- Predicted stockout date ("You'll run out in ~8 days")
- Consumption trend visualization
- Seasonal variation detection (cats eat more/less in different seasons)

**Proactive Alerts:**
- Low stock warnings (configurable threshold)
- Stockout predictions sent in advance
- Email/push notification options
- Smart digest ("Weekly inventory report")

**Shopping List:**
- Auto-generated shopping list based on low stock items
- "Add to shopping list" from any food card
- Check off items when purchased
- Restock quantities based on historical ordering patterns
- Shareable lists (for household coordination)

**Reorder Integration (foundation for #09):**
- "Where to buy" links
- Price tracking preparation
- Reorder button placeholders for future pet store integration

## Key Deliverables

- [ ] Redesign inventory data model (units, package_sizes, purchase_history)
- [ ] Create inventory unit selector component (cans, pouches, bags, lbs, oz)
- [ ] Implement automatic inventory decrement on meal logging
- [ ] Build consumption rate calculation engine
- [ ] Create stockout prediction algorithm
- [ ] Implement low-stock alert system
- [ ] Build shopping list feature (add, remove, check off, share)
- [ ] Create inventory dashboard widget
- [ ] Add "Purchase" logging (add inventory from a buy)
- [ ] Implement purchase history tracking
- [ ] Create inventory trend visualizations
- [ ] Build notification preferences UI
- [ ] Implement email notification system (low stock alerts)
- [ ] Add estimated days remaining display on food cards
- [ ] Create inventory report export

## Prerequisites

- Multi-Cat Support (#01) - Consumption should be trackable per cat
- Some existing meal logging data for consumption rate calculation

## Risks & Open Questions

- **Unit complexity**: Cat food comes in many forms (cans, pouches, bags of various sizes). How granular do we get? Need to balance precision with usability.
- **Consumption accuracy**: If users don't log every meal, consumption rates will be inaccurate. How to handle data gaps?
- **Automatic decrement UX**: What if user logs meal but didn't open new can? Need undo/adjustment capability.
- **Shared inventory**: For multi-cat households, the same food may be shared across cats. Inventory is household-level, not cat-level.
- **Notification fatigue**: Too many low-stock alerts become noise. Need smart thresholds and digest options.
- **Partial consumption**: A bag of dry food is used over time, not consumed in discrete units. Different tracking model needed.

## Notes

Database schema changes:
```sql
-- Modify foods table or create inventory_items junction
inventory_unit enum ('cans', 'pouches', 'bags', 'lbs', 'oz', 'grams')
package_size numeric -- e.g., "5.5" for 5.5oz cans

-- New tables
purchase_history (id, food_id, quantity, unit_cost, purchased_at, source)
shopping_list_items (id, household_id, food_id, quantity, is_purchased, added_at)
inventory_alerts (id, food_id, alert_type, threshold, is_active)
```

Key files to modify:
- `lib/db/schema.ts` - Inventory enhancements
- `components/foods/food-item.tsx` - Add inventory indicators
- `hooks/use-meals.ts` - Add inventory decrement on meal creation
- New: `components/inventory/*` - Inventory management UI
- New: `app/shopping-list/page.tsx` - Shopping list page
- New: `lib/notifications.ts` - Alert system

This initiative builds foundation for: Pet Store Integration (#09)
