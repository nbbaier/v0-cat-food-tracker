# Multi-User Household Support

**Category:** Architecture
**Quarter:** Q2-Q3
**T-shirt Size:** L

## Why This Matters

Cat care is rarely a solo activity. In most households, multiple family members share responsibility for feeding cats. Currently, the app has a hardcoded 2-email whitelist in `lib/auth.ts`, and there's no concept of shared access—each user has their own isolated data. This means one family member might track meals while another has no visibility, leading to duplicate feedings, missed meals, or conflicting records.

Multi-user household support transforms the app from a personal tool into a family tool. All household members see the same cats, same foods, same meal history. One person can log a morning meal, and everyone knows it's been done. This prevents the classic "Did you feed the cat?" confusion that plagues shared pet care.

Beyond household sharing, this initiative establishes the foundation for community features (#10) by introducing the concept of users beyond the owner and access control patterns.

## Current State

- Authentication limited to 2 whitelisted emails (`lib/auth.ts:25-27`)
- No household or group concept in schema
- No sharing or invitation system
- Each user implicitly owns all their data
- No multi-user access control
- Better Auth configured but email whitelist blocks signups
- No roles (owner vs. member)

## Proposed Future State

**Household Structure:**
- Households group users and cats together
- One owner per household (billing, primary control)
- Multiple members with configurable permissions
- Household-level data: cats, foods, meals, inventory

**Invitation System:**
- Owner invites members via email
- Invitation link with expiration
- Accept/decline workflow
- No more hardcoded email whitelist

**Role-Based Access:**
- Owner: Full control, invite/remove members, billing, delete household
- Member: Full read/write for logging, limited admin access
- View-only (optional): Can see data but not modify (for grandma who wants updates)

**Activity Attribution:**
- Meals show who logged them ("Fed by Sarah at 8:03 AM")
- Activity feed shows household activity
- Audit trail for important changes

**User Experience:**
- Household switcher for users in multiple households
- Unified view of all household data
- Real-time sync consideration (prevent conflicts)
- Push notifications for household events

## Key Deliverables

- [ ] Remove hardcoded email whitelist from `lib/auth.ts`
- [ ] Design household schema (households, household_members, invitations)
- [ ] Implement household creation on first user signup
- [ ] Build invitation system (create, send, accept, expire)
- [ ] Implement role-based access control (RBAC) layer
- [ ] Migrate existing data to household model
- [ ] Add `created_by`/`logged_by` fields to relevant tables
- [ ] Build household settings UI (members, roles, invitations)
- [ ] Implement member management (invite, remove, change role)
- [ ] Create activity attribution UI (show who logged what)
- [ ] Add household switcher for multi-household users
- [ ] Implement Supabase RLS policies based on household membership
- [ ] Build notification system for household events
- [ ] Create household onboarding flow for new users
- [ ] Add "Leave household" functionality for members

## Prerequisites

- Multi-Cat Support (#01) - Cats should be household-level entities
- Comprehensive Test Suite (#02) - Access control changes require thorough testing

## Risks & Open Questions

- **Data migration**: Existing users have data without household context. Need to create households for each existing user and assign their data.
- **Conflict resolution**: What if two users log the same meal simultaneously? Need optimistic concurrency handling.
- **Privacy model**: Is all data shared within household, or can some data be private? Start with full sharing, simplest model.
- **Billing implications**: If we ever add paid features, which user pays? The owner.
- **RLS complexity**: Row-level security for household access is more complex than single-user RLS.
- **Real-time sync**: Should updates be real-time (WebSocket) or refresh-based? Start with refresh, add real-time later.
- **Removal complexity**: What happens to data when a member is removed? Keep their historical logs but attribute to "Former member"?

## Notes

Database schema additions:
```sql
households (id, name, created_at, updated_at)

household_members (
  id,
  household_id FK,
  user_id FK,
  role enum('owner', 'member', 'viewer'),
  joined_at,
  invited_by
)

invitations (
  id,
  household_id FK,
  email,
  role,
  token (unique),
  expires_at,
  accepted_at,
  invited_by
)

-- Modify existing tables to add household_id FK
foods: add household_id
meals: add household_id, logged_by
cats: add household_id
```

Key files to modify:
- `lib/auth.ts` - Remove email whitelist, add household creation on signup
- `lib/db/schema.ts` - Add household tables, modify existing tables
- All API routes - Add household filtering and authorization
- `components/layout/*` - Household switcher
- New: `app/settings/household/page.tsx` - Household management
- New: `app/invite/[token]/page.tsx` - Invitation acceptance

RLS policy pattern:
```sql
CREATE POLICY household_access ON foods
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid()
    )
  );
```

This initiative enables: Community Features (#10) builds on the multi-user foundation
