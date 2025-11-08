"use client"

import { LayoutGrid, Plus, Table } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { AddFoodDialog } from "@/components/add-food-dialog"
import { FoodList } from "@/components/food-list"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

export type Food = {
  id: string
  name: string
  preference: "likes" | "dislikes" | "unknown"
  notes: string
  inventoryQuantity: number
  addedAt: number
}

export default function Page() {
  const [foods, setFoods] = useState<Food[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [isLoading, setIsLoading] = useState(true)

  const fetchFoods = useCallback(async () => {
    try {
      const response = await fetch("/api/foods")

      if (response.ok) {
        const data = await response.json()
        setFoods(data)
      } else {
        console.error("Failed to fetch foods")
      }
    } catch (error) {
      console.error("Error fetching foods:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFoods()
  }, [fetchFoods])

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
        console.error("Failed to add food")
      }
    } catch (error) {
      console.error("Error adding food:", error)
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
        console.error("Failed to update food")
      }
    } catch (error) {
      console.error("Error updating food:", error)
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
        console.error("Failed to delete food")
      }
    } catch (error) {
      console.error("Error deleting food:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="px-4 py-4 mx-auto max-w-5xl sm:px-6 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">Cat Food Tracker</h1>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Track your cat&apos;s food preferences and inventory
              </p>
            </div>
            <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
              <ButtonGroup className="flex-shrink-0">
                <Button
                  variant={viewMode === "cards" ? "outline" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("cards")}
                  className={viewMode === "cards" ? "bg-accent" : ""}
                >
                  <LayoutGrid className="size-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "outline" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                  className={viewMode === "table" ? "bg-accent" : ""}
                >
                  <Table className="size-4" />
                </Button>
              </ButtonGroup>
              <ButtonGroup className="flex-shrink-0">
                <ThemeToggle />
              </ButtonGroup>
              <ButtonGroup className="flex-1 sm:flex-initial">
                <Button onClick={() => setIsAddDialogOpen(true)} size="default" className="w-full sm:w-auto">
                  <Plus className="size-4" />
                  Add Food
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 mx-auto max-w-5xl sm:px-6 sm:py-8 lg:px-8">
        <FoodList foods={foods} onUpdate={handleUpdateFood} onDelete={handleDeleteFood} viewMode={viewMode} />
      </main>

      <AddFoodDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={handleAddFood} />
    </div>
  )
}
