import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meals } from "@/lib/db/schema";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();

		const updates: Record<string, unknown> = {};

		if (body.mealDate !== undefined) updates.mealDate = body.mealDate;
		if (body.mealTime !== undefined) updates.mealTime = body.mealTime;
		if (body.foodId !== undefined) updates.foodId = body.foodId;
		if (body.amount !== undefined) updates.amount = body.amount;
		if (body.notes !== undefined) updates.notes = body.notes;

		if (Object.keys(updates).length === 0) {
			return NextResponse.json(
				{ error: "No fields to update" },
				{ status: 400 },
			);
		}

		updates.updatedAt = new Date().toISOString();

		await db.update(meals).set(updates).where(eq(meals.id, id));

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
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		await db.delete(meals).where(eq(meals.id, id));

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
