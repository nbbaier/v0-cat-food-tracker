"use client"

import type { Food } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, HelpCircle, Trash2 } from "lucide-react"
import { EditFoodDialog } from "./edit-food-dialog"
import { useState } from "react"

type FoodTableProps = {
  foods: Food[]
  onUpdate: (id: string, updates: Partial<Food>) => void
  onDelete: (id: string) => void
}

export function FoodTable({ foods, onUpdate, onDelete }: FoodTableProps) {
  const [editingFood, setEditingFood] = useState<Food | null>(null)

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Preference</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Inventory</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Notes</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <button onClick={() => setEditingFood(food)} className="font-medium text-left hover:underline">
                    {food.name}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      variant={food.preference === "likes" ? "default" : "outline"}
                      size="sm"
                      className="size-8 p-0"
                      onClick={() => onUpdate(food.id, { preference: "likes" })}
                      title="Likes"
                    >
                      <ThumbsUp className="size-4" />
                    </Button>
                    <Button
                      variant={food.preference === "dislikes" ? "destructive" : "outline"}
                      size="sm"
                      className="size-8 p-0"
                      onClick={() => onUpdate(food.id, { preference: "dislikes" })}
                      title="Dislikes"
                    >
                      <ThumbsDown className="size-4" />
                    </Button>
                    <Button
                      variant={food.preference === "unknown" ? "secondary" : "outline"}
                      size="sm"
                      className="size-8 p-0"
                      onClick={() => onUpdate(food.id, { preference: "unknown" })}
                      title="Unknown"
                    >
                      <HelpCircle className="size-4" />
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={food.inventoryQuantity > 0 ? "default" : "secondary"}>
                    {food.inventoryQuantity > 0 ? `${food.inventoryQuantity} in stock` : "Out of stock"}
                  </Badge>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm text-muted-foreground truncate">{food.notes || "—"}</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => onDelete(food.id)} title="Delete food">
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingFood && (
        <EditFoodDialog
          food={editingFood}
          open={!!editingFood}
          onOpenChange={(open) => !open && setEditingFood(null)}
          onSave={(updates) => {
            onUpdate(editingFood.id, updates)
            setEditingFood(null)
          }}
        />
      )}
    </>
  )
}
