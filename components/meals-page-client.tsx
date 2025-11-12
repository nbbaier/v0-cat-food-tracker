"use client";

import { Trash2, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { AddMealDialog } from "@/components/add-meal-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MealFilters } from "@/components/meal-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeals } from "@/hooks/use-meals";
import type { Meal, MealInput } from "@/lib/types";

type MealTimeFilter = "all" | "morning" | "evening";
type MealSortOption = "date" | "time" | "food";

export function MealsPageClient() {
	const { meals, isLoading, addMeal, deleteMeal } = useMeals();
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [mealToDelete, setMealToDelete] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [mealTimeFilter, setMealTimeFilter] = useState<MealTimeFilter>("all");
	const [sortBy, setSortBy] = useState<MealSortOption>("date");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [isFiltersMinimized, setIsFiltersMinimized] = useState(false);

	const handleAddMeal = async (meal: MealInput) => {
		const success = await addMeal(meal);
		if (success) {
			setIsAddDialogOpen(false);
		}
	};

	const handleDeleteMeal = async () => {
		if (mealToDelete) {
			await deleteMeal(mealToDelete);
			setMealToDelete(null);
		}
	};

	const resetFilters = () => {
		setSearchTerm("");
		setMealTimeFilter("all");
		setSortBy("date");
		setSortOrder("desc");
	};

	const filteredAndSortedMeals = useMemo(() => {
		let filtered = [...meals];

		if (searchTerm) {
			filtered = filtered.filter((meal) =>
				meal.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		if (mealTimeFilter !== "all") {
			filtered = filtered.filter((meal) => meal.mealTime === mealTimeFilter);
		}

		filtered.sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case "date": {
					const dateA = a.mealDate;
					const dateB = b.mealDate;
					if (dateA !== dateB) {
						comparison = dateB.localeCompare(dateA);
					} else {
						const timeA = a.mealTime === "morning" ? 0 : 1;
						const timeB = b.mealTime === "morning" ? 0 : 1;
						comparison = timeA - timeB;
					}
					break;
				}
				case "time": {
					const timeA = a.mealTime === "morning" ? 0 : 1;
					const timeB = b.mealTime === "morning" ? 0 : 1;
					if (timeA !== timeB) {
						comparison = timeA - timeB;
					} else {
						comparison = b.mealDate.localeCompare(a.mealDate);
					}
					break;
				}
				case "food":
					comparison = a.food.name.localeCompare(b.food.name);
					break;
			}

			return sortOrder === "asc" ? comparison : -comparison;
		});

		return filtered;
	}, [meals, searchTerm, mealTimeFilter, sortBy, sortOrder]);

	const mealsByDate = useMemo(() => {
		return filteredAndSortedMeals.reduce(
			(acc, meal) => {
				if (!acc[meal.mealDate]) {
					acc[meal.mealDate] = [];
				}
				acc[meal.mealDate].push(meal);
				return acc;
			},
			{} as Record<string, Meal[]>,
		);
	}, [filteredAndSortedMeals]);

	const sortedDates = Object.keys(mealsByDate).sort((a, b) => {
		if (sortBy === "date") {
			return sortOrder === "desc" ? b.localeCompare(a) : a.localeCompare(b);
		}
		return b.localeCompare(a);
	});

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-background">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<main className="px-4 py-6 mx-auto max-w-5xl sm:px-6 sm:py-8 lg:px-8">
				<MealFilters
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					mealTimeFilter={mealTimeFilter}
					onMealTimeFilterChange={setMealTimeFilter}
					sortBy={sortBy}
					onSortByChange={setSortBy}
					sortOrder={sortOrder}
					onSortOrderToggle={() =>
						setSortOrder(sortOrder === "asc" ? "desc" : "asc")
					}
					onReset={resetFilters}
					isMinimized={isFiltersMinimized}
					onToggleMinimize={() => setIsFiltersMinimized(!isFiltersMinimized)}
					onLogMeal={() => setIsAddDialogOpen(true)}
				/>
				{filteredAndSortedMeals.length === 0 ? (
					<div className="flex flex-col justify-center items-center py-12 text-center">
						<Utensils className="mb-4 size-12 text-muted-foreground" />
						<h2 className="mb-2 text-lg font-semibold">
							{meals.length === 0
								? "No meals logged yet"
								: "No meals match your filters"}
						</h2>
						<p className="mb-4 text-sm text-muted-foreground">
							{meals.length === 0
								? "Start tracking your cat's meals by clicking the Log Meal button above."
								: "Try adjusting your filters to see more results."}
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{sortedDates.map((date) => {
							const dateMeals = mealsByDate[date];
							const sortedMeals = [...dateMeals].sort((a, b) => {
								if (sortBy === "time") {
									const timeA = a.mealTime === "morning" ? 0 : 1;
									const timeB = b.mealTime === "morning" ? 0 : 1;
									if (timeA !== timeB) {
										return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
									}
								}
								if (a.mealTime === b.mealTime) return 0;
								return a.mealTime === "morning" ? -1 : 1;
							});

							return (
								<div key={date}>
									<h2 className="mb-3 text-lg font-semibold">
										{new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
											weekday: "long",
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</h2>
									<div className="gap-4 grid grid-cols-1 md:grid-cols-2">
										{sortedMeals.map((meal) => (
											<Card key={meal.id}>
												<CardHeader className="flex flex-row justify-between items-start pb-3">
													<div className="space-y-1">
														<CardTitle className="text-base">
															{meal.food.name}
														</CardTitle>
														<div className="flex gap-2 items-center">
															<Badge variant="outline" className="capitalize">
																{meal.mealTime}
															</Badge>
															<span className="text-sm text-muted-foreground">
																{meal.amount}
															</span>
														</div>
													</div>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setMealToDelete(meal.id)}
														className="size-8 -mt-1 -mr-2 text-muted-foreground hover:text-destructive"
													>
														<Trash2 className="size-4" />
													</Button>
												</CardHeader>
												{meal.notes && (
													<CardContent className="pt-0">
														<p className="text-sm text-muted-foreground">
															{meal.notes}
														</p>
													</CardContent>
												)}
											</Card>
										))}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</main>

			<AddMealDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				onAdd={handleAddMeal}
			/>
			<ConfirmDialog
				open={mealToDelete !== null}
				onOpenChange={(open) => !open && setMealToDelete(null)}
				onConfirm={handleDeleteMeal}
				title="Delete Meal"
				description="Are you sure you want to delete this meal? This action cannot be undone."
				confirmLabel="Delete"
				variant="destructive"
			/>
		</div>
	);
}
