"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";
import type { Food, FoodInput } from "@/lib/types";
import { invalidateFoodSummariesCache } from "./use-food-summaries";

export function useFoods() {
	const [foods, setFoods] = useState<Food[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const fetchFoods = useCallback(async () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		try {
			setError(null);
			const response = await fetch("/api/foods", {
				signal: abortController.signal,
			});

			if (abortController.signal.aborted) return;

			if (response.ok) {
				const data = await response.json();
				setFoods(data.foods || data);
			} else {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					errorData.error ?? ERROR_MESSAGES.FETCH_FAILED("foods");
				toast.error(errorMessage);
				setError(new Error(errorMessage));
				console.error("Failed to fetch foods:", errorData);
			}
		} catch (err) {
			if (abortController.signal.aborted) return;
			const errorMessage = ERROR_MESSAGES.CONNECTION_ERROR;
			toast.error(errorMessage);
			setError(err instanceof Error ? err : new Error(errorMessage));
			console.error("Error fetching foods:", err);
		} finally {
			if (!abortController.signal.aborted) {
				setIsLoading(false);
			}
		}
	}, []);

	useEffect(() => {
		fetchFoods();
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [fetchFoods]);

	const foodsRef = useRef<Food[]>([]);
	useEffect(() => {
		foodsRef.current = foods;
	}, [foods]);

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
				invalidateFoodSummariesCache();
				toast.success(SUCCESS_MESSAGES.ADDED("Food", food.name));
				return true;
			}
			const errorData = await response.json().catch(() => ({}));
			const errorMessage = errorData.error ?? ERROR_MESSAGES.ADD_FAILED("food");
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
			const prev = foodsRef.current;
			setFoods((p) => p.map((f) => (f.id === id ? { ...f, ...updates } : f)));

			try {
				const response = await fetch(`/api/foods/${id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(updates),
				});

				if (response.ok) {
					invalidateFoodSummariesCache();
					toast.success(SUCCESS_MESSAGES.UPDATED("Food"));
					return true;
				}

				setFoods(prev);
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					errorData.error ?? ERROR_MESSAGES.UPDATE_FAILED("food");
				toast.error(errorMessage);
				console.error("Failed to update food:", errorData);
				return false;
			} catch (err) {
				setFoods(prev);
				toast.error(ERROR_MESSAGES.CONNECTION_ERROR);
				console.error("Error updating food:", err);
				return false;
			}
		},
		[],
	);

	const deleteFood = useCallback(async (id: string): Promise<boolean> => {
		const foodToDelete = foodsRef.current.find((f) => f.id === id);
		const foodName = foodToDelete?.name ?? "Food";

		try {
			const response = await fetch(`/api/foods/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setFoods((prev) => prev.filter((food) => food.id !== id));
				invalidateFoodSummariesCache();
				toast.success(SUCCESS_MESSAGES.DELETED("Food", foodName));
				return true;
			}
			const errorData = await response.json().catch(() => ({}));
			const errorMessage =
				errorData.error ?? ERROR_MESSAGES.DELETE_FAILED("food");
			toast.error(errorMessage);
			console.error("Failed to delete food:", errorData);
			return false;
		} catch (err) {
			toast.error(ERROR_MESSAGES.CONNECTION_ERROR);
			console.error("Error deleting food:", err);
			return false;
		}
	}, []);

	const refreshFoods = useCallback(async () => {
		await fetchFoods();
	}, [fetchFoods]);

	return {
		foods,
		isLoading,
		error,
		addFood,
		updateFood,
		deleteFood,
		refreshFoods,
	};
}
