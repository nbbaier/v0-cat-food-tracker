"use client";

import { LayoutGrid, List } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AddFoodDialog } from "@/components/add-food-dialog";
import { FoodFilters } from "@/components/food-filters";
import { FoodList } from "@/components/food-list";
import { useHeaderActions } from "@/components/header-context";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useFoods } from "@/hooks/use-foods";
import type { Food, FoodInput, InventoryFilter, SortOption } from "@/lib/types";

export function FoodsPageClient() {
	const { foods, isLoading, addFood, updateFood, deleteFood } = useFoods();
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [viewMode, setViewMode] = useState<"compact" | "full">("compact");
	const { setActions } = useHeaderActions();

	const [searchTerm, setSearchTerm] = useState("");
	const [preferenceFilters, setPreferenceFilters] = useState<
		Set<"likes" | "dislikes" | "unknown">
	>(new Set());
	const [inventoryFilter, setInventoryFilter] =
		useState<InventoryFilter>("all");
	const [sortBy, setSortBy] = useState<SortOption>("date");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [isFiltersMinimized, setIsFiltersMinimized] = useState(false);

	const handleAddFood = async (food: FoodInput) => {
		const success = await addFood(food);
		if (success) {
			setIsAddDialogOpen(false);
		}
	};

	const handleUpdateFood = async (id: string, updates: Partial<Food>) => {
		await updateFood(id, updates);
	};

	const handleDeleteFood = async (id: string) => {
		await deleteFood(id);
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

	useEffect(() => {
		setActions(
			<ButtonGroup className="shrink-0">
				<Button
					variant="outline"
					size="icon-lg"
					onClick={() => setViewMode("compact")}
					className={viewMode === "compact" ? "bg-accent" : ""}
					title="Compact view"
				>
					<List className="size-4" />
				</Button>
				<Button
					variant="outline"
					size="icon-lg"
					onClick={() => setViewMode("full")}
					className={viewMode === "full" ? "bg-accent" : ""}
					title="Full card view"
				>
					<LayoutGrid className="size-4" />
				</Button>
			</ButtonGroup>,
		);

		return () => {
			setActions(null);
		};
	}, [viewMode, setActions]);

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
					onAddFood={() => setIsAddDialogOpen(true)}
				/>
				<FoodList
					foods={filteredAndSortedFoods}
					onUpdate={handleUpdateFood}
					onDelete={handleDeleteFood}
					viewMode={viewMode}
				/>
			</main>

			<AddFoodDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				onAdd={handleAddFood}
			/>
		</div>
	);
}
