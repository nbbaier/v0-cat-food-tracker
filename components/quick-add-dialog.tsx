"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { FoodForm } from "@/components/food-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { FoodInput, FoodSummary, MealInput } from "@/lib/types";

type QuickAddDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAddFood: (food: FoodInput) => void;
	onAddMeal: (meal: MealInput) => void;
	defaultTab?: "food" | "meal";
};

export function QuickAddDialog({
	open,
	onOpenChange,
	onAddFood,
	onAddMeal,
	defaultTab = "food",
}: QuickAddDialogProps) {
	const [activeTab, setActiveTab] = useState(defaultTab);

	// Meal form state
	const [foods, setFoods] = useState<FoodSummary[]>([]);
	const [mealDate, setMealDate] = useState(
		new Date().toISOString().split("T")[0],
	);
	const [mealTime, setMealTime] = useState<"morning" | "evening">("morning");
	const [foodId, setFoodId] = useState("");
	const [amount, setAmount] = useState("");
	const [mealNotes, setMealNotes] = useState("");

	const fetchFoods = useCallback(async () => {
		try {
			const response = await fetch("/api/foods");
			if (response.ok) {
				const data = await response.json();
				// Filter out archived foods
				const activeFoods = data.filter(
					(food: { archived?: boolean }) => !food.archived,
				);
				setFoods(activeFoods);
			}
		} catch (error) {
			console.error("Error fetching foods:", error);
		}
	}, []);

	// Fetch foods when dialog opens
	useEffect(() => {
		if (open) {
			fetchFoods();
			setActiveTab(defaultTab);
		}
	}, [open, fetchFoods, defaultTab]);

	const handleFoodSubmit = (data: FoodInput) => {
		onAddFood(data);
	};

	const handleMealSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!mealDate || !mealTime || !foodId || !amount.trim()) return;

		onAddMeal({
			mealDate,
			mealTime,
			foodId,
			amount: amount.trim(),
			notes: mealNotes.trim(),
		});

		// Reset meal form
		setMealDate(new Date().toISOString().split("T")[0]);
		setMealTime("morning");
		setFoodId("");
		setAmount("");
		setMealNotes("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Quick Add</DialogTitle>
					<DialogDescription>
						Add a new food or log a meal for your cat.
					</DialogDescription>
				</DialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={(v) => setActiveTab(v as "food" | "meal")}
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="food">Food</TabsTrigger>
						<TabsTrigger value="meal">Meal</TabsTrigger>
					</TabsList>

					<TabsContent value="food">
						<FoodForm
							onSubmit={handleFoodSubmit}
							onCancel={() => onOpenChange(false)}
							submitLabel="Add Food"
						/>
					</TabsContent>

					<TabsContent value="meal">
						<form onSubmit={handleMealSubmit}>
							<div className="space-y-6 py-4">
								<div className="space-y-2">
									<Label htmlFor="mealDate">Date</Label>
									<Input
										id="mealDate"
										type="date"
										value={mealDate}
										onChange={(e) => setMealDate(e.target.value)}
										autoFocus
									/>
								</div>

								<div className="space-y-3">
									<Label>Meal Time</Label>
									<RadioGroup
										value={mealTime}
										onValueChange={(v) =>
											setMealTime(v as "morning" | "evening")
										}
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="morning" id="quick-morning" />
											<Label htmlFor="quick-morning" className="font-normal">
												Morning
											</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="evening" id="quick-evening" />
											<Label htmlFor="quick-evening" className="font-normal">
												Evening
											</Label>
										</div>
									</RadioGroup>
								</div>

								<div className="space-y-2">
									<Label htmlFor="food">Food</Label>
									<Select value={foodId} onValueChange={setFoodId}>
										<SelectTrigger id="food">
											<SelectValue placeholder="Select a food" />
										</SelectTrigger>
										<SelectContent>
											{foods.map((food) => (
												<SelectItem key={food.id} value={food.id}>
													{food.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="amount">Amount</Label>
									<Input
										id="amount"
										placeholder='e.g., "1 can", "1/2 cup", "50g"'
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="mealNotes">Notes (optional)</Label>
									<Textarea
										id="mealNotes"
										placeholder="Any observations..."
										value={mealNotes}
										onChange={(e) => setMealNotes(e.target.value)}
										rows={3}
									/>
								</div>
							</div>

							<div className="flex gap-2 justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={!mealDate || !mealTime || !foodId || !amount.trim()}
								>
									Log Meal
								</Button>
							</div>
						</form>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
