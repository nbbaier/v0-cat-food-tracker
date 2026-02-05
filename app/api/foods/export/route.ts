import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { foods } from "@/lib/db/schema";
import { safeLogError } from "@/lib/utils";

/**
 * GET /api/foods/export - Export foods as CSV
 *
 * Query parameters:
 * - archived: Filter by archived status ("true" | "false", optional - defaults to false)
 *
 * Returns a CSV file with all food inventory data
 */
export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { searchParams } = new URL(request.url);
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

		const query =
			archivedFilter !== null
				? db
						.select()
						.from(foods)
						.where(eq(foods.archived, archivedFilter))
						.orderBy(desc(foods.createdAt))
				: db.select().from(foods).orderBy(desc(foods.createdAt));

		const allFoods = await query;

		const csvHeaders = [
			"Name",
			"Preference",
			"Inventory Quantity",
			"Archived",
			"Notes",
			"Phosphorus (DMB %)",
			"Protein (DMB %)",
			"Fat (DMB %)",
			"Fiber (DMB %)",
			"Created At",
		];

		const escapeCSVField = (
			value: string | number | boolean | null,
		): string => {
			if (value === null || value === undefined) {
				return "";
			}
			const stringValue = String(value);
			if (
				stringValue.includes(",") ||
				stringValue.includes('"') ||
				stringValue.includes("\n") ||
				stringValue.includes("\r")
			) {
				return `"${stringValue.replace(/"/g, '""')}"`;
			}
			return stringValue;
		};

		const csvRows = allFoods.map((food) =>
			[
				escapeCSVField(food.name),
				escapeCSVField(food.preference),
				escapeCSVField(food.inventoryQuantity),
				escapeCSVField(food.archived ? "Yes" : "No"),
				escapeCSVField(food.notes),
				escapeCSVField(food.phosphorusDmb),
				escapeCSVField(food.proteinDmb),
				escapeCSVField(food.fatDmb),
				escapeCSVField(food.fiberDmb),
				escapeCSVField(food.createdAt),
			].join(","),
		);

		const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

		const timestamp = new Date().toISOString().split("T")[0];
		const filename = `cat-food-inventory-${timestamp}.csv`;

		return new NextResponse(csvContent, {
			status: 200,
			headers: {
				"Content-Type": "text/csv; charset=utf-8",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (error) {
		safeLogError("GET /api/foods/export", error);
		return NextResponse.json(
			{ error: "Failed to export foods" },
			{ status: 500 },
		);
	}
}
