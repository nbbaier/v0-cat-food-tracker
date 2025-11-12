ALTER TABLE "foods"
ADD COLUMN "phosphorus_dmb" numeric(5, 2) DEFAULT 0 NOT NULL;

--> statement-breakpoint
ALTER TABLE "foods"
ADD COLUMN "protein_dmb" numeric(5, 2) DEFAULT 0 NOT NULL;

--> statement-breakpoint
ALTER TABLE "foods"
ADD COLUMN "fat_dmb" numeric(5, 2) DEFAULT 0 NOT NULL;

--> statement-breakpoint
ALTER TABLE "foods"
ADD COLUMN "fiber_dmb" numeric(5, 2) DEFAULT 0 NOT NULL;