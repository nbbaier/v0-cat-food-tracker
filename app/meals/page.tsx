"use client";

import { Home, Plus, Trash2, Utensils } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AddMealDialog } from "@/components/add-meal-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Meal = {
	id: string;
	mealDate: string;
	mealTime: "morning" | "evening";
	foodId: string;
	food: {
		id: string;
		name: string;
		preference: string;
	};
	amount: string;
	notes: string;
	createdAt: string;
	updatedAt: string;
};

type MealInput = {
	mealDate: string;
	mealTime: "morning" | "evening";
	foodId: string;
	amount: string;
	notes: string;
};

export default function MealsPage() {
	const [meals, setMeals] = useState<Meal[]>([]);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const fetchMeals = useCallback(async () => {
		try {
			const response = await fetch("/api/meals");

			if (response.ok) {
				const data = await response.json();
				setMeals(data);
			} else {
				console.error("Failed to fetch meals");
			}
		} catch (error) {
			console.error("Error fetching meals:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchMeals();
	}, [fetchMeals]);

	const handleAddMeal = async (meal: MealInput) => {
		try {
			const response = await fetch("/api/meals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(meal),
			});

			if (response.ok) {
				const newMeal = await response.json();
				setMeals((prev) => [newMeal, ...prev]);
				setIsAddDialogOpen(false);
			} else {
				console.error("Failed to add meal");
			}
		} catch (error) {
			console.error("Error adding meal:", error);
		}
	};

	const handleDeleteMeal = async (id: string) => {
		if (!confirm("Are you sure you want to delete this meal?")) return;

		try {
			const response = await fetch(`/api/meals/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setMeals((prev) => prev.filter((meal) => meal.id !== id));
			} else {
				console.error("Failed to delete meal");
			}
		} catch (error) {
			console.error("Error deleting meal:", error);
		}
	};

	// Group meals by date
	const mealsByDate = meals.reduce(
		(acc, meal) => {
			if (!acc[meal.mealDate]) {
				acc[meal.mealDate] = [];
			}
			acc[meal.mealDate].push(meal);
			return acc;
		},
		{} as Record<string, Meal[]>,
	);

	// Sort dates descending
	const sortedDates = Object.keys(mealsByDate).sort((a, b) =>
		b.localeCompare(a),
	);

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
						<div className="flex items-center gap-3">
							<Utensils className="size-6" />
							<h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
								Meal Log
							</h1>
						</div>
						<div className="flex flex-wrap gap-2 items-center sm:flex-nowrap">
							<ButtonGroup className="shrink-0">
								<Button variant="outline" size="icon" asChild>
									<Link href="/">
										<Home className="size-4" />
									</Link>
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
									Log Meal
								</Button>
							</ButtonGroup>
						</div>
					</div>
				</div>
			</header>

			<main className="px-4 py-6 mx-auto max-w-5xl sm:px-6 sm:py-8 lg:px-8">
				{meals.length === 0 ? (
					<div className="flex flex-col justify-center items-center py-12 text-center">
						<Utensils className="mb-4 size-12 text-muted-foreground" />
						<h2 className="mb-2 text-lg font-semibold">No meals logged yet</h2>
						<p className="mb-4 text-sm text-muted-foreground">
							Start tracking your cat's meals by clicking the button above.
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{sortedDates.map((date) => {
							const dateMeals = mealsByDate[date];
							// Sort meals by time (morning first)
							const sortedMeals = [...dateMeals].sort((a, b) => {
								if (a.mealTime === b.mealTime) return 0;
								return a.mealTime === "morning" ? -1 : 1;
							});

							return (
								<div key={date}>
									<h2 className="mb-3 text-lg font-semibold">
										{new Date(date + "T00:00:00").toLocaleDateString("en-US", {
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
														onClick={() => handleDeleteMeal(meal.id)}
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
		</div>
	);
}
