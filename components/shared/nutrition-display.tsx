"use client";

import { TestTube } from "lucide-react";
import type { Food } from "@/lib/types";

type NutritionDisplayProps = {
	food: Pick<Food, "phosphorusDmb" | "proteinDmb" | "fatDmb" | "fiberDmb">;
	variant?: "card" | "compact" | "table";
};

export function NutritionDisplay({
	food,
	variant = "card",
}: NutritionDisplayProps) {
	const hasNutrition =
		(food.phosphorusDmb && food.phosphorusDmb > 0) ||
		(food.proteinDmb && food.proteinDmb > 0) ||
		(food.fatDmb && food.fatDmb > 0) ||
		(food.fiberDmb && food.fiberDmb > 0);

	if (!hasNutrition) {
		return variant === "table" ? (
			<span className="text-sm text-muted-foreground">—</span>
		) : null;
	}

	if (variant === "compact") {
		return (
			<span className="flex items-center gap-1 text-xs text-muted-foreground">
				<TestTube className="size-3" />
				{food.phosphorusDmb && food.phosphorusDmb > 0 && (
					<span>P: {food.phosphorusDmb}%</span>
				)}
			</span>
		);
	}

	if (variant === "table") {
		return (
			<div className="space-y-0.5 text-xs text-muted-foreground">
				{food.phosphorusDmb && food.phosphorusDmb > 0 && (
					<div>P: {food.phosphorusDmb}%</div>
				)}
				{food.proteinDmb && food.proteinDmb > 0 && (
					<div>Protein: {food.proteinDmb}%</div>
				)}
				{food.fatDmb && food.fatDmb > 0 && <div>Fat: {food.fatDmb}%</div>}
				{food.fiberDmb && food.fiberDmb > 0 && (
					<div>Fiber: {food.fiberDmb}%</div>
				)}
			</div>
		);
	}

	return (
		<div className="pt-2 space-y-1 text-xs text-muted-foreground border-t">
			<p className="flex items-center gap-1.5 font-semibold">
				<TestTube className="size-3.5" />
				Nutrition (DMB):
			</p>
			<div className="gap-x-3 gap-y-0.5 grid grid-cols-2">
				{food.phosphorusDmb && food.phosphorusDmb > 0 && (
					<span>Phosphorus: {food.phosphorusDmb}%</span>
				)}
				{food.proteinDmb && food.proteinDmb > 0 && (
					<span>Protein: {food.proteinDmb}%</span>
				)}
				{food.fatDmb && food.fatDmb > 0 && <span>Fat: {food.fatDmb}%</span>}
				{food.fiberDmb && food.fiberDmb > 0 && (
					<span>Fiber: {food.fiberDmb}%</span>
				)}
			</div>
		</div>
	);
}
