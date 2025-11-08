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
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px]">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-3 py-2 text-left text-xs font-semibold sm:px-4 sm:py-3 sm:text-sm">Name</th>
              <th className="px-3 py-2 text-left text-xs font-semibold sm:px-4 sm:py-3 sm:text-sm">Preference</th>
              <th className="px-3 py-2 text-left text-xs font-semibold sm:px-4 sm:py-3 sm:text-sm">Inventory</th>
              <th className="hidden px-3 py-2 text-left text-xs font-semibold sm:table-cell sm:px-4 sm:py-3 sm:text-sm">
                Notes
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold sm:px-4 sm:py-3 sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2 sm:px-4 sm:py-3">
                  <button
                    onClick={() => setEditingFood(food)}
                    className="font-medium text-left text-sm hover:underline sm:text-base"
                  >
                    {food.name}
                  </button>
                </td>
                <td className="px-3 py-2 sm:px-4 sm:py-3">
                  <div className="flex gap-0.5 sm:gap-1">
                    <Button
                      variant={food.preference === "likes" ? "default" : "outline"}
                      size="sm"
                      className="size-7 p-0 sm:size-8"
                      onClick={() => onUpdate(food.id, { preference: "likes" })}
                      title="Likes"
                    >
                      <ThumbsUp className="size-3 sm:size-4" />
                    </Button>
                    <Button
                      variant={food.preference === "dislikes" ? "destructive" : "outline"}
                      size="sm"
                      className="size-7 p-0 sm:size-8"
                      onClick={() => onUpdate(food.id, { preference: "dislikes" })}
                      title="Dislikes"
                    >
                      <ThumbsDown className="size-3 sm:size-4" />
                    </Button>
                    <Button
                      variant={food.preference === "unknown" ? "secondary" : "outline"}
                      size="sm"
                      className="size-7 p-0 sm:size-8"
                      onClick={() => onUpdate(food.id, { preference: "unknown" })}
                      title="Unknown"
                    >
                      <HelpCircle className="size-3 sm:size-4" />
                    </Button>
                  </div>
                </td>
                <td className="px-3 py-2 sm:px-4 sm:py-3">
                  <Badge variant={food.inventoryQuantity > 0 ? "default" : "secondary"} className="text-xs">
                    {food.inventoryQuantity > 0 ? `${food.inventoryQuantity} in stock` : "Out"}
                  </Badge>
                </td>
                <td className="hidden px-3 py-2 max-w-xs sm:table-cell sm:px-4 sm:py-3">
                  <p className="text-sm text-muted-foreground truncate">{food.notes || "—"}</p>
                </td>
                <td className="px-3 py-2 text-right sm:px-4 sm:py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(food.id)}
                    title="Delete food"
                    className="size-7 p-0 sm:size-auto sm:p-2"
                  >
                    <Trash2 className="size-3.5 sm:size-4" />
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
