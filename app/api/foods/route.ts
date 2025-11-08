import { type NextRequest, NextResponse } from "next/server"
import { getDbClient } from "@/lib/db"

export async function GET() {
  try {
    const db = getDbClient()
    const result = await db.execute("SELECT * FROM foods ORDER BY added_at DESC")

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
    console.error("[v0] Error fetching foods:", error)
    return NextResponse.json({ error: "Failed to fetch foods" }, { status: 500 })
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

    const db = getDbClient()
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
    console.error("[v0] Error creating food:", error)
    return NextResponse.json({ error: "Failed to create food" }, { status: 500 })
  }
}
