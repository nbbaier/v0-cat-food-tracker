import { asc, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { foods, meals } from "@/lib/db/schema";
import { mealInputSchema } from "@/lib/validations";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const allMeals = await db
			.select({
				id: meals.id,
				mealDate: meals.mealDate,
				mealTime: meals.mealTime,
				foodId: meals.foodId,
				amount: meals.amount,
				notes: meals.notes,
				createdAt: meals.createdAt,
				updatedAt: meals.updatedAt,
				food: {
					id: foods.id,
					name: foods.name,
					preference: foods.preference,
				},
			})
			.from(meals)
			.leftJoin(foods, eq(meals.foodId, foods.id))
			.orderBy(desc(meals.mealDate), asc(meals.mealTime));

		const formattedMeals = allMeals.map((meal) => ({
			id: meal.id,
			mealDate: meal.mealDate,
			mealTime: meal.mealTime,
			foodId: meal.foodId,
			food: meal.food,
			amount: meal.amount,
			notes: meal.notes ?? "",
			createdAt: meal.createdAt,
			updatedAt: meal.updatedAt,
		}));

		return NextResponse.json(formattedMeals);
	} catch (error) {
		console.error("[v0] GET /api/meals error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch meals",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const body = await request.json();

		// Validate input with Zod
		const validatedData = mealInputSchema.parse(body);

		const { mealDate, mealTime, foodId, amount, notes } = validatedData;

		const [newMeal] = await db
			.insert(meals)
			.values({
				mealDate,
				mealTime,
				foodId,
				amount,
				notes: notes ?? "",
			})
			.returning();

		const [food] = await db
			.select({
				id: foods.id,
				name: foods.name,
				preference: foods.preference,
			})
			.from(foods)
			.where(eq(foods.id, foodId))
			.limit(1);

		const formattedMeal = {
			id: newMeal.id,
			mealDate: newMeal.mealDate,
			mealTime: newMeal.mealTime,
			foodId: newMeal.foodId,
			food: food ?? null,
			amount: newMeal.amount,
			notes: newMeal.notes ?? "",
			createdAt: newMeal.createdAt,
			updatedAt: newMeal.updatedAt,
		};

		return NextResponse.json(formattedMeal, { status: 201 });
	} catch (error) {
		// Handle Zod validation errors
		if (error instanceof ZodError) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: error.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
				},
				{ status: 400 },
			);
		}

		console.error("[v0] POST /api/meals error:", error);
		return NextResponse.json(
			{
				error: "Failed to create meal",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
