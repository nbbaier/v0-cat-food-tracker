"use client";

import { Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Meal } from "@/lib/types";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type MealCardProps = {
	meal: Meal;
	onDelete: (id: string) => void;
};

export const MealCard = React.memo(function MealCard({
	meal,
	onDelete,
}: MealCardProps) {
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row justify-between items-start pb-3">
					<div className="space-y-1">
						<CardTitle className="text-base">{meal.food.name}</CardTitle>
						<div className="flex gap-2 items-center">
							<Badge variant="outline" className="capitalize">
								{meal.mealTime}
							</Badge>
							<span className="text-sm text-muted-foreground">
								{meal.amount}
							</span>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsDeleteOpen(true)}
						className="size-8 -mt-1 -mr-2 text-muted-foreground hover:text-destructive"
					>
						<Trash2 className="size-4" />
					</Button>
				</CardHeader>
				{meal.notes && (
					<CardContent className="pt-0">
						<p className="text-sm text-muted-foreground">{meal.notes}</p>
					</CardContent>
				)}
			</Card>
			<ConfirmDialog
				open={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				onConfirm={() => {
					onDelete(meal.id);
					setIsDeleteOpen(false);
				}}
				title="Delete Meal"
				description={`Are you sure you want to delete this meal entry for "${meal.food.name}"? This action cannot be undone.`}
				confirmLabel="Delete"
				variant="destructive"
			/>
		</>
	);
});
