import { z } from "zod";

// ============================================================================
// Food Validation Schemas
// ============================================================================

// Food creation schema with comprehensive validation
export const foodInputSchema = z
	.object({
		name: z
			.string()
			.min(1, "Food name is required")
			.max(200, "Food name must be less than 200 characters"),
		preference: z.enum(["likes", "neutral", "dislikes", "unknown"], {
			message: "Preference must be 'likes', 'neutral', 'dislikes', or 'unknown'",
		}),
		notes: z
			.string()
			.max(2000, "Notes must be less than 2000 characters")
			.optional(),
		inventoryQuantity: z
			.number()
			.int("Inventory must be a whole number")
			.min(0, "Inventory cannot be negative")
			.max(999, "Inventory cannot exceed 999")
			.optional(),
		archived: z.boolean().optional(),
		phosphorusDmb: z
			.number()
			.min(0, "Phosphorus percentage cannot be negative")
			.max(100, "Phosphorus percentage cannot exceed 100")
			.multipleOf(
				0.01,
				"Phosphorus percentage must have at most 2 decimal places",
			)
			.optional(),
		proteinDmb: z
			.number()
			.min(0, "Protein percentage cannot be negative")
			.max(100, "Protein percentage cannot exceed 100")
			.multipleOf(0.01, "Protein percentage must have at most 2 decimal places")
			.optional(),
		fatDmb: z
			.number()
			.min(0, "Fat percentage cannot be negative")
			.max(100, "Fat percentage cannot exceed 100")
			.multipleOf(0.01, "Fat percentage must have at most 2 decimal places")
			.optional(),
		fiberDmb: z
			.number()
			.min(0, "Fiber percentage cannot be negative")
			.max(100, "Fiber percentage cannot exceed 100")
			.multipleOf(0.01, "Fiber percentage must have at most 2 decimal places")
			.optional(),
	})
	.strict(); // Reject unknown fields

// Food update schema - all fields optional but validated
export const foodUpdateSchema = z
	.object({
		name: z
			.string()
			.min(1, "Food name cannot be empty")
			.max(200, "Food name must be less than 200 characters")
			.optional(),
		preference: z
			.enum(["likes", "neutral", "dislikes", "unknown"], {
				message: "Preference must be 'likes', 'neutral', 'dislikes', or 'unknown'",
			})
			.optional(),
		notes: z
			.string()
			.max(2000, "Notes must be less than 2000 characters")
			.optional(),
		inventoryQuantity: z
			.number()
			.int("Inventory must be a whole number")
			.min(0, "Inventory cannot be negative")
			.max(999, "Inventory cannot exceed 999")
			.optional(),
		archived: z.boolean().optional(),
		phosphorusDmb: z
			.number()
			.min(0, "Phosphorus percentage cannot be negative")
			.max(100, "Phosphorus percentage cannot exceed 100")
			.multipleOf(
				0.01,
				"Phosphorus percentage must have at most 2 decimal places",
			)
			.optional(),
		proteinDmb: z
			.number()
			.min(0, "Protein percentage cannot be negative")
			.max(100, "Protein percentage cannot exceed 100")
			.multipleOf(0.01, "Protein percentage must have at most 2 decimal places")
			.optional(),
		fatDmb: z
			.number()
			.min(0, "Fat percentage cannot be negative")
			.max(100, "Fat percentage cannot exceed 100")
			.multipleOf(0.01, "Fat percentage must have at most 2 decimal places")
			.optional(),
		fiberDmb: z
			.number()
			.min(0, "Fiber percentage cannot be negative")
			.max(100, "Fiber percentage cannot exceed 100")
			.multipleOf(0.01, "Fiber percentage must have at most 2 decimal places")
			.optional(),
	})
	.strict()
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided for update",
	});

// ============================================================================
// Meal Validation Schemas
// ============================================================================

// ISO date string validation (YYYY-MM-DD format)
const isoDateString = z.string().refine(
	(val) => {
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
		if (!dateRegex.test(val)) return false;
		const date = new Date(val);
		if (Number.isNaN(date.getTime())) return false;

		const minDate = new Date("2020-01-01");
		const maxDate = new Date();
		maxDate.setDate(maxDate.getDate() + 1);

		return date >= minDate && date <= maxDate;
	},
	{
		message: "Date must be in YYYY-MM-DD format and within valid range",
	},
);

// UUID validation
const uuidString = z.string().uuid("Invalid food ID format");

const amountString = z
	.string()
	.min(1, "Amount is required")
	.max(50, "Amount description too long")
	.refine(
		(val) => {
			const amountRegex =
				/^\d+(\.\d+)?\s*(g|ml|oz|lb|kg|can|cans|cup|cups|tbsp|tsp|pouch|pouches)$/i;
			return amountRegex.test(val.trim());
		},
		{
			message:
				"Amount must be a number with a unit (e.g., '100g', '2 cans', '1.5 cups')",
		},
	);

// Meal creation schema with comprehensive validation
export const mealInputSchema = z
	.object({
		mealDate: isoDateString,
		mealTime: z.enum(["morning", "evening"], {
			message: "Meal time must be 'morning' or 'evening'",
		}),
		foodId: uuidString,
		amount: amountString,
		notes: z
			.string()
			.max(500, "Notes must be less than 500 characters")
			.optional(),
	})
	.strict(); // Reject unknown fields

// Meal update schema - all fields optional but validated
export const mealUpdateSchema = z
	.object({
		mealDate: isoDateString.optional(),
		mealTime: z
			.enum(["morning", "evening"], {
				message: "Meal time must be 'morning' or 'evening'",
			})
			.optional(),
		foodId: uuidString.optional(),
		amount: amountString.optional(),
		notes: z
			.string()
			.max(500, "Notes must be less than 500 characters")
			.optional(),
	})
	.strict()
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided for update",
	});

// ============================================================================
// Type Exports
// ============================================================================

export type FoodInput = z.infer<typeof foodInputSchema>;
export type FoodUpdate = z.infer<typeof foodUpdateSchema>;
export type MealInput = z.infer<typeof mealInputSchema>;
export type MealUpdate = z.infer<typeof mealUpdateSchema>;
