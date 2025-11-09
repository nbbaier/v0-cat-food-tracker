"use client";

import { LayoutGrid, Plus, Table } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddFoodDialog } from "@/components/add-food-dialog";
import { FoodFilters } from "@/components/food-filters";
import { FoodList } from "@/components/food-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export type Food = {
	id: string;
	name: string;
	preference: "likes" | "dislikes" | "unknown";
	notes: string;
	inventoryQuantity: number;
	addedAt: number;
};

export type SortOption = "name" | "preference" | "inventory" | "date";
export type InventoryFilter = "all" | "in-stock" | "out-of-stock";

export default function Page() {
	const [foods, setFoods] = useState<Food[]>([]);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
	const [isLoading, setIsLoading] = useState(true);

	// Filter and sort state
	const [searchTerm, setSearchTerm] = useState("");
	const [preferenceFilters, setPreferenceFilters] = useState<
		Set<"likes" | "dislikes" | "unknown">
	>(new Set());
	const [inventoryFilter, setInventoryFilter] =
		useState<InventoryFilter>("all");
	const [sortBy, setSortBy] = useState<SortOption>("date");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [isFiltersMinimized, setIsFiltersMinimized] = useState(false);

	const fetchFoods = useCallback(async () => {
		try {
			const response = await fetch("/api/foods");

			if (response.ok) {
				const data = await response.json();
				setFoods(data);
			} else {
				console.error("Failed to fetch foods");
			}
		} catch (error) {
			console.error("Error fetching foods:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchFoods();
	}, [fetchFoods]);

	const handleAddFood = async (food: Omit<Food, "id" | "addedAt">) => {
		try {
			const response = await fetch("/api/foods", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(food),
			});

			if (response.ok) {
				const newFood = await response.json();
				setFoods((prev) => [newFood, ...prev]);
				setIsAddDialogOpen(false);
			} else {
				console.error("Failed to add food");
			}
		} catch (error) {
			console.error("Error adding food:", error);
		}
	};

	const handleUpdateFood = async (id: string, updates: Partial<Food>) => {
		try {
			const response = await fetch(`/api/foods/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updates),
			});

			if (response.ok) {
				setFoods((prev) =>
					prev.map((food) => (food.id === id ? { ...food, ...updates } : food)),
				);
			} else {
				console.error("Failed to update food");
			}
		} catch (error) {
			console.error("Error updating food:", error);
		}
	};

	const handleDeleteFood = async (id: string) => {
		try {
			const response = await fetch(`/api/foods/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setFoods((prev) => prev.filter((food) => food.id !== id));
			} else {
				console.error("Failed to delete food");
			}
		} catch (error) {
			console.error("Error deleting food:", error);
		}
	};

	// Filter and sort foods
	const filteredAndSortedFoods = useMemo(() => {
		let filtered = [...foods];

		// Filter by search term (notes)
		if (searchTerm) {
			filtered = filtered.filter((food) =>
				food.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		// Filter by preference
		if (preferenceFilters.size > 0) {
			filtered = filtered.filter((food) =>
				preferenceFilters.has(food.preference),
			);
		}

		// Filter by inventory status
		if (inventoryFilter === "in-stock") {
			filtered = filtered.filter((food) => food.inventoryQuantity > 0);
		} else if (inventoryFilter === "out-of-stock") {
			filtered = filtered.filter((food) => food.inventoryQuantity === 0);
		}

		// Sort
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

	// Toggle preference filter
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

	// Reset all filters to default
	const resetFilters = () => {
		setSearchTerm("");
		setPreferenceFilters(new Set());
		setInventoryFilter("all");
		setSortBy("date");
		setSortOrder("desc");
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-background">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b bg-card">
				<div className="px-4 py-4 mx-auto max-w-5xl sm:px-6 sm:py-6 lg:px-8">
					<div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
						<div>
							<h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
								Ygritte's Picky Picks
							</h1>
						</div>
						<div className="flex flex-wrap gap-2 items-center sm:flex-nowrap">
							<ButtonGroup className="shrink-0">
								<Button
									variant={viewMode === "cards" ? "outline" : "outline"}
									size="icon"
									onClick={() => setViewMode("cards")}
									className={viewMode === "cards" ? "bg-accent" : ""}
								>
									<LayoutGrid className="size-4" />
								</Button>
								<Button
									variant={viewMode === "table" ? "outline" : "outline"}
									size="icon"
									onClick={() => setViewMode("table")}
									className={viewMode === "table" ? "bg-accent" : ""}
								>
									<Table className="size-4" />
								</Button>
							</ButtonGroup>
							<ButtonGroup className="shrink-0">
								<ThemeToggle />
							</ButtonGroup>
							<ButtonGroup className="flex-1 sm:flex-initial">
								<Button
									onClick={() => setIsAddDialogOpen(true)}
									size="default"
									className="w-full sm:w-auto"
								>
									<Plus className="size-4" />
									Add Food
								</Button>
							</ButtonGroup>
						</div>
					</div>
				</div>
			</header>

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
