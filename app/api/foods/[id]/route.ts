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

		if (body.name !== undefined) updates.name = body.name;
		if (body.preference !== undefined) updates.preference = body.preference;
		if (body.notes !== undefined) updates.notes = body.notes;
		if (body.inventoryQuantity !== undefined)
			updates.inventory_quantity = body.inventoryQuantity;
		if (body.inStock !== undefined) updates.in_stock = body.inStock;

		if (Object.keys(updates).length === 0) {
			return NextResponse.json(
				{ error: "No fields to update" },
				{ status: 400 },
			);
		}

		updates.updated_at = new Date().toISOString();

		const supabase = await createClient();
		const { error } = await supabase.from("foods").update(updates).eq("id", id);

		if (error) throw error;

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
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		const supabase = await createClient();
		const { error } = await supabase.from("foods").delete().eq("id", id);

		if (error) throw error;

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
