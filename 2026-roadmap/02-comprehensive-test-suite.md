# Comprehensive Test Suite

**Category:** Testing
**Quarter:** Q1
**T-shirt Size:** L

## Why This Matters

The codebase currently has zero tests. This is explicitly acknowledged in `AGENTS.md`: "Tests: No test suite configured." For a production application handling user data, authentication, and database operations, this represents significant risk.

As we embark on ambitious initiatives throughout 2026—multi-cat support, AI features, integrations—we need confidence that changes don't break existing functionality. Without tests, every deploy is a gamble. With a comprehensive test suite, we can move faster with confidence, catch regressions before users do, and enable safe refactoring of core systems.

Beyond risk mitigation, tests serve as living documentation. New contributors (or AI agents) can understand expected behavior by reading tests. Edge cases become explicit. The investment in testing pays dividends across every other initiative.

## Current State

- No test files exist in the repository
- No testing framework configured in `package.json`
- No CI/CD test pipeline
- Manual testing only
- Critical paths untested:
  - Authentication flows (Better Auth integration)
  - Food CRUD operations
  - Meal logging with constraints
  - Cursor-based pagination logic
  - Form validation (Zod schemas)
  - Preference cycling behavior
  - Unique constraint handling (duplicate meals)

## Proposed Future State

A multi-layer testing strategy covering:

1. **Unit Tests** (70% of tests) - Fast, isolated tests for:
   - Utility functions (`lib/utils.ts`: `cn`, `parseValidationErrors`, `safeLogError`)
   - Validation schemas (`lib/validations.ts`)
   - Hook logic (data transformation, state management)
   - Component rendering (isolated, with mocked dependencies)

2. **Integration Tests** (20% of tests) - Tests for:
   - API route handlers with test database
   - Database operations (CRUD, constraints, RLS)
   - Authentication flows
   - Form submission flows

3. **End-to-End Tests** (10% of tests) - Critical user journeys:
   - Sign up → Log in → Add food → Log meal → View history
   - Preference cycling flow
   - Inventory management
   - Error handling and edge cases

**CI/CD Integration:**
- Tests run on every PR
- Coverage reports generated
- Minimum coverage thresholds enforced (80% for new code)
- E2E tests run before production deploys

## Key Deliverables

- [ ] Configure Vitest as the testing framework (fast, Vite-native, excellent TypeScript support)
- [ ] Set up React Testing Library for component tests
- [ ] Configure Playwright for E2E tests
- [ ] Create test database setup/teardown utilities
- [ ] Add test scripts to `package.json` (`test`, `test:watch`, `test:coverage`, `test:e2e`)
- [ ] Write unit tests for all utility functions in `lib/utils.ts`
- [ ] Write unit tests for all Zod schemas in `lib/validations.ts`
- [ ] Write tests for `useFoods` hook (add, update, delete, pagination)
- [ ] Write tests for `useMeals` hook (add, update, delete, constraints)
- [ ] Write API integration tests for `/api/foods` routes
- [ ] Write API integration tests for `/api/meals` routes
- [ ] Write authentication flow tests
- [ ] Write E2E tests for core user journeys
- [ ] Configure GitHub Actions workflow for test runs
- [ ] Add coverage reporting and badges to README
- [ ] Document testing conventions in AGENTS.md

## Prerequisites

None - this is foundational work that should happen in parallel with feature development.

## Risks & Open Questions

- **Database isolation**: How to handle test database? Options: In-memory SQLite (fast but different from Postgres), separate Supabase project (accurate but slower), local Docker Postgres (accurate, medium speed)
- **Auth mocking**: Better Auth testing patterns need research. May need to mock session for most tests.
- **E2E test stability**: Browser tests can be flaky. Need retry logic and stable selectors.
- **Test data management**: Strategy for seeding test data? Factories, fixtures, or inline creation?
- **Coverage targets**: What's the right initial target? 80% seems reasonable but might be aggressive for first pass.

## Notes

Recommended testing stack based on Next.js 16 ecosystem:
- **Vitest** - Fast unit/integration testing, native ESM support
- **React Testing Library** - Component testing best practices
- **Playwright** - Cross-browser E2E testing
- **MSW (Mock Service Worker)** - API mocking for component tests

Key files to prioritize for testing:
- `lib/utils.ts` - Pure functions, easy wins
- `lib/validations.ts` - Schema validation, critical for data integrity
- `app/api/foods/route.ts` - Core business logic
- `app/api/meals/route.ts` - Complex constraints and relationships
- `hooks/use-foods.ts` - State management and API integration

This initiative unblocks: Every other initiative benefits from test coverage. Specifically enables safe refactoring for Multi-Cat Support (#01) and Health Tracking (#04).
