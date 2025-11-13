import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { meals } from "@/lib/db/schema";
import { getErrorDetails, safeLogError } from "@/lib/utils";
import { mealUpdateSchema } from "@/lib/validations";

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
		const validatedData = mealUpdateSchema.parse(body);

		const updates = { ...validatedData, updatedAt: new Date().toISOString() };

		await db.update(meals).set(updates).where(eq(meals.id, id));

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof ZodError) {
			const details =
				process.env.NODE_ENV === "development"
					? error.issues.map((e) => `${e.path.join(".")}: ${e.message}`)
					: undefined;
			return NextResponse.json(
				{
					error: "Validation failed",
					...(details && { details }),
				},
				{ status: 400 },
			);
		}

		safeLogError("PATCH /api/meals/[id]", error);
		const details = getErrorDetails(error);
		return NextResponse.json(
			{
				error: "Failed to update meal",
				...(details && { details }),
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
		await db.delete(meals).where(eq(meals.id, id));

		return NextResponse.json({ success: true });
	} catch (error) {
		safeLogError("DELETE /api/meals/[id]", error);
		const details = getErrorDetails(error);
		return NextResponse.json(
			{
				error: "Failed to delete meal",
				...(details && { details }),
			},
			{ status: 500 },
		);
	}
}
