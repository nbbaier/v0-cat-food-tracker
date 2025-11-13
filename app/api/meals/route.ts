import { asc, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { foods, meals } from "@/lib/db/schema";
import { mealInputSchema } from "@/lib/validations";

/**
 * GET /api/meals - Fetch meals with pagination support
 *
 * Query parameters:
 * - limit: Number of items to return (default: 100, max: 500)
 * - offset: Number of items to skip (default: 0)
 *
 * Response format:
 * {
 *   meals: Meal[],
 *   hasMore: boolean  // Indicates if more results are available
 * }
 *
 * Note: Frontend pagination UI is not yet implemented. Currently, the frontend
 * only fetches the first page (default limit). Future work should implement
 * infinite scroll or "Load More" functionality to leverage pagination.
 */
export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const { searchParams } = new URL(request.url);
		const rawLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
		const limit = Math.max(
			1,
			Math.min(Number.isFinite(rawLimit) ? rawLimit : 100, 500),
		);
		const rawOffset = Number.parseInt(searchParams.get("offset") ?? "", 10);
		const offset = Math.max(0, Number.isFinite(rawOffset) ? rawOffset : 0);

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
			.orderBy(desc(meals.mealDate), asc(meals.mealTime))
			.limit(limit)
			.offset(offset);

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

		return NextResponse.json(
			{
				meals: formattedMeals,
				hasMore: formattedMeals.length === limit,
			},
			{
				headers: {
					// Reduced stale-while-revalidate from 300s to 60s to minimize stale data
					// for real-time meal tracking
					"Cache-Control": "private, max-age=30, stale-while-revalidate=60",
				},
			},
		);
	} catch (error) {
		console.error("[v0] GET /api/meals error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch meals",
				...(process.env.NODE_ENV === "development" && {
					details: error instanceof Error ? error.message : String(error),
				}),
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
				...(process.env.NODE_ENV === "development" && {
					details: error instanceof Error ? error.message : String(error),
				}),
			},
			{ status: 500 },
		);
	}
}
