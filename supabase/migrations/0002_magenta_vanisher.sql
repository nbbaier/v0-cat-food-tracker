CREATE TYPE "public"."meal_time_type" AS ENUM('morning', 'evening');--> statement-breakpoint
CREATE TYPE "public"."preference" AS ENUM('likes', 'dislikes', 'unknown');--> statement-breakpoint
CREATE TABLE "meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mealDate" date NOT NULL,
	"mealTime" "meal_time_type" NOT NULL,
	"foodId" uuid NOT NULL,
	"amount" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "foods" DROP CONSTRAINT "foods_preference_check";--> statement-breakpoint
ALTER TABLE "foods" ALTER COLUMN "preference" SET DATA TYPE "public"."preference" USING "preference"::"public"."preference";--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_foodId_foods_id_fk" FOREIGN KEY ("foodId") REFERENCES "public"."foods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_meals_food_ids" ON "meals" USING btree ("foodId");--> statement-breakpoint
CREATE UNIQUE INDEX "meals_date_time_unique" ON "meals" USING btree ("mealDate","mealTime","foodId");--> statement-breakpoint
CREATE POLICY "Allow public to delete meals" ON "meals" AS PERMISSIVE FOR DELETE TO public USING (true);--> statement-breakpoint
CREATE POLICY "Allow public to update meals" ON "meals" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Allow public to insert meals" ON "meals" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Allow public to view meals" ON "meals" AS PERMISSIVE FOR SELECT TO public;