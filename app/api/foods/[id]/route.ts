import { type NextRequest, NextResponse } from "next/server"
import { getDbClient } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("[v0] PATCH /api/foods/[id] - Starting request")
    const { id } = await params
    console.log("[v0] Food ID:", id)
    const body = await request.json()
    console.log("[v0] Request body:", body)

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
    const sql = `UPDATE foods SET ${updates.join(", ")} WHERE id = ?`
    console.log("[v0] Executing UPDATE:", { sql, args })

    const result = await db.execute({ sql, args })
    console.log("[v0] UPDATE successful, result:", result)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] PATCH /api/foods/[id] - Error caught:")
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : undefined)
    return NextResponse.json(
      {
        error: "Failed to update food",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("[v0] DELETE /api/foods/[id] - Starting request")
    const { id } = await params
    console.log("[v0] Food ID:", id)

    const db = getDbClient()
    console.log("[v0] Executing DELETE for id:", id)

    const result = await db.execute({
      sql: "DELETE FROM foods WHERE id = ?",
      args: [id],
    })
    console.log("[v0] DELETE successful, result:", result)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] DELETE /api/foods/[id] - Error caught:")
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : undefined)
    return NextResponse.json(
      {
        error: "Failed to delete food",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
