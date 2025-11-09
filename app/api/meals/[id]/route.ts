import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		const body = await request.json();

		const updates: Record<string, any> = {};

		if (body.mealDate !== undefined) updates.meal_date = body.mealDate;
		if (body.mealTime !== undefined) updates.meal_time = body.mealTime;
		if (body.foodId !== undefined) updates.food_id = body.foodId;
		if (body.amount !== undefined) updates.amount = body.amount;
		if (body.notes !== undefined) updates.notes = body.notes;

		if (Object.keys(updates).length === 0) {
			return NextResponse.json(
				{ error: "No fields to update" },
				{ status: 400 },
			);
		}

		updates.updated_at = new Date().toISOString();

		const supabase = await createClient();
		const { error } = await supabase.from("meals").update(updates).eq("id", id);

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[v0] PATCH /api/meals/[id] error:", error);
		return NextResponse.json(
			{
				error: "Failed to update meal",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		const supabase = await createClient();
		const { error } = await supabase.from("meals").delete().eq("id", id);

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[v0] DELETE /api/meals/[id] error:", error);
		return NextResponse.json(
			{
				error: "Failed to delete meal",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
