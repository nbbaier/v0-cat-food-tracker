# Performance Review - Cat Food Tracker

**Date**: Thu Nov 13 2025
**Severity**: Critical performance issues identified

## Executive Summary

Your app will slow down and/or fall over under modest data/traffic. Biggest offenders: unpooled DB connections, a heavy COUNTs+JOIN foods query with no pagination, client-only pages that fetch entire tables with no caching, and unstable React callbacks causing extra renders.

**Estimated effort to fix**: 1-2 days

---

## 🔴 Critical Issues (Fix Immediately)

### 1. Database Connection Pooling Missing

**Problem**: Creating unbounded database connections. On serverless (Vercel), you'll hit "too many connections" errors under load.

**Current code** ([lib/db/index.ts](file:///Users/nbbaier/Code/v0-cat-food-tracker/lib/db/index.ts)):

```typescript
const client = postgres(process.env.DATABASE_URL as string);
export const db = drizzle({ client });
```

**Fix** (Effort: S - 30min):

For serverless (Vercel/Netlify):

- Use `@neondatabase/serverless` + `drizzle-orm/neon-http`
- OR use pgbouncer pool connection string

For serverful:

```typescript
const client = postgres(process.env.DATABASE_URL!, {
   max: 10, // or 1-2 for serverless lambdas
   idle_timeout: 5,
   connect_timeout: 10,
   prepare: true,
   ssl: "require",
});
export const db = drizzle({ client });
```

**Impact**: Without this, concurrent users will crash your app.

---

### 2. Catastrophic Foods Query

**Problem**: [GET /api/foods](file:///Users/nbbaier/Code/v0-cat-food-tracker/app/api/foods/route.ts) does a `COUNT(DISTINCT)` with `FILTER` on every food, creating massive row multiplication via LEFT JOIN.

**Current approach**:

- LEFT JOIN meals on every food
- COUNT(DISTINCT meals.id) with FILTER
- No pagination = fetches entire table

**Fix** (Effort: M - 1-2hrs):

Replace with pre-aggregated subqueries:

```typescript
const mealCounts = db.$with("meal_counts").as(
   db
      .select({
         foodId: meals.foodId,
         cnt: sql<number>`count(*)`,
      })
      .from(meals)
      .groupBy(meals.foodId)
);

const mealCommentCounts = db.$with("meal_comment_counts").as(
   db
      .select({
         foodId: meals.foodId,
         cnt: sql<number>`count(*)`,
      })
      .from(meals)
      .where(sql`${meals.notes} is not null and ${meals.notes} <> ''`)
      .groupBy(meals.foodId)
);

const rows = await db
   .with(mealCounts, mealCommentCounts)
   .select({
      id: foods.id,
      name: foods.name,
      // ... other fields
      mealCount: sql<number>`coalesce(${mealCounts.cnt}, 0)`,
      mealCommentCount: sql<number>`coalesce(${mealCommentCounts.cnt}, 0)`,
   })
   .from(foods)
   .leftJoin(mealCounts, eq(mealCounts.foodId, foods.id))
   .leftJoin(mealCommentCounts, eq(mealCommentCounts.foodId, foods.id))
   .orderBy(desc(foods.createdAt))
   .limit(50); // ADD PAGINATION
```

Minimal fix (if keeping current pattern):

```typescript
// Change from:
count(distinct ${meals.id}) filter (where ${meals.id} is not null)
// To:
count(${meals.id})

// Change from:
count(distinct ${meals.id}) filter (where ${meals.notes} ...)
// To:
count(*) filter (where ${meals.notes} is not null and ${meals.notes} <> '')
```

---

### 3. Client-Side Everything with No Caching

**Problem**:

- [foods-page-client.tsx](file:///Users/nbbaier/Code/v0-cat-food-tracker/components/foods/foods-page-client.tsx) and [meals-page-client.tsx](file:///Users/nbbaier/Code/v0-cat-food-tracker/components/meals/meals-page-client.tsx) fetch entire datasets
- [use-foods.ts](file:///Users/nbbaier/Code/v0-cat-food-tracker/hooks/use-foods.ts) and [use-meals.ts](file:///Users/nbbaier/Code/v0-cat-food-tracker/hooks/use-meals.ts) have no caching
- Every navigation = full re-fetch
- No React Query, SWR, or server components

**Fix Option A** - Move to Server Components (Effort: M-L - 4hrs):

```typescript
// app/foods/page.tsx
export default async function FoodsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // Fetch on server
  const foods = await db.select(/* ... */).from(foods).limit(50);

  return <FoodsPageClient initialFoods={foods} />;
}
```

**Fix Option B** - Add Client Cache (Effort: S - 1hr, interim solution):

```typescript
// lib/cached-json.ts
const cache = new Map<string, { t: number; data: any }>();

export async function cachedJSON<T>(
   url: string,
   ttl = 10000,
   init?: RequestInit
) {
   const c = cache.get(url);
   if (c && Date.now() - c.t < ttl) return c.data as T;

   const res = await fetch(url, init);
   if (!res.ok) throw new Error("fetch failed");
   const data = await res.json();
   cache.set(url, { t: Date.now(), data });
   return data as T;
}

// Use in fetchFoods/fetchMeals
const data = await cachedJSON("/api/foods", 10000);
```

---

## 🟠 Major Issues

### 4. Unstable React Callbacks

**Problem**: [use-foods.ts](file:///Users/nbbaier/Code/v0-cat-food-tracker/hooks/use-foods.ts#L91-L131) `updateFood` and `deleteFood` depend on `foods` array, recreating on every change and causing cascading re-renders.

**Fix** (Effort: S - 30min):

```typescript
const foodsRef = useRef<Food[]>([]);
useEffect(() => {
   foodsRef.current = foods;
}, [foods]);

const updateFood = useCallback(async (id: string, updates: Partial<Food>) => {
   setFoods((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
   );

   try {
      const response = await fetch(`/api/foods/${id}`, {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(updates),
      });

      if (!response.ok) {
         // Rollback on error
         setFoods(foodsRef.current);
      }
   } catch (err) {
      setFoods(foodsRef.current);
   }
}, []); // No dependencies
```

---

### 5. Duplicate Sorting in Meals Page

**Problem**: [meals-page-client.tsx](file:///Users/nbbaier/Code/v0-cat-food-tracker/components/meals/meals-page-client.tsx#L71-L139) sorts `filteredAndSortedMeals`, then re-sorts each date bucket.

**Fix** (Effort: S - 15min):

```typescript
// Memoize sortedDates
const sortedDates = useMemo(
   () =>
      Object.keys(mealsByDate).sort((a, b) => {
         if (sortBy === "date") {
            return sortOrder === "desc"
               ? b.localeCompare(a)
               : a.localeCompare(b);
         }
         return b.localeCompare(a);
      }),
   [mealsByDate, sortBy, sortOrder]
);

// Remove duplicate sort at line 185-195, just use:
const sortedMeals = dateMeals; // Already sorted from filteredAndSortedMeals
```

---

### 6. No Pagination

**Problem**: Both APIs fetch entire tables. As data grows, performance degrades linearly.

**Fix** (Effort: M - 2hrs):

Add to API routes:

```typescript
export async function GET(request: NextRequest) {
   const { searchParams } = new URL(request.url);
   const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
   const offset = parseInt(searchParams.get("offset") || "0");

   const foods = await db
      .select(/* ... */)
      .from(foods)
      .limit(limit)
      .offset(offset);

   return NextResponse.json({ foods, hasMore: foods.length === limit });
}
```

Update hooks to fetch paginated data and handle infinite scroll or "Load More" button.

---

### 7. Over-Fetching Data

**Problem**:

- Foods API always returns meal counts (expensive joins) even when not needed
- No server-side filtering/sorting
- Ship entire dataset, filter client-side

**Fix** (Effort: M - 2hrs):

Add query params:

```typescript
// GET /api/foods?includeCounts=true&preference=likes&inStock=true&sort=name&order=asc

export async function GET(request: NextRequest) {
   const { searchParams } = new URL(request.url);
   const includeCounts = searchParams.get("includeCounts") === "true";
   const preference = searchParams.get("preference");
   const inStock = searchParams.get("inStock") === "true";

   let query = db.select(/* ... */).from(foods);

   if (preference) {
      query = query.where(eq(foods.preference, preference));
   }

   if (inStock) {
      query = query.where(gt(foods.inventoryQuantity, 0));
   }

   // Only join meals if includeCounts requested
   if (includeCounts) {
      // ... add joins
   }
}
```

---

### 8. No Caching Strategy

**Fix** (Effort: S - 15min):

Add cache headers to API responses:

```typescript
return NextResponse.json(data, {
   headers: {
      "Cache-Control": "private, max-age=30, stale-while-revalidate=300",
   },
});
```

---

## 🟡 Minor Issues

### 9. Missing Database Indexes

**Fix** (Effort: S - 15min):

Create migration:

```sql
-- Foods table
CREATE INDEX CONCURRENTLY idx_foods_created_at ON foods(created_at);
CREATE INDEX CONCURRENTLY idx_foods_preference ON foods(preference);
CREATE INDEX CONCURRENTLY idx_foods_inventory ON foods(inventory_quantity);

-- Meals table (optional optimization)
CREATE INDEX CONCURRENTLY idx_meals_food_with_notes
  ON meals(food_id)
  WHERE notes IS NOT NULL AND notes <> '';
```

---

### 10. Bundle Bloat

**Problems**:

- All Radix deps set to `"latest"` (unpredictable sizes)
- Both `pg` and `postgres` installed (only using `postgres`)
- `QuickAddDialog` always mounted even when unused

**Fix** (Effort: S - 30min):

[package.json](file:///Users/nbbaier/Code/v0-cat-food-tracker/package.json):

```json
{
   "dependencies": {
      "@radix-ui/react-dialog": "^1.1.8", // Pin versions
      "@radix-ui/react-dropdown-menu": "^2.1.8"
      // Remove "pg": "^8.16.3",  // Not used
   }
}
```

Lazy load dialog:

```typescript
// meals-page-client.tsx
const QuickAddDialog = dynamic(
   () => import("@/components/layout/quick-add-dialog"),
   { ssr: false }
);
```

---

### 11. Inconsistent DTO Mapping

**Problem**: [foods/route.ts](file:///Users/nbbaier/Code/v0-cat-food-tracker/app/api/foods/route.ts#L121-L126) treats 0 as undefined.

**Fix**:

```typescript
// Change from:
phosphorusDmb: newFood.phosphorusDmb ? Number(newFood.phosphorusDmb) : undefined,

// To:
phosphorusDmb: Number(newFood.phosphorusDmb),
```

---

## Priority Checklist

Fix in this order:

- [ ] **1. Add connection pooling** (30min) - Prevents crashes
- [ ] **2. Add missing indexes** (15min) - Quick win
- [ ] **3. Add pagination to APIs** (2hrs) - Prevents slowdown as data grows
- [ ] **4. Optimize foods query** (1hr) - Remove DISTINCT, use subqueries
- [ ] **5. Add client cache OR move to server components** (1-4hrs)
- [ ] **6. Stabilize callbacks** (30min) - Reduce re-renders
- [ ] **7. Remove duplicate sorts** (15min)
- [ ] **8. Clean up dependencies** (30min)
- [ ] **9. Add API caching headers** (15min)
- [ ] **10. Lazy-load dialogs** (15min)

---

## Advanced Optimizations (Future)

When foods/meals > 50k rows or p95 > 200ms:

- **Denormalized counters**: Add `foods.meal_count`, maintain via triggers
- **Materialized views**: Pre-compute expensive aggregations
- **User scoping**: Add `userId` to tables with RLS policies
- **Real-time updates**: Switch to server actions + streaming

---

## Performance Budgets (Recommended)

Measure and maintain:

- API p95 < 150ms
- First Contentful Paint < 2s on mid-tier device
- Bundle per route < 150KB gzipped
- Max database connections < 10 (serverless) or < 50 (serverful)

---

## Conclusion

This codebase prioritizes feature velocity over performance. That's fine for a prototype, but it won't scale past ~1000 foods or handle concurrent users.

**Fix connection pooling and pagination immediately** to prevent crashes and slowdowns. The other issues can be addressed iteratively.
