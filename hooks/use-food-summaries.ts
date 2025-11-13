"use client";

import { useCallback, useEffect, useState } from "react";
import type { Food, FoodSummary } from "@/lib/types";

let cachedFoods: FoodSummary[] | null = null;
let fetchPromise: Promise<FoodSummary[]> | null = null;

async function fetchFoodSummaries(): Promise<FoodSummary[]> {
	if (cachedFoods) {
		return cachedFoods;
	}

	if (fetchPromise) {
		return fetchPromise;
	}

	fetchPromise = (async () => {
		try {
			const response = await fetch("/api/foods");
			if (response.ok) {
				const data = await response.json();
				const activeFoods = (data as Food[])
					.filter((food) => !food.archived)
					.map((food) => ({
						id: food.id,
						name: food.name,
						preference: food.preference,
					}));
				cachedFoods = activeFoods;
				return activeFoods;
			}
			return [];
		} catch (error) {
			console.error("Error fetching foods:", error);
			return [];
		} finally {
			fetchPromise = null;
		}
	})();

	return fetchPromise;
}

export function useFoodSummaries(shouldFetch: boolean) {
	const [foods, setFoods] = useState<FoodSummary[]>(cachedFoods ?? []);
	const [isLoading, setIsLoading] = useState(false);

	const refresh = useCallback(() => {
		cachedFoods = null;
		if (shouldFetch) {
			setIsLoading(true);
			fetchFoodSummaries()
				.then((data) => {
					setFoods(data);
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [shouldFetch]);

	useEffect(() => {
		if (shouldFetch) {
			if (cachedFoods) {
				setFoods(cachedFoods);
			} else {
				setIsLoading(true);
				fetchFoodSummaries()
					.then((data) => {
						setFoods(data);
					})
					.finally(() => {
						setIsLoading(false);
					});
			}
		}
	}, [shouldFetch]);

	return { foods, isLoading, refresh };
}

export function invalidateFoodSummariesCache() {
	cachedFoods = null;
	fetchPromise = null;
}
