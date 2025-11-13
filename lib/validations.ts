import { z } from "zod";

// Food validation schema
export const foodInputSchema = z.object({
	name: z.string().min(1, "Food name is required"),
	preference: z.enum(["likes", "dislikes", "unknown"], {
		message: "Invalid preference value",
	}),
	notes: z.string().optional(),
	inventoryQuantity: z.number().int().min(0).optional(),
	archived: z.boolean().optional(),
	phosphorusDmb: z.number().min(0).max(100).optional(),
	proteinDmb: z.number().min(0).max(100).optional(),
	fatDmb: z.number().min(0).max(100).optional(),
	fiberDmb: z.number().min(0).max(100).optional(),
});

// Meal validation schema
export const mealInputSchema = z.object({
	mealDate: z.string().min(1, "Meal date is required"),
	mealTime: z.enum(["morning", "evening"], {
		message: "Invalid meal time value",
	}),
	foodId: z.string().min(1, "Food selection is required"),
	amount: z.string().min(1, "Amount is required"),
	notes: z.string().optional(),
});
