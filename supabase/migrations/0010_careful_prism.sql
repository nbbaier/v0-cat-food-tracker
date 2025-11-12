ALTER TABLE "account" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "account_select_owner" ON "account" CASCADE;--> statement-breakpoint
DROP POLICY "account_insert_owner" ON "account" CASCADE;--> statement-breakpoint
DROP POLICY "account_update_owner" ON "account" CASCADE;--> statement-breakpoint
DROP POLICY "account_delete_owner" ON "account" CASCADE;--> statement-breakpoint
DROP POLICY "session_select_owner" ON "session" CASCADE;--> statement-breakpoint
DROP POLICY "session_insert_owner" ON "session" CASCADE;--> statement-breakpoint
DROP POLICY "session_update_owner" ON "session" CASCADE;--> statement-breakpoint
DROP POLICY "session_delete_owner" ON "session" CASCADE;--> statement-breakpoint
DROP POLICY "user_select_owner" ON "user" CASCADE;--> statement-breakpoint
DROP POLICY "user_update_owner" ON "user" CASCADE;--> statement-breakpoint
DROP POLICY "verification_admin_all" ON "verification" CASCADE;--> statement-breakpoint
DROP POLICY "verification_user_select" ON "verification" CASCADE;--> statement-breakpoint
DROP POLICY "verification_user_insert" ON "verification" CASCADE;--> statement-breakpoint
DROP POLICY "verification_user_update" ON "verification" CASCADE;--> statement-breakpoint
DROP POLICY "verification_user_delete" ON "verification" CASCADE;