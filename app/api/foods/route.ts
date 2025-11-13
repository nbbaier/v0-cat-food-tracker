import { desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { foods, meals } from "@/lib/db/schema";
import { foodInputSchema } from "@/lib/validations";

/**
 * GET /api/foods - Fetch foods with pagination support
 *
 * Query parameters:
 * - limit: Number of items to return (default: 50, max: 200)
 * - offset: Number of items to skip (default: 0)
 *
 * Response format:
 * {
 *   foods: Food[],
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
			Math.min(Number.isFinite(rawLimit) ? rawLimit : 50, 200),
		);
		const rawOffset = Number.parseInt(searchParams.get("offset") ?? "", 10);
		const offset = Math.max(0, Number.isFinite(rawOffset) ? rawOffset : 0);

		// Pre-aggregate meal counts to avoid expensive DISTINCT with FILTER
		const mealCounts = db.$with("meal_counts").as(
			db
				.select({
					foodId: meals.foodId,
					cnt: sql<number>`count(*)`.as("cnt"),
				})
				.from(meals)
				.groupBy(meals.foodId),
		);

		const mealCommentCounts = db.$with("meal_comment_counts").as(
			db
				.select({
					foodId: meals.foodId,
					cnt: sql<number>`count(*)`.as("cnt"),
				})
				.from(meals)
				.where(sql`${meals.notes} is not null and ${meals.notes} <> ''`)
				.groupBy(meals.foodId),
		);

		const allFoods = await db
			.with(mealCounts, mealCommentCounts)
			.select({
				id: foods.id,
				name: foods.name,
				preference: foods.preference,
				notes: foods.notes,
				inventoryQuantity: foods.inventoryQuantity,
				archived: foods.archived,
				phosphorusDmb: foods.phosphorusDmb,
				proteinDmb: foods.proteinDmb,
				fatDmb: foods.fatDmb,
				fiberDmb: foods.fiberDmb,
				createdAt: foods.createdAt,
				mealCount: sql<number>`coalesce(${mealCounts.cnt}, 0)`.as("meal_count"),
				mealCommentCount: sql<number>`coalesce(${mealCommentCounts.cnt}, 0)`.as(
					"meal_comment_count",
				),
			})
			.from(foods)
			.leftJoin(mealCounts, eq(mealCounts.foodId, foods.id))
			.leftJoin(mealCommentCounts, eq(mealCommentCounts.foodId, foods.id))
			.orderBy(desc(foods.createdAt))
			.limit(limit)
			.offset(offset);

		const formattedFoods = allFoods.map((food) => ({
			id: food.id,
			name: food.name,
			preference: food.preference,
			notes: food.notes ?? "",
			inventoryQuantity: food.inventoryQuantity,
			archived: Boolean(food.archived),
			addedAt: new Date(food.createdAt).getTime(),
			phosphorusDmb: Number(food.phosphorusDmb),
			proteinDmb: Number(food.proteinDmb),
			fatDmb: Number(food.fatDmb),
			fiberDmb: Number(food.fiberDmb),
			mealCount: Number(food.mealCount) ?? 0,
			mealCommentCount: Number(food.mealCommentCount) ?? 0,
		}));

		return NextResponse.json(
			{
				foods: formattedFoods,
				hasMore: formattedFoods.length === limit,
			},
			{
				headers: {
					"Cache-Control": "private, max-age=30, stale-while-revalidate=300",
				},
			},
		);
	} catch (error) {
		console.error("[v0] GET /api/foods error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch foods",
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
		const validatedData = foodInputSchema.parse(body);

		const {
			name,
			preference,
			notes,
			inventoryQuantity,
			archived,
			phosphorusDmb,
			proteinDmb,
			fatDmb,
			fiberDmb,
		} = validatedData;

		// Build values object with proper typing
		// Nutrition fields are optional - if not provided, DB defaults (0) will be used
		const insertValues = {
			name,
			preference,
			notes: notes ?? "",
			inventoryQuantity: inventoryQuantity ?? 0,
			archived: archived ?? false,
			...(phosphorusDmb !== undefined && { phosphorusDmb }),
			...(proteinDmb !== undefined && { proteinDmb }),
			...(fatDmb !== undefined && { fatDmb }),
			...(fiberDmb !== undefined && { fiberDmb }),
		};

		const [newFood] = await db.insert(foods).values(insertValues).returning();

		const formattedFood = {
			id: newFood.id,
			name: newFood.name,
			preference: newFood.preference,
			notes: newFood.notes ?? "",
			inventoryQuantity: newFood.inventoryQuantity,
			archived: Boolean(newFood.archived),
			addedAt: new Date(newFood.createdAt).getTime(),
			phosphorusDmb: Number(newFood.phosphorusDmb),
			proteinDmb: Number(newFood.proteinDmb),
			fatDmb: Number(newFood.fatDmb),
			fiberDmb: Number(newFood.fiberDmb),
		};

		return NextResponse.json(formattedFood, { status: 201 });
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

		console.error("[v0] POST /api/foods error:", error);
		return NextResponse.json(
			{
				error: "Failed to create food",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
