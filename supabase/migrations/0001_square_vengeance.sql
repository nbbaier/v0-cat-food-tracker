ALTER TABLE "foods"
ADD COLUMN "inventory_quantity" integer DEFAULT 0 NOT NULL;

--> statement-breakpoint
ALTER TABLE "foods"
DROP COLUMN "in_stock";