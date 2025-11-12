"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";
import type { Meal, MealInput } from "@/lib/types";

export function useMeals() {
	const [meals, setMeals] = useState<Meal[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchMeals = useCallback(async () => {
		try {
			setError(null);
			const response = await fetch("/api/meals");

			if (response.ok) {
				const data = await response.json();
				setMeals(data);
			} else {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					errorData.error || ERROR_MESSAGES.FETCH_FAILED("meals");
				toast.error(errorMessage);
				setError(new Error(errorMessage));
				console.error("Failed to fetch meals:", errorData);
			}
		} catch (err) {
			const errorMessage = ERROR_MESSAGES.CONNECTION_ERROR;
			toast.error(errorMessage);
			setError(err instanceof Error ? err : new Error(errorMessage));
			console.error("Error fetching meals:", err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchMeals();
	}, [fetchMeals]);

	const addMeal = useCallback(async (meal: MealInput): Promise<boolean> => {
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
				errorData.error || ERROR_MESSAGES.DELETE_FAILED("meal");
			toast.error(errorMessage);
			console.error("Failed to delete meal:", errorData);
			return false;
		} catch (err) {
			toast.error(ERROR_MESSAGES.CONNECTION_ERROR);
			console.error("Error deleting meal:", err);
			return false;
		}
	}, []);

	return {
		meals,
		isLoading,
		error,
		addMeal,
		deleteMeal,
		refreshMeals: fetchMeals,
	};
}
