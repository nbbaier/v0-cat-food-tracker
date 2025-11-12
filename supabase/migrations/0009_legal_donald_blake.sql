ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "idx_verification_identifier" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE POLICY "verification_admin_all" ON "verification" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.jwt() ->> 'user_role') = 'admin') WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');--> statement-breakpoint
CREATE POLICY "verification_user_select" ON "verification" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((identifier IS NOT NULL) AND (identifier = (auth.jwt() ->> 'sub')));--> statement-breakpoint
CREATE POLICY "verification_user_insert" ON "verification" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((identifier IS NOT NULL) AND (identifier = (auth.jwt() ->> 'sub')));--> statement-breakpoint
CREATE POLICY "verification_user_update" ON "verification" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (identifier = (auth.jwt() ->> 'sub')) WITH CHECK (identifier = (auth.jwt() ->> 'sub'));--> statement-breakpoint
CREATE POLICY "verification_user_delete" ON "verification" AS PERMISSIVE FOR DELETE TO "authenticated" USING (identifier = (auth.jwt() ->> 'sub'));