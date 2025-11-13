"use client";

import { FoodForm } from "@/components/foods/food-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { FoodInput } from "@/lib/types";

type AddFoodDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAdd: (food: FoodInput) => void;
};

export function AddFoodDialog({
	open,
	onOpenChange,
	onAdd,
}: AddFoodDialogProps) {
	const handleSubmit = (data: FoodInput) => {
		onAdd(data);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add New Food</DialogTitle>
					<DialogDescription>
						Add a new food item to track your cat&apos;s preferences and
						inventory.
					</DialogDescription>
				</DialogHeader>
				<FoodForm
					onSubmit={handleSubmit}
					onCancel={() => onOpenChange(false)}
					submitLabel="Add Food"
				/>
			</DialogContent>
		</Dialog>
	);
}
