"use client";

import { Edit, MessageSquare, Package, Trash2, Utensils } from "lucide-react";
import React, { useState } from "react";
import { EditFoodDialog } from "@/components/foods/edit-food-dialog";
import { NutritionDisplay } from "@/components/shared/nutrition-display";
import {
	getPreferenceColor,
	PreferenceIcon,
} from "@/components/shared/preference-icon";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemAction,
	ItemContent,
	ItemDescription,
	ItemIcon,
	ItemTitle,
} from "@/components/ui/item";
import type { Food } from "@/lib/types";

type FoodItemProps = {
	food: Food;
	onUpdate: (id: string, updates: Partial<Food>) => void;
	onDelete: (id: string) => void;
};

export const FoodItem = React.memo(function FoodItem({
	food,
	onUpdate,
	onDelete,
}: FoodItemProps) {
	const [isEditOpen, setIsEditOpen] = useState(false);

	const cyclePreference = () => {
		const preferenceOrder: Food["preference"][] = [
			"likes",
			"dislikes",
			"unknown",
		];
		const currentIndex = preferenceOrder.indexOf(food.preference);
		const nextIndex = (currentIndex + 1) % preferenceOrder.length;
		const nextPreference = preferenceOrder[nextIndex];
		onUpdate(food.id, { preference: nextPreference });
	};

	return (
		<>
			<Item>
				<ItemIcon
					className="cursor-pointer hover:bg-accent rounded-sm transition-colors"
					onClick={cyclePreference}
					title="Click to cycle preference"
				>
					<PreferenceIcon
						preference={food.preference}
						className={`size-4 ${getPreferenceColor(food.preference)}`}
					/>
				</ItemIcon>
				<ItemContent>
					<ItemTitle>{food.name}</ItemTitle>
					<ItemDescription className="flex items-center gap-3 mt-1 flex-wrap">
						<span className="flex items-center gap-1">
							<Package className="size-3" />
							{food.inventoryQuantity > 0
								? `${food.inventoryQuantity} in stock`
								: "Out of stock"}
						</span>
						<NutritionDisplay food={food} variant="compact" />
						{food.mealCount !== undefined && food.mealCount > 0 && (
							<span className="flex items-center gap-1">
								<Utensils className="size-3" />
								{food.mealCount} meal{food.mealCount !== 1 ? "s" : ""}
							</span>
						)}
						{food.mealCommentCount !== undefined &&
							food.mealCommentCount > 0 && (
								<span className="flex items-center gap-1">
									<MessageSquare className="size-3" />
									{food.mealCommentCount} comment
									{food.mealCommentCount !== 1 ? "s" : ""}
								</span>
							)}
					</ItemDescription>
				</ItemContent>
				<ItemAction>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => setIsEditOpen(true)}
						title="Edit food"
					>
						<Edit className="size-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => onDelete(food.id)}
						title="Delete food"
						className="text-destructive hover:text-destructive"
					>
						<Trash2 className="size-4" />
					</Button>
				</ItemAction>
			</Item>

			<EditFoodDialog
				food={food}
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
				onSave={(updates) => {
					onUpdate(food.id, updates);
					setIsEditOpen(false);
				}}
			/>
		</>
	);
});
