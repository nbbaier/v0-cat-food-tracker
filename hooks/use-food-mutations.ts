"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";
import type { FoodInput } from "@/lib/types";
import { invalidateFoodSummariesCache } from "./use-food-summaries";

export function useFoodMutations() {
	const addFood = useCallback(async (food: FoodInput): Promise<boolean> => {
		try {
			const response = await fetch("/api/foods", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(food),
			});

			if (response.ok) {
				invalidateFoodSummariesCache();
				toast.success(SUCCESS_MESSAGES.ADDED("Food", food.name));
				return true;
			}
			const errorData = await response.json().catch(() => ({}));
			const errorMessage = errorData.error || ERROR_MESSAGES.ADD_FAILED("food");
			toast.error(errorMessage);
			console.error("Failed to add food:", errorData);
			return false;
		} catch (err) {
			toast.error(ERROR_MESSAGES.CONNECTION_ERROR);
			console.error("Error adding food:", err);
			return false;
		}
	}, []);

	return { addFood };
}
