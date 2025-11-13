CREATE INDEX "idx_foods_created_at" ON "foods" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_foods_preference" ON "foods" USING btree ("preference");--> statement-breakpoint
CREATE INDEX "idx_foods_inventory" ON "foods" USING btree ("inventory_quantity");