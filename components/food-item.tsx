"use client";

import {
	Edit,
	HelpCircle,
	MessageSquare,
	Package,
	TestTube,
	ThumbsDown,
	ThumbsUp,
	Trash2,
	Utensils,
} from "lucide-react";
import { useState } from "react";
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
import { EditFoodDialog } from "./edit-food-dialog";

type FoodItemProps = {
	food: Food;
	onUpdate: (id: string, updates: Partial<Food>) => void;
	onDelete: (id: string) => void;
};

export function FoodItem({ food, onUpdate, onDelete }: FoodItemProps) {
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

	const getPreferenceIcon = () => {
		switch (food.preference) {
			case "likes":
				return <ThumbsUp className="size-4 text-success" />;
			case "dislikes":
				return <ThumbsDown className="size-4 text-destructive" />;
			case "unknown":
				return <HelpCircle className="size-4 text-muted-foreground" />;
		}
	};

	return (
		<>
			<Item>
				<ItemIcon
					className="cursor-pointer hover:bg-accent rounded-sm transition-colors"
					onClick={cyclePreference}
					title="Click to cycle preference"
				>
					{getPreferenceIcon()}
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
						{food.phosphorusDmb !== undefined && food.phosphorusDmb > 0 && (
							<span className="flex items-center gap-1">
								<TestTube className="size-3" />
								P: {food.phosphorusDmb}%
							</span>
						)}
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
}
