"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";
import type { MealInput } from "@/lib/types";

export function useMealMutations() {
	const addMeal = useCallback(async (meal: MealInput): Promise<boolean> => {
		try {
			const response = await fetch("/api/meals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(meal),
			});

			if (response.ok) {
				toast.success(SUCCESS_MESSAGES.ADDED("Meal"));
				return true;
			}
			const errorData = await response.json().catch(() => ({}));
			const errorMessage = errorData.error || ERROR_MESSAGES.ADD_FAILED("meal");
			toast.error(errorMessage);
			console.error("Failed to add meal:", errorData);
			return false;
		} catch (err) {
			toast.error(ERROR_MESSAGES.CONNECTION_ERROR);
			console.error("Error adding meal:", err);
			return false;
		}
	}, []);

	return { addMeal };
}
