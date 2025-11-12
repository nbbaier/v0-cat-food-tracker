"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";
import type { Food, FoodInput } from "@/lib/types";

export function useFoods() {
	const [foods, setFoods] = useState<Food[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchFoods = useCallback(async () => {
		try {
			setError(null);
			const response = await fetch("/api/foods");

			if (response.ok) {
				const data = await response.json();
				setFoods(data);
			} else {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					errorData.error || ERROR_MESSAGES.FETCH_FAILED("foods");
				toast.error(errorMessage);
				setError(new Error(errorMessage));
				console.error("Failed to fetch foods:", errorData);
			}
		} catch (err) {
			const errorMessage = ERROR_MESSAGES.CONNECTION_ERROR;
			toast.error(errorMessage);
			setError(err instanceof Error ? err : new Error(errorMessage));
			console.error("Error fetching foods:", err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchFoods();
	}, [fetchFoods]);

	const addFood = useCallback(async (food: FoodInput): Promise<boolean> => {
		try {
			const response = await fetch("/api/foods", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(food),
			});

			if (response.ok) {
				const newFood = await response.json();
				setFoods((prev) => [newFood, ...prev]);
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

	const updateFood = useCallback(
		async (id: string, updates: Partial<Food>): Promise<boolean> => {
			// Store previous state for rollback
			const previousFoods = foods;

			// Optimistic update
			setFoods((prev) =>
				prev.map((food) => (food.id === id ? { ...food, ...updates } : food)),
			);

			try {
				const response = await fetch(`/api/foods/${id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(updates),
				});

				if (response.ok) {
					toast.success(SUCCESS_MESSAGES.UPDATED("Food"));
					return true;
				}

				// Rollback on error
				setFoods(previousFoods);
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					errorData.error || ERROR_MESSAGES.UPDATE_FAILED("food");
				toast.error(errorMessage);
				console.error("Failed to update food:", errorData);
				return false;
			} catch (err) {
				// Rollback on error
				setFoods(previousFoods);
				toast.error(ERROR_MESSAGES.CONNECTION_ERROR);
				console.error("Error updating food:", err);
				return false;
			}
		},
		[foods],
	);

	const deleteFood = useCallback(
		async (id: string): Promise<boolean> => {
			const foodToDelete = foods.find((f) => f.id === id);
			const foodName = foodToDelete?.name || "Food";

			try {
				const response = await fetch(`/api/foods/${id}`, {
					method: "DELETE",
				});

				if (response.ok) {
					setFoods((prev) => prev.filter((food) => food.id !== id));
					toast.success(SUCCESS_MESSAGES.DELETED("Food", foodName));
					return true;
				}
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					errorData.error || ERROR_MESSAGES.DELETE_FAILED("food");
				toast.error(errorMessage);
				console.error("Failed to delete food:", errorData);
				return false;
			} catch (err) {
				toast.error(ERROR_MESSAGES.CONNECTION_ERROR);
				console.error("Error deleting food:", err);
				return false;
			}
		},
		[foods],
	);

	return {
		foods,
		isLoading,
		error,
		addFood,
		updateFood,
		deleteFood,
		refreshFoods: fetchFoods,
	};
}
