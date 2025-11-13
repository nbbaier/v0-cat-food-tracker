import { desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { foods, meals } from "@/lib/db/schema";
import { foodInputSchema } from "@/lib/validations";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const allFoods = await db
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
				mealCount:
					sql<number>`coalesce(count(distinct ${meals.id}) filter (where ${meals.id} is not null), 0)`.as(
						"meal_count",
					),
				mealCommentCount:
					sql<number>`coalesce(count(distinct ${meals.id}) filter (where ${meals.notes} is not null and ${meals.notes} != ''), 0)`.as(
						"meal_comment_count",
					),
			})
			.from(foods)
			.leftJoin(meals, eq(foods.id, meals.foodId))
			.groupBy(foods.id)
			.orderBy(desc(foods.createdAt));

		const formattedFoods = allFoods.map((food) => ({
			id: food.id,
			name: food.name,
			preference: food.preference,
			notes: food.notes ?? "",
			inventoryQuantity: food.inventoryQuantity,
			archived: Boolean(food.archived),
			addedAt: new Date(food.createdAt).getTime(),
			phosphorusDmb: food.phosphorusDmb
				? Number(food.phosphorusDmb)
				: undefined,
			proteinDmb: food.proteinDmb ? Number(food.proteinDmb) : undefined,
			fatDmb: food.fatDmb ? Number(food.fatDmb) : undefined,
			fiberDmb: food.fiberDmb ? Number(food.fiberDmb) : undefined,
			mealCount: Number(food.mealCount) ?? 0,
			mealCommentCount: Number(food.mealCommentCount) ?? 0,
		}));

		return NextResponse.json(formattedFoods);
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

		const [newFood] = await db
			.insert(foods)
			.values({
				name,
				preference,
				notes: notes ?? "",
				inventoryQuantity: inventoryQuantity ?? 0,
				archived: archived ?? false,
				phosphorusDmb,
				proteinDmb,
				fatDmb,
				fiberDmb,
			})
			.returning();

		const formattedFood = {
			id: newFood.id,
			name: newFood.name,
			preference: newFood.preference,
			notes: newFood.notes ?? "",
			inventoryQuantity: newFood.inventoryQuantity,
			archived: Boolean(newFood.archived),
			addedAt: new Date(newFood.createdAt).getTime(),
			phosphorusDmb: newFood.phosphorusDmb
				? Number(newFood.phosphorusDmb)
				: undefined,
			proteinDmb: newFood.proteinDmb ? Number(newFood.proteinDmb) : undefined,
			fatDmb: newFood.fatDmb ? Number(newFood.fatDmb) : undefined,
			fiberDmb: newFood.fiberDmb ? Number(newFood.fiberDmb) : undefined,
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
