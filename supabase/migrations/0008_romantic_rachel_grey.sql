ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "idx_account_user_id" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_session_user_id" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "account_select_owner" ON "account" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((SELECT auth.uid())::text = user_id);--> statement-breakpoint
CREATE POLICY "account_insert_owner" ON "account" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((SELECT auth.uid())::text = user_id);--> statement-breakpoint
CREATE POLICY "account_update_owner" ON "account" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((SELECT auth.uid())::text = user_id) WITH CHECK ((SELECT auth.uid())::text = user_id);--> statement-breakpoint
CREATE POLICY "account_delete_owner" ON "account" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((SELECT auth.uid())::text = user_id);--> statement-breakpoint
CREATE POLICY "session_select_owner" ON "session" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((SELECT auth.uid())::text = user_id);--> statement-breakpoint
CREATE POLICY "session_insert_owner" ON "session" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((SELECT auth.uid())::text = user_id);--> statement-breakpoint
CREATE POLICY "session_update_owner" ON "session" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((SELECT auth.uid())::text = user_id) WITH CHECK ((SELECT auth.uid())::text = user_id);--> statement-breakpoint
CREATE POLICY "session_delete_owner" ON "session" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((SELECT auth.uid())::text = user_id);--> statement-breakpoint
CREATE POLICY "user_select_owner" ON "user" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((SELECT auth.uid())::text = id);--> statement-breakpoint
CREATE POLICY "user_update_owner" ON "user" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((SELECT auth.uid())::text = id) WITH CHECK ((SELECT auth.uid())::text = id);