"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";
import type { Food, FoodInput } from "@/lib/types";
import { invalidateFoodSummariesCache } from "./use-food-summaries";

const PAGE_SIZE = 100;

export function useFoods() {
	const [foods, setFoods] = useState<Food[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const offsetRef = useRef(0);

	const fetchFoods = useCallback(async ({ append = false } = {}) => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		const params = new URLSearchParams();
		params.set("limit", PAGE_SIZE.toString());
		params.set("offset", append ? offsetRef.current.toString() : "0");
		params.set("archived", "false");

		try {
			if (!append) {
				setError(null);
				setIsLoading(true);
			} else {
				setIsFetchingMore(true);
			}

			const response = await fetch(`/api/foods?${params.toString()}`, {
				signal: abortController.signal,
			});

			if (abortController.signal.aborted) return;

			if (response.ok) {
				const data = await response.json();
				const items: Food[] = data.foods || data;

				setHasMore(Boolean(data.hasMore ?? items.length === PAGE_SIZE));

				if (append) {
					setFoods((prev) => [...prev, ...items]);
				} else {
					setFoods(items);
				}
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
				setIsFetchingMore(false);
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
		offsetRef.current = foods.length;
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
		await fetchFoods({ append: false });
	}, [fetchFoods]);

	const loadMoreFoods = useCallback(async () => {
		if (!hasMore || isFetchingMore) return;
		await fetchFoods({ append: true });
	}, [fetchFoods, hasMore, isFetchingMore]);

	return {
		foods,
		isLoading,
		isFetchingMore,
		error,
		hasMore,
		addFood,
		updateFood,
		deleteFood,
		refreshFoods,
		loadMoreFoods,
	};
}
