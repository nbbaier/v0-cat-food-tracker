"use client";

import { Edit, MessageSquare, Package, Trash2, Utensils } from "lucide-react";
import React, { useState } from "react";
import { NutritionDisplay } from "@/components/nutrition-display";
import { PreferenceIcon } from "@/components/preference-icon";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import type { Food } from "@/lib/types";
import { EditFoodDialog } from "./edit-food-dialog";

type FoodCardProps = {
	food: Food;
	onUpdate: (id: string, updates: Partial<Food>) => void;
	onDelete: (id: string) => void;
};

export const FoodCard = React.memo(function FoodCard({
	food,
	onUpdate,
	onDelete,
}: FoodCardProps) {
	const [isEditOpen, setIsEditOpen] = useState(false);

	const handlePreferenceChange = (preference: Food["preference"]) => {
		onUpdate(food.id, { preference });
	};

	return (
		<>
			<Card className="gap-5">
				<CardHeader className="flex flex-row justify-between items-center space-y-0">
					<h3 className="text-base font-semibold tracking-tight leading-none sm:text-lg">
						{food.name}
					</h3>
					<div className="flex gap-0.5 items-center sm:gap-1">
						<Button
							variant={food.preference === "likes" ? "default" : "outline"}
							size="icon-sm"
							className={`${
								food.preference === "likes"
									? "bg-success hover:bg-success/90 text-success-foreground"
									: "bg-transparent"
							}`}
							onClick={() => handlePreferenceChange("likes")}
							title="Likes"
						>
							<PreferenceIcon
								preference="likes"
								className="size-3.5 sm:size-4"
							/>
						</Button>
						<Button
							variant={food.preference === "dislikes" ? "default" : "outline"}
							size="icon-sm"
							className={`${
								food.preference === "dislikes"
									? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
									: "bg-transparent"
							}`}
							onClick={() => handlePreferenceChange("dislikes")}
							title="Dislikes"
						>
							<PreferenceIcon
								preference="dislikes"
								className="size-3.5 sm:size-4"
							/>
						</Button>
						<Button
							variant={food.preference === "unknown" ? "default" : "outline"}
							size="icon-sm"
							className={` ${
								food.preference === "unknown"
									? "bg-muted hover:bg-muted/90 text-muted-foreground"
									: "bg-transparent"
							}`}
							onClick={() => handlePreferenceChange("unknown")}
							title="Unknown"
						>
							<PreferenceIcon
								preference="unknown"
								className="size-3.5 sm:size-4"
							/>
						</Button>
					</div>
				</CardHeader>
				<CardContent className="flex-1 space-y-3">
					<div className="flex flex-wrap gap-2">
						<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
							<Package className="size-3.5" />
							<span>
								{food.inventoryQuantity > 0
									? `${food.inventoryQuantity} in stock`
									: "Out of stock"}
							</span>
						</div>
						{food.mealCount !== undefined && food.mealCount > 0 && (
							<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
								<Utensils className="size-3.5" />
								<span>
									{food.mealCount} meal{food.mealCount !== 1 ? "s" : ""}
								</span>
							</div>
						)}
						{food.mealCommentCount !== undefined &&
							food.mealCommentCount > 0 && (
								<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
									<MessageSquare className="size-3.5" />
									<span>
										{food.mealCommentCount} comment
										{food.mealCommentCount !== 1 ? "s" : ""}
									</span>
								</div>
							)}
					</div>
					{food.notes ? (
						<p className="text-sm leading-relaxed text-muted-foreground">
							{food.notes}
						</p>
					) : (
						<p className="text-sm italic text-muted-foreground">No notes</p>
					)}
					<NutritionDisplay food={food} variant="card" />
				</CardContent>
				<CardFooter className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="flex-1 bg-transparent"
						onClick={() => setIsEditOpen(true)}
					>
						<Edit className="mr-1 size-3" />
						Edit
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
					onUpdate(food.id, updates);
					setIsEditOpen(false);
				}}
			/>
		</>
	);
});
