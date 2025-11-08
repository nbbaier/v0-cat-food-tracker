"use client"

import type { Food } from "@/app/page"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, HelpCircle, Trash2, Edit } from "lucide-react"
import { useState } from "react"
import { EditFoodDialog } from "./edit-food-dialog"

type FoodCardProps = {
  food: Food
  onUpdate: (id: string, updates: Partial<Food>) => void
  onDelete: (id: string) => void
}

export function FoodCard({ food, onUpdate, onDelete }: FoodCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const preferenceConfig = {
    likes: {
      icon: ThumbsUp,
      label: "Likes",
      className: "bg-success text-success-foreground",
    },
    dislikes: {
      icon: ThumbsDown,
      label: "Dislikes",
      className: "bg-destructive text-destructive-foreground",
    },
    unknown: {
      icon: HelpCircle,
      label: "Unknown",
      className: "bg-muted text-muted-foreground",
    },
  }

  const config = preferenceConfig[food.preference]
  const PreferenceIcon = config.icon

  const handlePreferenceChange = (preference: Food["preference"]) => {
    onUpdate(food.id, { preference })
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold leading-none tracking-tight">{food.name}</h3>
            <div className="flex items-center gap-1.5 pt-1">
              <Button
                variant={food.preference === "likes" ? "default" : "outline"}
                size="sm"
                className={`h-6 px-2 text-xs ${
                  food.preference === "likes"
                    ? "bg-success hover:bg-success/90 text-success-foreground"
                    : "bg-transparent"
                }`}
                onClick={() => handlePreferenceChange("likes")}
              >
                <ThumbsUp className="mr-1 size-3" />
                Likes
              </Button>
              <Button
                variant={food.preference === "dislikes" ? "default" : "outline"}
                size="sm"
                className={`h-6 px-2 text-xs ${
                  food.preference === "dislikes"
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    : "bg-transparent"
                }`}
                onClick={() => handlePreferenceChange("dislikes")}
              >
                <ThumbsDown className="mr-1 size-3" />
                Dislikes
              </Button>
              <Button
                variant={food.preference === "unknown" ? "default" : "outline"}
                size="sm"
                className={`h-6 px-2 text-xs ${
                  food.preference === "unknown" ? "bg-muted hover:bg-muted/90 text-muted-foreground" : "bg-transparent"
                }`}
                onClick={() => handlePreferenceChange("unknown")}
              >
                <HelpCircle className="mr-1 size-3" />
                Unknown
              </Button>
              {food.inStock && (
                <Badge variant="outline" className="text-xs ml-1">
                  In Stock
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
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
