"use client";

import { FoodForm } from "@/components/food-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Food, FoodUpdate } from "@/lib/types";

type EditFoodDialogProps = {
	food: Food;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (updates: FoodUpdate) => void;
};

export function EditFoodDialog({
	food,
	open,
	onOpenChange,
	onSave,
}: EditFoodDialogProps) {
	const handleSubmit = (data: FoodUpdate) => {
		onSave(data);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Food</DialogTitle>
					<DialogDescription>
						Update the details for this food item.
					</DialogDescription>
				</DialogHeader>
				<FoodForm
					initialValues={food}
					onSubmit={handleSubmit}
					onCancel={() => onOpenChange(false)}
					submitLabel="Save Changes"
					isEdit
				/>
			</DialogContent>
		</Dialog>
	);
}
