-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"notes" text,
	"preference" text NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "foods_preference_check" CHECK (preference = ANY (ARRAY['likes'::text, 'dislikes'::text, 'unknown'::text]))
);
--> statement-breakpoint
ALTER TABLE "foods" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Allow public to delete foods" ON "foods" AS PERMISSIVE FOR DELETE TO public USING (true);--> statement-breakpoint
CREATE POLICY "Allow public to update foods" ON "foods" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Allow public to insert foods" ON "foods" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Allow public to view foods" ON "foods" AS PERMISSIVE FOR SELECT TO public;
*/