import { type NextRequest, NextResponse } from "next/server"
import { getDbClient } from "@/lib/db"
import crypto from "crypto"

export async function GET() {
  try {
    console.log("[v0] GET /api/foods - Starting request")
    const db = getDbClient()
    console.log("[v0] Database client obtained successfully")

    console.log("[v0] Executing query: SELECT * FROM foods ORDER BY added_at DESC")
    const result = await db.execute("SELECT * FROM foods ORDER BY added_at DESC")
    console.log("[v0] Query executed successfully")
    console.log("[v0] Query result:", {
      rowCount: result.rows.length,
      columns: result.rows.length > 0 ? Object.keys(result.rows[0]) : [],
      firstRow: result.rows[0] || null,
    })

    const foods = result.rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      preference: row.preference as "likes" | "dislikes" | "unknown",
      notes: row.notes as string,
      inStock: Boolean(row.in_stock),
      addedAt: Number(row.added_at),
    }))

    return NextResponse.json(foods)
  } catch (error) {
    console.error("[v0] GET /api/foods - Error caught:")
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : undefined)
    console.error("[v0] Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return NextResponse.json(
      { error: "Failed to fetch foods", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST /api/foods - Starting request")
    const body = await request.json()
    console.log("[v0] Request body parsed:", body)

    const { name, preference, notes, inStock } = body

    if (!name || !preference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const addedAt = Date.now()

    const db = getDbClient()
    console.log("[v0] Database client obtained")
    console.log("[v0] Executing INSERT with args:", [id, name, preference, notes || "", inStock ? 1 : 0, addedAt])

    const insertResult = await db.execute({
      sql: "INSERT INTO foods (id, name, preference, notes, in_stock, added_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [id, name, preference, notes || "", inStock ? 1 : 0, addedAt],
    })
    console.log("[v0] INSERT successful, result:", insertResult)

    const newFood = {
      id,
      name,
      preference,
      notes: notes || "",
      inStock,
      addedAt,
    }

    return NextResponse.json(newFood, { status: 201 })
  } catch (error) {
    console.error("[v0] POST /api/foods - Error caught:")
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : undefined)
    console.error("[v0] Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return NextResponse.json(
      {
        error: "Failed to create food",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
