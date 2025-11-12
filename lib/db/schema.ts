import { relations, sql } from "drizzle-orm";
import {
	boolean,
	index,
	pgEnum,
	pgPolicy,
	pgTable,
	text,
	timestamp,
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

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
