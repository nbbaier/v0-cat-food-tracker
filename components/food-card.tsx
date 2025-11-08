"use client"

import type { Food } from "@/app/page"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, HelpCircle, Trash2, Edit, Package } from "lucide-react"
import { useState } from "react"
import { EditFoodDialog } from "./edit-food-dialog"

type FoodCardProps = {
  food: Food
  onUpdate: (id: string, updates: Partial<Food>) => void
  onDelete: (id: string) => void
}

export function FoodCard({ food, onUpdate, onDelete }: FoodCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handlePreferenceChange = (preference: Food["preference"]) => {
    onUpdate(food.id, { preference })
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex-row items-start align-middle justify-between space-y-0 pb-4">
          <h3 className="font-semibold text-lg leading-none tracking-tight flex items-center">{food.name}</h3>
          <div className="flex items-center gap-1">
            <Button
              variant={food.preference === "likes" ? "default" : "outline"}
              size="sm"
              className={`size-8 p-0 ${
                food.preference === "likes"
                  ? "bg-success hover:bg-success/90 text-success-foreground"
                  : "bg-transparent"
              }`}
              onClick={() => handlePreferenceChange("likes")}
              title="Likes"
            >
              <ThumbsUp className="size-4" />
            </Button>
            <Button
              variant={food.preference === "dislikes" ? "default" : "outline"}
              size="sm"
              className={`size-8 p-0 ${
                food.preference === "dislikes"
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "bg-transparent"
              }`}
              onClick={() => handlePreferenceChange("dislikes")}
              title="Dislikes"
            >
              <ThumbsDown className="size-4" />
            </Button>
            <Button
              variant={food.preference === "unknown" ? "default" : "outline"}
              size="sm"
              className={`size-8 p-0 ${
                food.preference === "unknown" ? "bg-muted hover:bg-muted/90 text-muted-foreground" : "bg-transparent"
              }`}
              onClick={() => handlePreferenceChange("unknown")}
              title="Unknown"
            >
              <HelpCircle className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-3 pb-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Package className="size-3.5" />
            <span>{food.inventoryQuantity > 0 ? `${food.inventoryQuantity} in stock` : "Out of stock"}</span>
          </div>
          {food.notes ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{food.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No notes</p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-1 size-3" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            onClick={() => onDelete(food.id)}
          >
            <Trash2 className="size-3" />
          </Button>
        </CardFooter>
      </Card>

      <EditFoodDialog
        food={food}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={(updates) => {
          onUpdate(food.id, updates)
          setIsEditOpen(false)
        }}
      />
    </>
  )
}
