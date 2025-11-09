-- Add archived column to foods table
ALTER TABLE "foods"
ADD COLUMN "archived" boolean DEFAULT false NOT NULL;

--> statement-breakpoint
-- Update foreign key constraint to use restrict on delete
ALTER TABLE "meals"
DROP CONSTRAINT "meals_foodId_foods_id_fk";

--> statement-breakpoint
ALTER TABLE "meals"
ADD CONSTRAINT "meals_foodId_foods_id_fk" FOREIGN KEY ("foodId") REFERENCES "public"."foods" ("id") ON DELETE restrict ON UPDATE no action;