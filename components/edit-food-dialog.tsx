"use client";

import { HelpCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
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

type EditFoodDialogProps = {
	food: Food;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (updates: Partial<Food>) => void;
};

export function EditFoodDialog({
	food,
	open,
	onOpenChange,
	onSave,
}: EditFoodDialogProps) {
	const [name, setName] = useState(food.name);
	const [preference, setPreference] = useState(food.preference);
	const [notes, setNotes] = useState(food.notes);
	const [inventoryQuantity, setInventoryQuantity] = useState(
		food.inventoryQuantity,
	);
	const [phosphorusDmb, setPhosphorusDmb] = useState<number | undefined>(
		food.phosphorusDmb,
	);
	const [proteinDmb, setProteinDmb] = useState<number | undefined>(
		food.proteinDmb,
	);
	const [fatDmb, setFatDmb] = useState<number | undefined>(food.fatDmb);
	const [fiberDmb, setFiberDmb] = useState<number | undefined>(food.fiberDmb);

	useEffect(() => {
		setName(food.name);
		setPreference(food.preference);
		setNotes(food.notes);
		setInventoryQuantity(food.inventoryQuantity);
		setPhosphorusDmb(food.phosphorusDmb);
		setProteinDmb(food.proteinDmb);
		setFatDmb(food.fatDmb);
		setFiberDmb(food.fiberDmb);
	}, [food]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		onSave({
			name: name.trim(),
			preference,
			notes: notes.trim(),
			inventoryQuantity,
			phosphorusDmb,
			proteinDmb,
			fatDmb,
			fiberDmb,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Edit Food</DialogTitle>
						<DialogDescription>
							Update the details for this food item.
						</DialogDescription>
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
							<RadioGroup
								value={preference}
								onValueChange={(v) => setPreference(v as any)}
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="likes" id="edit-likes" />
									<Label
										htmlFor="edit-likes"
										className="flex items-center gap-2 font-normal"
									>
										<ThumbsUp className="size-4 text-success" />
										Likes
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="dislikes" id="edit-dislikes" />
									<Label
										htmlFor="edit-dislikes"
										className="flex items-center gap-2 font-normal"
									>
										<ThumbsDown className="size-4 text-destructive" />
										Dislikes
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="unknown" id="edit-unknown" />
									<Label
										htmlFor="edit-unknown"
										className="flex items-center gap-2 font-normal"
									>
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

						<div className="space-y-3">
							<Label className="text-base font-semibold">
								Nutrition (Dry Matter Basis, %)
							</Label>
							<div className="gap-3 grid grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="edit-phosphorus" className="text-sm font-normal">
										Phosphorus
									</Label>
									<Input
										id="edit-phosphorus"
										type="number"
										min="0"
										max="100"
										step="0.01"
										placeholder="e.g., 1.2"
										value={phosphorusDmb ?? ""}
										onChange={(e) =>
											setPhosphorusDmb(
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-protein" className="text-sm font-normal">
										Protein
									</Label>
									<Input
										id="edit-protein"
										type="number"
										min="0"
										max="100"
										step="0.01"
										placeholder="e.g., 45.5"
										value={proteinDmb ?? ""}
										onChange={(e) =>
											setProteinDmb(
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-fat" className="text-sm font-normal">
										Fat
									</Label>
									<Input
										id="edit-fat"
										type="number"
										min="0"
										max="100"
										step="0.01"
										placeholder="e.g., 20.0"
										value={fatDmb ?? ""}
										onChange={(e) =>
											setFatDmb(
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-fiber" className="text-sm font-normal">
										Fiber
									</Label>
									<Input
										id="edit-fiber"
										type="number"
										min="0"
										max="100"
										step="0.01"
										placeholder="e.g., 3.5"
										value={fiberDmb ?? ""}
										onChange={(e) =>
											setFiberDmb(
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
									/>
								</div>
							</div>
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
							Save Changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
