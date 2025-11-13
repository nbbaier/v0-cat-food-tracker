/**
 * Centralized type definitions for the cat food tracker application
 */

export type Food = {
	id: string;
	name: string;
	preference: "likes" | "dislikes" | "unknown";
	notes: string;
	inventoryQuantity: number;
	addedAt: number;
	phosphorusDmb?: number;
	proteinDmb?: number;
	fatDmb?: number;
	fiberDmb?: number;
	mealCount?: number;
	mealCommentCount?: number;
};

export type FoodInput = Omit<
	Food,
	"id" | "addedAt" | "mealCount" | "mealCommentCount"
>;

export type FoodUpdate = Partial<
	Omit<Food, "id" | "addedAt" | "mealCount" | "mealCommentCount">
>;

export type FoodSummary = Pick<Food, "id" | "name" | "preference">;

export type Meal = {
	id: string;
	mealDate: string;
	mealTime: "morning" | "evening";
	foodId: string;
	food: FoodSummary;
	amount: string;
	notes: string;
	createdAt: string;
	updatedAt: string;
};

export type MealInput = Omit<Meal, "id" | "food" | "createdAt" | "updatedAt">;

export type SortOption = "name" | "preference" | "inventory" | "date";

export type InventoryFilter = "all" | "in-stock" | "out-of-stock";
