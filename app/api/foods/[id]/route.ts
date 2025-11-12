import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { foods } from "@/lib/db/schema";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();

		const updates: Record<string, unknown> = {};

		if (body.name !== undefined) updates.name = body.name;
		if (body.preference !== undefined) updates.preference = body.preference;
		if (body.notes !== undefined) updates.notes = body.notes;
		if (body.inventoryQuantity !== undefined)
			updates.inventoryQuantity = body.inventoryQuantity;
		if (body.phosphorusDmb !== undefined)
			updates.phosphorusDmb = body.phosphorusDmb;
		if (body.proteinDmb !== undefined) updates.proteinDmb = body.proteinDmb;
		if (body.fatDmb !== undefined) updates.fatDmb = body.fatDmb;
		if (body.fiberDmb !== undefined) updates.fiberDmb = body.fiberDmb;

		if (Object.keys(updates).length === 0) {
			return NextResponse.json(
				{ error: "No fields to update" },
				{ status: 400 },
			);
		}

		updates.updatedAt = new Date().toISOString();

		await db.update(foods).set(updates).where(eq(foods.id, id));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[v0] PATCH /api/foods/[id] error:", error);
		return NextResponse.json(
			{
				error: "Failed to update food",
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
		await db.delete(foods).where(eq(foods.id, id));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[v0] DELETE /api/foods/[id] error:", error);
		return NextResponse.json(
			{
				error: "Failed to delete food",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
