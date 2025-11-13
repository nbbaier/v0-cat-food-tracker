"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { useFoodSummaries } from "@/hooks/use-food-summaries";
import type { FoodInput, MealInput } from "@/lib/types";
import { getDateString } from "@/lib/utils";

type QuickAddDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAddFood: (food: FoodInput) => void | Promise<void>;
	onAddMeal: (meal: MealInput) => void | Promise<void>;
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

	const { foods, isLoading: isLoadingFoods } = useFoodSummaries(open);

	const [mealDate, setMealDate] = useState(getDateString());
	const [mealTime, setMealTime] = useState<"morning" | "evening">("morning");
	const [foodId, setFoodId] = useState("");
	const [amount, setAmount] = useState("");
	const [mealNotes, setMealNotes] = useState("");

	useEffect(() => {
		if (open) {
			setActiveTab(defaultTab);
		}
	}, [open, defaultTab]);

	const handleFoodSubmit = async (data: FoodInput) => {
		try {
			await onAddFood(data);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to add food. Please try again.",
			);
			console.error("Error adding food:", error);
		}
	};

	const handleMealSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!mealDate || !mealTime || !foodId || !amount.trim()) return;

		try {
			await onAddMeal({
				mealDate,
				mealTime,
				foodId,
				amount: amount.trim(),
				notes: mealNotes.trim(),
			});

			setMealDate(getDateString());
			setMealTime("morning");
			setFoodId("");
			setAmount("");
			setMealNotes("");
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to add meal. Please try again.",
			);
			console.error("Error adding meal:", error);
		}
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
									<Select
										value={foodId}
										onValueChange={setFoodId}
										disabled={isLoadingFoods}
									>
										<SelectTrigger id="food">
											<SelectValue
												placeholder={
													isLoadingFoods ? "Loading foods..." : "Select a food"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{isLoadingFoods ? (
												<SelectItem value="loading" disabled>
													Loading foods...
												</SelectItem>
											) : foods.length === 0 ? (
												<SelectItem value="no-foods" disabled>
													No foods available
												</SelectItem>
											) : (
												foods.map((food) => (
													<SelectItem key={food.id} value={food.id}>
														{food.name}
													</SelectItem>
												))
											)}
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
