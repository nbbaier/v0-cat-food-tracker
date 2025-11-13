"use client";

import type { Food } from "@/lib/types";
import { FoodCard } from "@/components/foods/food-card";
import { FoodItem } from "@/components/foods/food-item";

type FoodListProps = {
	foods: Food[];
	onUpdate: (id: string, updates: Partial<Food>) => void;
	onDelete: (id: string) => void;
	viewMode: "compact" | "full";
};

export function FoodList({
	foods,
	onUpdate,
	onDelete,
	viewMode,
}: FoodListProps) {
	if (foods.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
				<div className="mx-auto max-w-md">
					<h3 className="text-lg font-semibold">No foods tracked yet</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						Start tracking your cat&apos;s food preferences by adding their
						first food item.
					</p>
				</div>
			</div>
		);
	}

	if (viewMode === "compact") {
		return (
			<div className="space-y-2">
				{foods.map((food) => (
					<FoodItem
						key={food.id}
						food={food}
						onUpdate={onUpdate}
						onDelete={onDelete}
					/>
				))}
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{foods.map((food) => (
				<FoodCard
					key={food.id}
					food={food}
					onUpdate={onUpdate}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
}
