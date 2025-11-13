"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES, PAGINATION, SUCCESS_MESSAGES } from "@/lib/constants";
import type { Meal, MealInput } from "@/lib/types";

/**
 * Custom hook for managing meals with cursor-based pagination
 *
 * @returns An object containing:
 * - meals: Array of Meal objects (currently loaded)
 * - isLoading: Boolean indicating if initial load is in progress
 * - isFetchingMore: Boolean indicating if loading more items is in progress
 * - error: Error object if an error occurred, null otherwise
 * - hasMore: Boolean indicating if more items are available to load
 * - addMeal: Function to add a new meal (returns Promise with success/error result)
 * - deleteMeal: Function to delete a meal (returns Promise<boolean>)
 * - refreshMeals: Function to refresh the meals list
 * - loadMoreMeals: Function to load the next page of meals (returns Promise<void>)
 */
export function useMeals() {
	const [meals, setMeals] = useState<Meal[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const cursorRef = useRef<number | null>(null);

	const fetchMeals = useCallback(async ({ append = false } = {}) => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		const params = new URLSearchParams();
		params.set("limit", PAGINATION.DEFAULT_PAGE_SIZE.toString());
		if (append && cursorRef.current !== null) {
			params.set("cursor", cursorRef.current.toString());
		}

		try {
			if (!append) {
				setError(null);
				setIsLoading(true);
			} else {
				setIsFetchingMore(true);
			}

			const response = await fetch(`/api/meals?${params.toString()}`, {
				signal: abortController.signal,
			});

			if (abortController.signal.aborted) return;

			if (response.ok) {
				const data = await response.json();
				const items: Meal[] = data.meals || data;

				setHasMore(
					Boolean(
						data.hasMore ?? items.length === PAGINATION.DEFAULT_PAGE_SIZE,
					),
				);

				if (append) {
					setMeals((prev) => [...prev, ...items]);
				} else {
					setMeals(items);
					cursorRef.current = null;
				}

				if (items.length > 0) {
					const lastItem = items[items.length - 1];
					const lastCreatedAt = new Date(lastItem.createdAt).getTime();
					cursorRef.current = lastCreatedAt;
				} else {
					cursorRef.current = null;
				}
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
				setIsFetchingMore(false);
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

	/**
	 * Adds a new meal to the database
	 *
	 * @param meal - The meal data to add
	 * @returns Promise that resolves to:
	 *   - { success: true } if successful
	 *   - { success: false, errors?: Record<string, string> } if validation errors occurred
	 *   - { success: false, error?: string } if other error occurred
	 * @throws Does not throw - errors are handled internally and displayed via toast
	 * @remarks On failure: Shows error toast (unless validation errors), logs error to console, returns error result
	 */
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

	/**
	 * Deletes a meal from the database
	 *
	 * @param id - The ID of the meal to delete
	 * @returns Promise that resolves to true if successful, false otherwise
	 * @remarks On failure: Shows error toast, logs error to console, returns false
	 */
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

	/**
	 * Refreshes the meals list by fetching from the beginning
	 *
	 * @returns Promise that resolves when the refresh is complete
	 */
	const refreshMeals = useCallback(async () => {
		await fetchMeals({ append: false });
	}, [fetchMeals]);

	/**
	 * Loads the next page of meals using cursor-based pagination
	 *
	 * @returns Promise<void> - Does not return a value
	 * @remarks
	 * - Only fetches if hasMore is true and isFetchingMore is false
	 * - Uses cursor-based pagination with createdAt timestamp
	 * - Appends new items to the existing meals array
	 * - Automatically updates hasMore based on response
	 */
	const loadMoreMeals = useCallback(async () => {
		if (!hasMore || isFetchingMore) return;
		await fetchMeals({ append: true });
	}, [fetchMeals, hasMore, isFetchingMore]);

	return {
		meals,
		isLoading,
		isFetchingMore,
		error,
		hasMore,
		addMeal,
		deleteMeal,
		refreshMeals,
		loadMoreMeals,
	};
}
