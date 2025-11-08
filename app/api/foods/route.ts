import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: foods, error } = await supabase.from("foods").select("*").order("created_at", { ascending: false })

    if (error) throw error

    // Map Supabase response to match frontend expectations
    const formattedFoods = foods.map((food) => ({
      id: food.id,
      name: food.name,
      preference: food.preference,
      notes: food.notes || "",
      inStock: food.in_stock,
      addedAt: new Date(food.created_at).getTime(),
    }))

    return NextResponse.json(formattedFoods)
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

    const supabase = await createClient()
    const { data: food, error } = await supabase
      .from("foods")
      .insert({
        name,
        preference,
        notes: notes || "",
        in_stock: inStock,
      })
      .select()
      .single()

    if (error) throw error

    // Format response to match frontend expectations
    const newFood = {
      id: food.id,
      name: food.name,
      preference: food.preference,
      notes: food.notes || "",
      inStock: food.in_stock,
      addedAt: new Date(food.created_at).getTime(),
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
