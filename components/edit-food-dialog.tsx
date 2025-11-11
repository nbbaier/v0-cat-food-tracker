"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Food } from "@/app/page"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react"

type EditFoodDialogProps = {
  food: Food
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: Partial<Food>) => void
}

export function EditFoodDialog({ food, open, onOpenChange, onSave }: EditFoodDialogProps) {
  const [name, setName] = useState(food.name)
  const [preference, setPreference] = useState(food.preference)
  const [notes, setNotes] = useState(food.notes)
  const [inventoryQuantity, setInventoryQuantity] = useState(food.inventoryQuantity)

  useEffect(() => {
    setName(food.name)
    setPreference(food.preference)
    setNotes(food.notes)
    setInventoryQuantity(food.inventoryQuantity)
  }, [food])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      preference,
      notes: notes.trim(),
      inventoryQuantity,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Food</DialogTitle>
            <DialogDescription>Update the details for this food item.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Food Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Fancy Feast Chicken"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Preference</Label>
              <RadioGroup value={preference} onValueChange={(v) => setPreference(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="likes" id="edit-likes" />
                  <Label htmlFor="edit-likes" className="flex items-center gap-2 font-normal">
                    <ThumbsUp className="size-4 text-success" />
                    Likes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dislikes" id="edit-dislikes" />
                  <Label htmlFor="edit-dislikes" className="flex items-center gap-2 font-normal">
                    <ThumbsDown className="size-4 text-destructive" />
                    Dislikes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unknown" id="edit-unknown" />
                  <Label htmlFor="edit-unknown" className="flex items-center gap-2 font-normal">
                    <HelpCircle className="size-4 text-muted-foreground" />
                    Unknown
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Any observations or details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-inventory">Inventory Quantity</Label>
              <Input
                id="edit-inventory"
                type="number"
                min="0"
                placeholder="0"
                value={inventoryQuantity}
                onChange={(e) => setInventoryQuantity(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
