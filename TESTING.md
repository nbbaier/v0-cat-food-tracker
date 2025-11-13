# Testing Recommendations

## API Routes (Priority: High)

### Foods API (`/api/foods`)

#### GET `/api/foods`
- Pagination edge cases (limit validation, cursor behavior, hasMore flag)
- Archived filtering (true/false/null)
- Meal count aggregation accuracy
- Unauthorized access (no session)
- Invalid cursor values
- Limit boundaries (min 1, max 500, default 100)

#### POST `/api/foods`
- Zod validation (required fields, boundaries, strict mode)
- Duplicate food names
- Nutrition field boundaries (0-100, decimal precision)
- Default values (inventoryQuantity, archived)
- Unauthorized access
- Invalid field types
- Extra fields rejection (strict mode)

### Meals API (`/api/meals`)

#### GET `/api/meals`
- Cursor pagination
- Ordering (mealDate DESC, mealTime ASC)
- Food join behavior (when food deleted/archived)
- Unauthorized access
- Invalid cursor values

#### POST `/api/meals`
- Date validation (ISO format, range)
- Amount string format validation
- Unique constraint violation (same date/time/food)
- Invalid foodId (FK constraint)
- Unauthorized access
- Notes field optional behavior

## Validation Schemas (`lib/validations.ts`) (Priority: High)

### foodInputSchema
- Boundary tests:
  - Name length (1-200 characters)
  - Nutrition percentages (0-100)
  - Inventory quantity (0-999)
- Decimal precision (2 places for nutrition)
- Strict mode rejection of unknown fields
- Required vs optional fields
- Preference enum validation

### mealInputSchema
- Date format/range (2020-01-01 to tomorrow)
- Amount regex patterns:
  - Valid: "100g", "2 cans", "1.5 cups", "3 pouches"
  - Invalid: "100", "abc", "100 xyz"
- UUID validation for foodId
- Meal time enum ("morning", "evening")
- Strict mode rejection

### Update Schemas
- At least one field requirement
- Partial validation (only validate provided fields)
- Strict mode on partial updates

## React Hooks (Priority: Medium)

### use-foods / use-meals
- Cursor pagination logic
- Cache invalidation on mutations
- Error handling and error states
- Loading states
- Initial data fetching
- Refetch behavior

### use-food-mutations / use-meal-mutations
- Optimistic updates
- Rollback on error
- Mutation success callbacks
- Mutation error callbacks
- Cache updates after mutation
- Error toast notifications

## Components (Priority: Medium-Low)

### FoodForm (`components/foods/food-form.tsx`)
- Manual validation logic (phosphorus/protein/fat/fiber 0-100 range checks)
- Form reset behavior (edit vs create mode)
- Controlled input state synchronization with initialValues
- useEffect synchronization on initialValues change
- Submit button disabled state
- Toast error messages for validation

### Forms & Dialogs
- User interactions (submit, cancel, validation feedback)
- Dialog open/close state management
- Toast notifications on success/error
- Form state reset on close
- Keyboard interactions (Enter to submit, Escape to cancel)

### Food/Meal Cards & Lists
- Rendering with empty data
- Rendering with pagination
- Filter interactions
- Click handlers (edit, delete)
- Conditional rendering based on archived status

## Integration Tests (Priority: Medium)

### Full CRUD Flows
- Create food → Log meal → Update food → Delete (FK constraint prevents deletion)
- Create meal → Update meal → Delete meal
- Archive food → Verify excluded from default lists

### Constraint Tests
- Unique constraint: Multiple meals same date/time/food
- FK constraint: Delete food with meals (should fail)
- FK constraint: Create meal with invalid foodId (should fail)

### Authentication Flows
- Cascade behavior: User deletion → session cleanup
- Unauthorized API access without session
- Session expiration handling

### Pagination Flows
- Navigate through multiple pages
- Verify no duplicates across pages
- Verify no gaps in data
- hasMore flag accuracy
- Empty results behavior

## Edge Cases to Focus On

### Data Layer
- Archived foods in meal relationships
- Concurrent updates to same resource
- Database constraint violations (FK, unique)
- NULL vs empty string handling in optional fields
- Timezone handling in timestamps

### API Layer
- Invalid cursor values in pagination
- Missing/malformed authentication headers
- Boundary values (max string lengths, numeric limits)
- Invalid JSON in request body
- Content-Type header validation

### UI Layer
- Empty states (no foods, no meals)
- Loading states during mutations
- Error states with user-friendly messages
- Form validation before submission
- Stale data after mutations

### Business Logic
- Nutrition percentages summing > 100% (allowed but unusual)
- Meal dates in far future
- Very long food names/notes
- Special characters in text fields
- Negative inventory quantities (prevented by validation)

## Test File Organization

```
tests/
├── api/
│   ├── foods.test.ts          # GET, POST /api/foods
│   ├── foods-id.test.ts       # PATCH, DELETE /api/foods/[id]
│   ├── meals.test.ts          # GET, POST /api/meals
│   └── meals-id.test.ts       # PATCH, DELETE /api/meals/[id]
├── lib/
│   ├── validations.test.ts    # Zod schemas
│   └── utils.test.ts          # Already exists
├── hooks/
│   ├── use-foods.test.ts
│   ├── use-meals.test.ts
│   ├── use-food-mutations.test.ts
│   └── use-meal-mutations.test.ts
├── components/
│   ├── food-form.test.tsx
│   ├── meal-form.test.tsx
│   └── ...
└── integration/
    ├── food-crud.test.ts
    ├── meal-crud.test.ts
    └── pagination.test.ts
```

## Testing Strategy

1. **Start with validation schemas** - These are pure functions and easiest to test comprehensively
2. **Test API routes next** - Critical business logic, use MSW for database mocking
3. **Test hooks** - Use MSW server from vitest.setup.tsx for API mocking
4. **Test components** - Focus on user interactions and form validation
5. **Integration tests last** - Full flows across multiple layers

## Recommended Tools (Already Configured)

- **Vitest** - Test runner with jsdom environment
- **Testing Library** - Component testing with user-centric queries
- **MSW** - API mocking (server setup in vitest.setup.tsx)
- **Coverage** - v8 provider configured for coverage reports
