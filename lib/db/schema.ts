import { sql } from "drizzle-orm";
import {
	check,
	integer,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const foods = pgTable(
	"foods",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		name: text().notNull(),
		notes: text(),
		preference: text().notNull(),
		inventoryQuantity: integer("inventory_quantity").default(0).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(_table) => [
		pgPolicy("Allow public to delete foods", {
			as: "permissive",
			for: "delete",
			to: ["public"],
			using: sql`true`,
		}),
		pgPolicy("Allow public to update foods", {
			as: "permissive",
			for: "update",
			to: ["public"],
		}),
		pgPolicy("Allow public to insert foods", {
			as: "permissive",
			for: "insert",
			to: ["public"],
		}),
		pgPolicy("Allow public to view foods", {
			as: "permissive",
			for: "select",
			to: ["public"],
		}),
		check(
			"foods_preference_check",
			sql`preference = ANY (ARRAY['likes'::text, 'dislikes'::text, 'unknown'::text])`,
		),
	],
);
