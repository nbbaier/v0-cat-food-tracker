"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FoodFilters } from "@/components/foods/food-filters";
import { FoodList } from "@/components/foods/food-list";
import { QuickAddDialog } from "@/components/layout/quick-add-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useQuickAddDialog } from "@/components/shared/quick-add-context";
import { Button } from "@/components/ui/button";
import { useFoods } from "@/hooks/use-foods";
import { useMealMutations } from "@/hooks/use-meal-mutations";
import type {
	Food,
	FoodInput,
	InventoryFilter,
	MealInput,
	SortOption,
} from "@/lib/types";

export function FoodsPageClient() {
	const {
		foods,
		isLoading,
		isFetchingMore,
		hasMore,
		addFood,
		updateFood,
		deleteFood,
		loadMoreFoods,
	} = useFoods();
	const { addMeal } = useMealMutations();
	const { registerDialog } = useQuickAddDialog();
	const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

	const handleOpenDialog = useCallback(() => {
		setIsQuickAddOpen(true);
	}, []);

	const registerDialogRef = useRef(registerDialog);
	registerDialogRef.current = registerDialog;

	useEffect(() => {
		const unregister = registerDialogRef.current(handleOpenDialog);
		return () => {
			unregister();
		};
	}, [handleOpenDialog]);

	const [searchTerm, setSearchTerm] = useState("");
	const [preferenceFilters, setPreferenceFilters] = useState<
		Set<"likes" | "dislikes" | "unknown">
	>(new Set());
	const [inventoryFilter, setInventoryFilter] =
		useState<InventoryFilter>("all");
	const [sortBy, setSortBy] = useState<SortOption>("date");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [isFiltersMinimized, setIsFiltersMinimized] = useState(false);
	const [foodToDelete, setFoodToDelete] = useState<Food | null>(null);
	const handleAddFood = async (food: FoodInput) => {
		const success = await addFood(food);
		if (success) {
			setIsQuickAddOpen(false);
		}
	};

	const handleAddMeal = async (meal: MealInput) => {
		const result = await addMeal(meal);
		if (result.success) {
			setIsQuickAddOpen(false);
		}
	};

	const handleUpdateFood = async (id: string, updates: Partial<Food>) => {
		await updateFood(id, updates);
	};

	const handleDeleteFood = async () => {
		if (foodToDelete) {
			await deleteFood(foodToDelete.id);
		}
	};

	const confirmDeleteFood = (food: Food) => {
		setFoodToDelete(food);
	};

	const filteredAndSortedFoods = useMemo(() => {
		let filtered = [...foods];

		if (searchTerm) {
			filtered = filtered.filter((food) =>
				food.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		if (preferenceFilters.size > 0) {
			filtered = filtered.filter((food) =>
				preferenceFilters.has(food.preference),
			);
		}

		if (inventoryFilter === "in-stock") {
			filtered = filtered.filter((food) => food.inventoryQuantity > 0);
		} else if (inventoryFilter === "out-of-stock") {
			filtered = filtered.filter((food) => food.inventoryQuantity === 0);
		}

		filtered.sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case "name":
					comparison = a.name.localeCompare(b.name);
					break;
				case "preference": {
					const preferenceOrder = { likes: 0, unknown: 1, dislikes: 2 };
					comparison =
						preferenceOrder[a.preference] - preferenceOrder[b.preference];
					break;
				}
				case "inventory":
					comparison = a.inventoryQuantity - b.inventoryQuantity;
					break;
				case "date":
					comparison = a.addedAt - b.addedAt;
					break;
			}

			return sortOrder === "asc" ? comparison : -comparison;
		});

		return filtered;
	}, [
		foods,
		searchTerm,
		preferenceFilters,
		inventoryFilter,
		sortBy,
		sortOrder,
	]);

	const togglePreferenceFilter = (
		preference: "likes" | "dislikes" | "unknown",
	) => {
		setPreferenceFilters((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(preference)) {
				newSet.delete(preference);
			} else {
				newSet.add(preference);
			}
			return newSet;
		});
	};

	const resetFilters = () => {
		setSearchTerm("");
		setPreferenceFilters(new Set());
		setInventoryFilter("all");
		setSortBy("date");
		setSortOrder("desc");
	};

	if (isLoading) {
		return (
			<output className="flex justify-center items-center min-h-screen bg-background">
				<p className="text-muted-foreground">Loading...</p>
			</output>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<main className="px-4 py-6 mx-auto max-w-5xl sm:px-6 sm:py-8 lg:px-8">
				<FoodFilters
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					preferenceFilters={preferenceFilters}
					onTogglePreference={togglePreferenceFilter}
					inventoryFilter={inventoryFilter}
					onInventoryFilterChange={setInventoryFilter}
					sortBy={sortBy}
					onSortByChange={setSortBy}
					sortOrder={sortOrder}
					onSortOrderToggle={() =>
						setSortOrder(sortOrder === "asc" ? "desc" : "asc")
					}
					onReset={resetFilters}
					isMinimized={isFiltersMinimized}
					onToggleMinimize={() => setIsFiltersMinimized(!isFiltersMinimized)}
				/>
				<FoodList
					foods={filteredAndSortedFoods}
					onUpdate={handleUpdateFood}
					onDelete={confirmDeleteFood}
					viewMode="compact"
				/>
				{hasMore && (
					<div className="flex justify-center mt-6">
						<Button
							variant="outline"
							onClick={loadMoreFoods}
							disabled={isFetchingMore}
						>
							{isFetchingMore ? "Loading..." : "Load More"}
						</Button>
					</div>
				)}
			</main>

			<QuickAddDialog
				open={isQuickAddOpen}
				onOpenChange={setIsQuickAddOpen}
				onAddFood={handleAddFood}
				onAddMeal={handleAddMeal}
				defaultTab="food"
			/>
			<ConfirmDialog
				open={foodToDelete !== null}
				onOpenChange={(open) => !open && setFoodToDelete(null)}
				onConfirm={handleDeleteFood}
				title="Delete Food"
				description={
					foodToDelete
						? `Are you sure you want to delete "${foodToDelete.name}"? This action cannot be undone.`
						: "Are you sure you want to delete this food? This action cannot be undone."
				}
				confirmLabel="Delete"
				variant="destructive"
			/>
		</div>
	);
}
