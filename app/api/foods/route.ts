import { type NextRequest, NextResponse } from "next/server"
import { getTursoClient } from "@/lib/db"

export async function GET() {
  try {
    const db = getTursoClient()
    const result = await db.execute("SELECT * FROM foods ORDER BY added_at DESC")

    const foods = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      preference: row.preference,
      notes: row.notes,
      inStock: Boolean(row.in_stock),
      addedAt: Number(row.added_at),
    }))

    return NextResponse.json(foods)
  } catch (error) {
    console.error("[v0] GET /api/foods error:", error)
    return NextResponse.json(
      { error: "Failed to fetch foods", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, preference, notes, inStock } = body

    if (!name || !preference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const addedAt = Date.now()

    const db = getTursoClient()
    await db.execute({
      sql: "INSERT INTO foods (id, name, preference, notes, in_stock, added_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [id, name, preference, notes || "", inStock ? 1 : 0, addedAt],
    })

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
    console.error("[v0] POST /api/foods error:", error)
    return NextResponse.json(
      { error: "Failed to create food", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
