import { relations, sql } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgPolicy,
	pgTable,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const mealTimeEnum = pgEnum("meal_time_type", ["morning", "evening"]);
export const preferenceEnum = pgEnum("preference", [
	"likes",
	"dislikes",
	"unknown",
]);

export const foods = pgTable(
	"foods",
	(t) => ({
		id: t.uuid().defaultRandom().primaryKey().notNull(),
		name: t.text().notNull(),
		notes: t.text(),
		preference: preferenceEnum().notNull(),
		inventoryQuantity: t.integer("inventory_quantity").default(0).notNull(),
		archived: t.boolean().default(false).notNull(),
		// Nutrition information (dry matter basis, in %)
		phosphorusDmb: t
			.numeric("phosphorus_dmb", { mode: "number", precision: 5, scale: 2 })
			.default(0)
			.notNull(),
		proteinDmb: t
			.numeric("protein_dmb", { mode: "number", precision: 5, scale: 2 })
			.default(0)
			.notNull(),
		fatDmb: t
			.numeric("fat_dmb", { mode: "number", precision: 5, scale: 2 })
			.default(0)
			.notNull(),
		fiberDmb: t
			.numeric("fiber_dmb", { mode: "number", precision: 5, scale: 2 })
			.default(0)
			.notNull(),
		createdAt: t
			.timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: t
			.timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	}),
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
	],
);

export const meals = pgTable(
	"meals",
	(t) => ({
		id: t.uuid().defaultRandom().primaryKey().notNull(),
		mealDate: t.date().notNull(),
		mealTime: mealTimeEnum().notNull(),
		foodId: t
			.uuid()
			.references(() => foods.id, { onDelete: "restrict" })
			.notNull(),
		amount: t.text().notNull(),
		notes: t.text(),
		createdAt: t
			.timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: t
			.timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	}),
	(t) => [
		index("idx_meals_food_ids").on(t.foodId),
		uniqueIndex("meals_date_time_unique").on(t.mealDate, t.mealTime, t.foodId),
		pgPolicy("Allow public to delete meals", {
			as: "permissive",
			for: "delete",
			to: ["public"],
			using: sql`true`,
		}),
		pgPolicy("Allow public to update meals", {
			as: "permissive",
			for: "update",
			to: ["public"],
		}),
		pgPolicy("Allow public to insert meals", {
			as: "permissive",
			for: "insert",
			to: ["public"],
		}),
		pgPolicy("Allow public to view meals", {
			as: "permissive",
			for: "select",
			to: ["public"],
		}),
	],
);

export const mealsRelations = relations(meals, ({ one }) => ({
	food: one(foods, {
		fields: [meals.foodId],
		references: [foods.id],
	}),
}));

export const foodsRelations = relations(foods, ({ many }) => ({
	meals: many(meals),
}));
