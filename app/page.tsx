"use client"

import { useState, useEffect } from "react"
import { FoodList } from "@/components/food-list"
import { AddFoodDialog } from "@/components/add-food-dialog"
import { Button } from "@/components/ui/button"
import { Plus, LayoutGrid, Table } from "lucide-react"

export type Food = {
  id: string
  name: string
  preference: "likes" | "dislikes" | "unknown"
  notes: string
  inStock: boolean
  addedAt: number
}

export default function Page() {
  const [foods, setFoods] = useState<Food[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFoods()
  }, [])

  const fetchFoods = async () => {
    try {
      console.log("[v0] fetchFoods - Starting fetch from /api/foods")
      const response = await fetch("/api/foods")
      console.log("[v0] fetchFoods - Response received:", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] fetchFoods - Data parsed successfully:", { count: data.length })
        setFoods(data)
      } else {
        const errorText = await response.text()
        console.error("[v0] fetchFoods - Failed with status:", response.status)
        console.error("[v0] fetchFoods - Error response body:", errorText)
      }
    } catch (error) {
      console.error("[v0] fetchFoods - Exception caught:")
      console.error("[v0] fetchFoods - Error type:", error?.constructor?.name)
      console.error("[v0] fetchFoods - Error message:", error instanceof Error ? error.message : String(error))
      console.error("[v0] fetchFoods - Error stack:", error instanceof Error ? error.stack : undefined)
      console.error("[v0] fetchFoods - Full error object:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFood = async (food: Omit<Food, "id" | "addedAt">) => {
    try {
      const response = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(food),
      })

      if (response.ok) {
        const newFood = await response.json()
        setFoods((prev) => [newFood, ...prev])
        setIsAddDialogOpen(false)
      } else {
        console.error("[v0] Failed to add food:", response.statusText)
      }
    } catch (error) {
      console.error("[v0] Error adding food:", error)
    }
  }

  const handleUpdateFood = async (id: string, updates: Partial<Food>) => {
    try {
      const response = await fetch(`/api/foods/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        setFoods((prev) => prev.map((food) => (food.id === id ? { ...food, ...updates } : food)))
      } else {
        console.error("[v0] Failed to update food:", response.statusText)
      }
    } catch (error) {
      console.error("[v0] Error updating food:", error)
    }
  }

  const handleDeleteFood = async (id: string) => {
    try {
      const response = await fetch(`/api/foods/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFoods((prev) => prev.filter((food) => food.id !== id))
      } else {
        console.error("[v0] Failed to delete food:", response.statusText)
      }
    } catch (error) {
      console.error("[v0] Error deleting food:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-balance">Cat Food Tracker</h1>
              <p className="mt-1 text-sm text-muted-foreground">Track your cat&apos;s food preferences and inventory</p>
            </div>
            <div className="flex gap-2">
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === "cards" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="rounded-r-none"
                >
                  <LayoutGrid className="size-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-l-none border-l"
                >
                  <Table className="size-4" />
                </Button>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} size="default">
                <Plus className="mr-2 size-4" />
                Add Food
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <FoodList foods={foods} onUpdate={handleUpdateFood} onDelete={handleDeleteFood} viewMode={viewMode} />
      </main>

      <AddFoodDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={handleAddFood} />
    </div>
  )
}
