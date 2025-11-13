import { and, desc, eq, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { PAGINATION } from "@/lib/constants";
import { db } from "@/lib/db";
import { foods, meals } from "@/lib/db/schema";
import { foodInputSchema } from "@/lib/validations";

/**
 * GET /api/foods - Fetch foods with cursor-based pagination support
 *
 * Query parameters:
 * - limit: Number of items to return (default: 100, max: 500)
 * - cursor: Timestamp (milliseconds) to fetch items created before this time (optional)
 * - archived: Filter by archived status ("true" | "false", optional)
 *
 * Response format:
 * {
 *   foods: Food[],
 *   hasMore: boolean  // Indicates if more results are available
 * }
 *
 * Cursor-based pagination:
 * - First request: Don't include cursor parameter
 * - Subsequent requests: Use the smallest `addedAt` timestamp from previous results as cursor
 * - Results are ordered by createdAt DESC (newest first)
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
			Math.min(
				Number.isFinite(rawLimit) ? rawLimit : PAGINATION.DEFAULT_PAGE_SIZE,
				PAGINATION.MAX_PAGE_SIZE,
			),
		);
		const rawCursor = searchParams.get("cursor");
		const cursor = rawCursor ? Number.parseInt(rawCursor, 10) : null;
		const cursorDate =
			cursor && Number.isFinite(cursor) && cursor > 0
				? new Date(cursor).toISOString()
				: null;

		const archivedParam = searchParams.get("archived");
		let archivedFilter: boolean | null = null;
		if (typeof archivedParam === "string") {
			const normalized = archivedParam.trim().toLowerCase();
			if (normalized === "true") {
				archivedFilter = true;
			} else if (normalized === "false") {
				archivedFilter = false;
			}
		}

		const mealCountsSubquery = db
			.select({
				foodId: meals.foodId,
				totalCount: sql<number>`count(*)`.as("total_count"),
				commentCount:
					sql<number>`count(*) filter (where ${meals.notes} is not null and ${meals.notes} <> '')`.as(
						"comment_count",
					),
			})
			.from(meals)
			.innerJoin(foods, eq(meals.foodId, foods.id))
			.where(
				archivedFilter !== null
					? eq(foods.archived, archivedFilter)
					: undefined,
			)
			.groupBy(meals.foodId);

		const mealCountsCTEBuilder = db.$with("meal_counts");
		const _mealCountsTypeHelper = mealCountsCTEBuilder.as(mealCountsSubquery);
		type MealCountsCTE = typeof _mealCountsTypeHelper;

		let mealCounts: MealCountsCTE;
		try {
			mealCounts = mealCountsCTEBuilder.as(mealCountsSubquery);
		} catch (error) {
			console.error("[v0] GET /api/foods CTE construction error:", error);
			throw new Error(
				`Failed to construct meal_counts CTE: ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		const baseFoodsQuery = db
			.with(mealCounts)
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
				mealCount: sql<number>`coalesce(${mealCounts.totalCount}, 0)`.as(
					"meal_count",
				),
				mealCommentCount:
					sql<number>`coalesce(${mealCounts.commentCount}, 0)`.as(
						"meal_comment_count",
					),
			})
			.from(foods)
			.leftJoin(mealCounts, eq(mealCounts.foodId, foods.id));

		const whereConditions = [];
		if (archivedFilter !== null) {
			whereConditions.push(eq(foods.archived, archivedFilter));
		}
		if (cursorDate) {
			whereConditions.push(lt(foods.createdAt, cursorDate));
		}

		const foodsQuery =
			whereConditions.length > 0
				? baseFoodsQuery.where(and(...whereConditions))
				: baseFoodsQuery;

		const allFoods = await foodsQuery
			.orderBy(desc(foods.createdAt))
			.limit(limit + 1);

		const hasMore = allFoods.length > limit;
		const foodsToReturn = hasMore ? allFoods.slice(0, limit) : allFoods;

		const formattedFoods = foodsToReturn.map((food) => ({
			id: food.id,
			name: food.name,
			preference: food.preference,
			notes: food.notes ?? "",
			inventoryQuantity: food.inventoryQuantity,
			archived: Boolean(food.archived),
			addedAt: new Date(food.createdAt).getTime(),
			phosphorusDmb: food.phosphorusDmb,
			proteinDmb: food.proteinDmb,
			fatDmb: food.fatDmb,
			fiberDmb: food.fiberDmb,
			mealCount: Number(food.mealCount),
			mealCommentCount: Number(food.mealCommentCount),
		}));

		return NextResponse.json(
			{
				foods: formattedFoods,
				hasMore,
			},
			{
				headers: {
					"Cache-Control": "private, max-age=30, stale-while-revalidate=60",
				},
			},
		);
	} catch (error) {
		console.error("[v0] GET /api/foods error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch foods",
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
			phosphorusDmb: newFood.phosphorusDmb,
			proteinDmb: newFood.proteinDmb,
			fatDmb: newFood.fatDmb,
			fiberDmb: newFood.fiberDmb,
		};

		return NextResponse.json(formattedFood, { status: 201 });
	} catch (error) {
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
				...(process.env.NODE_ENV === "development" && {
					details: error instanceof Error ? error.message : String(error),
				}),
			},
			{ status: 500 },
		);
	}
}
