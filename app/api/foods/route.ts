import { desc } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { foods } from "@/lib/db/schema";

export async function GET() {
	try {
		const allFoods = await db
			.select()
			.from(foods)
			.orderBy(desc(foods.createdAt));

		const formattedFoods = allFoods.map((food) => ({
			id: food.id,
			name: food.name,
			preference: food.preference,
			notes: food.notes || "",
			inventoryQuantity: food.inventoryQuantity,
			addedAt: new Date(food.createdAt).getTime(),
			phosphorusDmb: food.phosphorusDmb ? Number(food.phosphorusDmb) : undefined,
			proteinDmb: food.proteinDmb ? Number(food.proteinDmb) : undefined,
			fatDmb: food.fatDmb ? Number(food.fatDmb) : undefined,
			fiberDmb: food.fiberDmb ? Number(food.fiberDmb) : undefined,
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
	try {
		const body = await request.json();
		const {
			name,
			preference,
			notes,
			inventoryQuantity,
			phosphorusDmb,
			proteinDmb,
			fatDmb,
			fiberDmb,
		} = body;

		if (!name || !preference) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const [newFood] = await db
			.insert(foods)
			.values({
				name,
				preference,
				notes: notes || "",
				inventoryQuantity: inventoryQuantity || 0,
				phosphorusDmb: phosphorusDmb?.toString(),
				proteinDmb: proteinDmb?.toString(),
				fatDmb: fatDmb?.toString(),
				fiberDmb: fiberDmb?.toString(),
			})
			.returning();

		const formattedFood = {
			id: newFood.id,
			name: newFood.name,
			preference: newFood.preference,
			notes: newFood.notes || "",
			inventoryQuantity: newFood.inventoryQuantity,
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
