import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { foods } from "@/lib/db/schema";
import { foodUpdateSchema } from "@/lib/validations";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const { id } = await params;
		const body = await request.json();

		// Validate input with Zod
		const validatedData = foodUpdateSchema.parse(body);

		// Prepare updates with validated data
		const updates: Record<string, unknown> = { ...validatedData };
		updates.updatedAt = new Date().toISOString();

		await db.update(foods).set(updates).where(eq(foods.id, id));

		return NextResponse.json({ success: true });
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
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
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
