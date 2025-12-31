# Analytics & Insights Dashboard

**Category:** New Feature
**Quarter:** Q2
**T-shirt Size:** L

## Why This Matters

The application currently collects valuable data—food preferences, meal logs, inventory, nutritional information—but provides no way to derive insights from it. Users can see their data, but they can't understand it. This is like having a fitness tracker that only shows raw step counts without trends, patterns, or recommendations.

An analytics dashboard transforms passive data collection into active decision support. Cat owners can answer questions like: "Is my cat eating less this month?", "What's the most successful food type?", "Are we running through inventory faster than usual?", "How has preference changed over time?" This turns the app from a simple logger into an intelligent nutrition companion.

From a product perspective, analytics create stickiness. Users who see insights are more engaged than users who just log data. The dashboard becomes the primary destination rather than the entry form.

## Current State

- Raw data available via list views (foods, meals)
- No aggregations, trends, or pattern detection
- No visualization components
- Meal history shows individual entries chronologically
- Food list shows current preferences without historical context
- No concept of time-based analysis
- Database has timestamps but they're only used for sorting/pagination

## Proposed Future State

A rich analytics dashboard providing:

**At-a-Glance Overview:**
- Meals logged this week/month (with comparison to previous period)
- Preference distribution pie chart (likes/neutral/dislikes/unknown)
- Inventory status summary (well-stocked, low, out-of-stock counts)
- Recent activity feed

**Feeding Patterns:**
- Meal frequency heatmap (day of week × time of day)
- Average portion sizes over time
- Morning vs. evening meal consistency
- Missed meal detection and alerts

**Preference Analytics:**
- Preference changes over time (line chart)
- Success rate by food category/brand
- "New foods tried this month" tracking
- Time-to-verdict: how long until unknown → definite preference

**Nutritional Insights:**
- Average daily/weekly nutrition (phosphorus, protein, fat, fiber)
- Nutrition goals and progress (especially for cats with dietary restrictions)
- Correlation between nutrition and preference (does high-protein = more likes?)

**Inventory Intelligence:**
- Consumption rate per food item
- Predicted stockout dates
- Reorder suggestions
- Cost tracking (if price data available)

## Key Deliverables

- [ ] Design analytics database schema (pre-aggregated tables or views for performance)
- [ ] Implement analytics API endpoints (`/api/analytics/*`)
- [ ] Build chart component library (consider Recharts or Victory)
- [ ] Create main dashboard page (`/dashboard` or expand home page)
- [ ] Implement preference distribution visualization
- [ ] Build meal frequency heatmap component
- [ ] Create nutritional summary cards with trend indicators
- [ ] Implement inventory status dashboard
- [ ] Add date range picker for time-based filtering
- [ ] Build preference history timeline
- [ ] Create "insights" engine that surfaces notable patterns
- [ ] Add export functionality (PDF report, CSV data)
- [ ] Implement responsive design for mobile viewing
- [ ] Add dashboard to navigation header

## Prerequisites

- Multi-Cat Support (#01) - Analytics should be per-cat with household aggregate option
- Sufficient historical data - More valuable with several months of data

## Risks & Open Questions

- **Performance**: Aggregating large datasets on every request is expensive. Need strategy for pre-computation or caching.
- **Charting library**: Recharts vs. Victory vs. Tremor vs. Nivo? Need to evaluate bundle size, customizability, and accessibility.
- **Mobile UX**: Complex charts on mobile are challenging. May need simplified mobile views.
- **Data sparsity**: How to handle users with limited data? Avoid empty states that feel discouraging.
- **Privacy**: If we add household features, who can see whose analytics?
- **Actionability**: Insights are only valuable if they lead to action. What are the CTAs from insights?

## Notes

Key database considerations:
- Consider materialized views for common aggregations
- Time-series aggregation patterns (daily/weekly/monthly rollups)
- Index optimization for date-range queries

Files to modify/create:
- New: `app/dashboard/page.tsx` and related components
- New: `components/analytics/*` - Chart components
- New: `app/api/analytics/*` - Aggregation endpoints
- Modify: `lib/db/schema.ts` - Analytics tables/views if needed
- Modify: `components/layout/app-header.tsx` - Add dashboard navigation

Suggested chart library evaluation criteria:
1. TypeScript support
2. Accessibility (screen reader support)
3. Bundle size
4. Customization with Tailwind
5. Animation support
6. Responsive behavior

This initiative enables: AI-Powered Prediction (#08) builds on analytics data
