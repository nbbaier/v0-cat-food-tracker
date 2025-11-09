import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
	try {
		const supabase = await createClient();
		const { data: meals, error } = await supabase
			.from("meals")
			.select(`
				*,
				food:foods (
					id,
					name,
					preference
				)
			`)
			.order("meal_date", { ascending: false })
			.order("meal_time", { ascending: true });

		if (error) throw error;

		// Map Supabase response to match frontend expectations
		const formattedMeals = meals.map((meal) => ({
			id: meal.id,
			mealDate: meal.meal_date,
			mealTime: meal.meal_time,
			foodId: meal.food_id,
			food: meal.food,
			amount: meal.amount,
			notes: meal.notes || "",
			createdAt: meal.created_at,
			updatedAt: meal.updated_at,
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
	try {
		const body = await request.json();
		const { mealDate, mealTime, foodId, amount, notes } = body;

		if (!mealDate || !mealTime || !foodId || !amount) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const supabase = await createClient();
		const { data: meal, error } = await supabase
			.from("meals")
			.insert({
				meal_date: mealDate,
				meal_time: mealTime,
				food_id: foodId,
				amount,
				notes: notes || "",
			})
			.select(`
				*,
				food:foods (
					id,
					name,
					preference
				)
			`)
			.single();

		if (error) throw error;

		// Format response to match frontend expectations
		const newMeal = {
			id: meal.id,
			mealDate: meal.meal_date,
			mealTime: meal.meal_time,
			foodId: meal.food_id,
			food: meal.food,
			amount: meal.amount,
			notes: meal.notes || "",
			createdAt: meal.created_at,
			updatedAt: meal.updated_at,
		};

		return NextResponse.json(newMeal, { status: 201 });
	} catch (error) {
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
