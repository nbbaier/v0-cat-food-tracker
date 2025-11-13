"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FoodForm } from "@/components/foods/food-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
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
import type { MealMutationResult } from "@/hooks/use-meal-mutations";
import type { FoodInput, MealInput } from "@/lib/types";
import { getDateString } from "@/lib/utils";
import { mealInputSchema } from "@/lib/validations";

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
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (open) {
			setActiveTab(defaultTab);
			setErrors({});
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
		setErrors({});

		const mealData = {
			mealDate,
			mealTime,
			foodId,
			amount: amount.trim(),
			notes: mealNotes.trim() || undefined,
		};

		const result = mealInputSchema.safeParse(mealData);
		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as string;
				fieldErrors[field] = issue.message;
			}
			setErrors(fieldErrors);
			return;
		}

		try {
			const response = await onAddMeal(result.data as MealInput);

			if (
				response !== undefined &&
				response !== null &&
				typeof response === "object" &&
				"success" in response
			) {
				const mealResult = response as MealMutationResult;
				if (
					!mealResult.success &&
					"errors" in mealResult &&
					mealResult.errors
				) {
					setErrors(mealResult.errors);
					return;
				}
				if (mealResult.success) {
					setMealDate(getDateString());
					setMealTime("morning");
					setFoodId("");
					setAmount("");
					setMealNotes("");
					setErrors({});
				}
			} else {
				setMealDate(getDateString());
				setMealTime("morning");
				setFoodId("");
				setAmount("");
				setMealNotes("");
				setErrors({});
			}
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
										onChange={(e) => {
											setMealDate(e.target.value);
											if (errors.mealDate) {
												setErrors((prev) => {
													const next = { ...prev };
													delete next.mealDate;
													return next;
												});
											}
										}}
										autoFocus
										aria-invalid={!!errors.mealDate}
									/>
									{errors.mealDate && (
										<FieldError>{errors.mealDate}</FieldError>
									)}
								</div>

								<div className="space-y-3">
									<Label>Meal Time</Label>
									<RadioGroup
										value={mealTime}
										onValueChange={(v) => {
											setMealTime(v as "morning" | "evening");
											if (errors.mealTime) {
												setErrors((prev) => {
													const next = { ...prev };
													delete next.mealTime;
													return next;
												});
											}
										}}
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
									{errors.mealTime && (
										<FieldError>{errors.mealTime}</FieldError>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="food">Food</Label>
									<Select
										value={foodId}
										onValueChange={(value) => {
											setFoodId(value);
											if (errors.foodId) {
												setErrors((prev) => {
													const next = { ...prev };
													delete next.foodId;
													return next;
												});
											}
										}}
										disabled={isLoadingFoods}
									>
										<SelectTrigger id="food" aria-invalid={!!errors.foodId}>
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
									{errors.foodId && <FieldError>{errors.foodId}</FieldError>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="amount">Amount</Label>
									<Input
										id="amount"
										placeholder='e.g., "1 can", "1/2 cup", "50g"'
										value={amount}
										onChange={(e) => {
											setAmount(e.target.value);
											if (errors.amount) {
												setErrors((prev) => {
													const next = { ...prev };
													delete next.amount;
													return next;
												});
											}
										}}
										aria-invalid={!!errors.amount}
									/>
									{errors.amount && <FieldError>{errors.amount}</FieldError>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="mealNotes">Notes (optional)</Label>
									<Textarea
										id="mealNotes"
										placeholder="Any observations..."
										value={mealNotes}
										onChange={(e) => {
											setMealNotes(e.target.value);
											if (errors.notes) {
												setErrors((prev) => {
													const next = { ...prev };
													delete next.notes;
													return next;
												});
											}
										}}
										rows={3}
										aria-invalid={!!errors.notes}
									/>
									{errors.notes && <FieldError>{errors.notes}</FieldError>}
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
								<Button type="submit">Log Meal</Button>
							</div>
						</form>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
