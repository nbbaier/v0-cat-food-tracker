"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";
import type { MealInput } from "@/lib/types";
import { parseValidationErrors } from "@/lib/utils";

export type MealMutationResult =
	| { success: true }
	| { success: false; errors?: Record<string, string>; error?: string };

export function useMealMutations() {
	const addMeal = useCallback(
		async (meal: MealInput): Promise<MealMutationResult> => {
			try {
				const response = await fetch("/api/meals", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(meal),
				});

				if (response.ok) {
					toast.success(SUCCESS_MESSAGES.ADDED("Meal"));
					return { success: true };
				}
				const errorData = await response.json().catch(() => ({}));

				if (errorData.details && Array.isArray(errorData.details)) {
					const errors = parseValidationErrors(errorData.details);
					if (Object.keys(errors).length > 0) {
						return { success: false, errors };
					}
				}

				const errorMessage =
					errorData.error ?? ERROR_MESSAGES.ADD_FAILED("meal");
				toast.error(errorMessage);
				console.error("Failed to add meal:", errorData);
				return { success: false, error: errorMessage };
			} catch (err) {
				toast.error(ERROR_MESSAGES.CONNECTION_ERROR);
				console.error("Error adding meal:", err);
				return { success: false, error: ERROR_MESSAGES.CONNECTION_ERROR };
			}
		},
		[],
	);

	return { addMeal };
}
