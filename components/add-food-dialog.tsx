"use client";

import { HelpCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { Food } from "@/app/page";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

type AddFoodDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAdd: (food: Omit<Food, "id" | "addedAt">) => void;
};

export function AddFoodDialog({
	open,
	onOpenChange,
	onAdd,
}: AddFoodDialogProps) {
	const [name, setName] = useState("");
	const [preference, setPreference] = useState<
		"likes" | "dislikes" | "unknown"
	>("unknown");
	const [notes, setNotes] = useState("");
	const [inventoryQuantity, setInventoryQuantity] = useState(0);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		onAdd({
			name: name.trim(),
			preference,
			notes: notes.trim(),
			inventoryQuantity,
		});

		// Reset form
		setName("");
		setPreference("unknown");
		setNotes("");
		setInventoryQuantity(0);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Add New Food</DialogTitle>
						<DialogDescription>
							Add a new food item to track your cat&apos;s preferences and
							inventory.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">Food Name</Label>
							<Input
								id="name"
								placeholder="e.g., Fancy Feast Chicken"
								value={name}
								onChange={(e) => setName(e.target.value)}
								autoFocus
							/>
						</div>

						<div className="space-y-3">
							<Label>Preference</Label>
							<RadioGroup
								value={preference}
								onValueChange={(v) => setPreference(v as any)}
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="likes" id="likes" />
									<Label
										htmlFor="likes"
										className="flex items-center gap-2 font-normal"
									>
										<ThumbsUp className="size-4 text-success" />
										Likes
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="dislikes" id="dislikes" />
									<Label
										htmlFor="dislikes"
										className="flex items-center gap-2 font-normal"
									>
										<ThumbsDown className="size-4 text-destructive" />
										Dislikes
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="unknown" id="unknown" />
									<Label
										htmlFor="unknown"
										className="flex items-center gap-2 font-normal"
									>
										<HelpCircle className="size-4 text-muted-foreground" />
										Unknown
									</Label>
								</div>
							</RadioGroup>
						</div>

						<div className="space-y-2">
							<Label htmlFor="notes">Notes</Label>
							<Textarea
								id="notes"
								placeholder="Any observations or details..."
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								rows={3}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="inventory">Inventory Quantity</Label>
							<Input
								id="inventory"
								type="number"
								min="0"
								placeholder="0"
								value={inventoryQuantity}
								onChange={(e) => setInventoryQuantity(Number(e.target.value))}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!name.trim()}>
							Add Food
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
