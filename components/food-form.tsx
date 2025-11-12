"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PreferenceRadioGroup } from "@/components/preference-radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Food, FoodInput } from "@/lib/types";

type FoodFormProps = {
	initialValues?: Partial<Food>;
	onSubmit: (data: FoodInput) => void;
	onCancel: () => void;
	submitLabel?: string;
	isEdit?: boolean;
};

export function FoodForm({
	initialValues,
	onSubmit,
	onCancel,
	submitLabel = "Add Food",
	isEdit = false,
}: FoodFormProps) {
	const [name, setName] = useState(initialValues?.name || "");
	const [preference, setPreference] = useState<
		"likes" | "dislikes" | "unknown"
	>(initialValues?.preference || "unknown");
	const [notes, setNotes] = useState(initialValues?.notes || "");
	const [inventoryQuantity, setInventoryQuantity] = useState(
		initialValues?.inventoryQuantity || 0,
	);
	const [phosphorusDmb, setPhosphorusDmb] = useState<number | undefined>(
		initialValues?.phosphorusDmb,
	);
	const [proteinDmb, setProteinDmb] = useState<number | undefined>(
		initialValues?.proteinDmb,
	);
	const [fatDmb, setFatDmb] = useState<number | undefined>(
		initialValues?.fatDmb,
	);
	const [fiberDmb, setFiberDmb] = useState<number | undefined>(
		initialValues?.fiberDmb,
	);

	// Update form when initialValues change (for edit dialog)
	useEffect(() => {
		if (isEdit && initialValues) {
			setName(initialValues.name || "");
			setPreference(initialValues.preference || "unknown");
			setNotes(initialValues.notes || "");
			setInventoryQuantity(initialValues.inventoryQuantity || 0);
			setPhosphorusDmb(initialValues.phosphorusDmb);
			setProteinDmb(initialValues.proteinDmb);
			setFatDmb(initialValues.fatDmb);
			setFiberDmb(initialValues.fiberDmb);
		}
	}, [initialValues, isEdit]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		// Validate nutrition percentages
		if (
			phosphorusDmb !== undefined &&
			(phosphorusDmb < 0 || phosphorusDmb > 100)
		) {
			toast.error("Phosphorus must be between 0 and 100%");
			return;
		}
		if (proteinDmb !== undefined && (proteinDmb < 0 || proteinDmb > 100)) {
			toast.error("Protein must be between 0 and 100%");
			return;
		}
		if (fatDmb !== undefined && (fatDmb < 0 || fatDmb > 100)) {
			toast.error("Fat must be between 0 and 100%");
			return;
		}
		if (fiberDmb !== undefined && (fiberDmb < 0 || fiberDmb > 100)) {
			toast.error("Fiber must be between 0 and 100%");
			return;
		}

		onSubmit({
			name: name.trim(),
			preference,
			notes: notes.trim(),
			inventoryQuantity,
			phosphorusDmb,
			proteinDmb,
			fatDmb,
			fiberDmb,
		});

		// Reset form only if it's not an edit
		if (!isEdit) {
			setName("");
			setPreference("unknown");
			setNotes("");
			setInventoryQuantity(0);
			setPhosphorusDmb(undefined);
			setProteinDmb(undefined);
			setFatDmb(undefined);
			setFiberDmb(undefined);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="space-y-6 py-4">
				<div className="space-y-2">
					<Label htmlFor="name">Food Name</Label>
					<Input
						id="name"
						placeholder="e.g., Fancy Feast Chicken"
						value={name}
						onChange={(e) => setName(e.target.value)}
						autoFocus={!isEdit}
					/>
				</div>

				<div className="space-y-3">
					<Label>Preference</Label>
					<PreferenceRadioGroup
						value={preference}
						onValueChange={setPreference}
						idPrefix={isEdit ? "edit-" : ""}
					/>
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

				<div className="space-y-3">
					<Label className="text-base font-semibold">
						Nutrition (Dry Matter Basis, %)
					</Label>
					<div className="gap-3 grid grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="phosphorus" className="text-sm font-normal">
								Phosphorus
							</Label>
							<Input
								id="phosphorus"
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
							<Label htmlFor="protein" className="text-sm font-normal">
								Protein
							</Label>
							<Input
								id="protein"
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
							<Label htmlFor="fat" className="text-sm font-normal">
								Fat
							</Label>
							<Input
								id="fat"
								type="number"
								min="0"
								max="100"
								step="0.01"
								placeholder="e.g., 20.0"
								value={fatDmb ?? ""}
								onChange={(e) =>
									setFatDmb(e.target.value ? Number(e.target.value) : undefined)
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="fiber" className="text-sm font-normal">
								Fiber
							</Label>
							<Input
								id="fiber"
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

			<div className="flex gap-2 justify-end">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={!name.trim()}>
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
