"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";
import type { Meal, MealInput } from "@/lib/types";

export function useMeals() {
	const [meals, setMeals] = useState<Meal[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const fetchMeals = useCallback(async () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		try {
			setError(null);
			const response = await fetch("/api/meals", {
				signal: abortController.signal,
			});

			if (abortController.signal.aborted) return;

			if (response.ok) {
				const data = await response.json();
				setMeals(data.meals || data);
			} else {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					errorData.error ?? ERROR_MESSAGES.FETCH_FAILED("meals");
				toast.error(errorMessage);
				setError(new Error(errorMessage));
				console.error("Failed to fetch meals:", errorData);
			}
		} catch (err) {
			if (abortController.signal.aborted) return;
			const errorMessage = ERROR_MESSAGES.CONNECTION_ERROR;
			toast.error(errorMessage);
			setError(err instanceof Error ? err : new Error(errorMessage));
			console.error("Error fetching meals:", err);
		} finally {
			if (!abortController.signal.aborted) {
				setIsLoading(false);
			}
		}
	}, []);

	useEffect(() => {
		fetchMeals();
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [fetchMeals]);

	const addMeal = useCallback(
		async (
			meal: MealInput,
		): Promise<
			| { success: true }
			| { success: false; errors?: Record<string, string>; error?: string }
		> => {
			try {
				const response = await fetch("/api/meals", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(meal),
				});

				if (response.ok) {
					const newMeal = await response.json();
					setMeals((prev) => [newMeal, ...prev]);
					toast.success(SUCCESS_MESSAGES.ADDED("Meal"));
					return { success: true };
				}
				const errorData = await response.json().catch(() => ({}));

				if (errorData.details && Array.isArray(errorData.details)) {
					const { parseValidationErrors } = await import("@/lib/utils");
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

	const deleteMeal = useCallback(async (id: string): Promise<boolean> => {
		try {
			const response = await fetch(`/api/meals/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setMeals((prev) => prev.filter((meal) => meal.id !== id));
				toast.success(SUCCESS_MESSAGES.DELETED("Meal"));
				return true;
			}
			const errorData = await response.json().catch(() => ({}));
			const errorMessage =
				errorData.error ?? ERROR_MESSAGES.DELETE_FAILED("meal");
			toast.error(errorMessage);
			console.error("Failed to delete meal:", errorData);
			return false;
		} catch (err) {
			toast.error(ERROR_MESSAGES.CONNECTION_ERROR);
			console.error("Error deleting meal:", err);
			return false;
		}
	}, []);

	const refreshMeals = useCallback(async () => {
		await fetchMeals();
	}, [fetchMeals]);

	return {
		meals,
		isLoading,
		error,
		addMeal,
		deleteMeal,
		refreshMeals,
	};
}
