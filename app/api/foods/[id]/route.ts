import { type NextRequest, NextResponse } from "next/server"
import { getDbClient } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updates: string[] = []
    const args: any[] = []

    if (body.name !== undefined) {
      updates.push("name = ?")
      args.push(body.name)
    }
    if (body.preference !== undefined) {
      updates.push("preference = ?")
      args.push(body.preference)
    }
    if (body.notes !== undefined) {
      updates.push("notes = ?")
      args.push(body.notes)
    }
    if (body.inStock !== undefined) {
      updates.push("in_stock = ?")
      args.push(body.inStock ? 1 : 0)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    args.push(id)

    const db = getDbClient()
    await db.execute({
      sql: `UPDATE foods SET ${updates.join(", ")} WHERE id = ?`,
      args,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating food:", error)
    return NextResponse.json({ error: "Failed to update food" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = getDbClient()
    await db.execute({
      sql: "DELETE FROM foods WHERE id = ?",
      args: [id],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting food:", error)
    return NextResponse.json({ error: "Failed to delete food" }, { status: 500 })
  }
}
