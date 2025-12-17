"use client";

import {
	HelpCircle,
	History,
	Minus,
	Package,
	ThumbsDown,
	ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FoodCombobox } from "@/components/home/food-combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useFoodSummaries } from "@/hooks/use-food-summaries";
import type { Food, FoodSummary, Meal, MealInput } from "@/lib/types";
import { getDateString } from "@/lib/utils";
import { mealInputSchema } from "@/lib/validations";

function getSmartMealTime(): "morning" | "evening" {
	const hour = new Date().getHours();
	return hour < 14 ? "morning" : "evening";
}

type LastMealInfo = {
	meal: Meal;
	food: FoodSummary;
} | null;

export function HomePageClient() {
	const { foods, isLoading: isLoadingFoods, refresh } = useFoodSummaries(true);

	const [mealDate, setMealDate] = useState(getDateString());
	const [mealTime, setMealTime] = useState<"morning" | "evening">(
		getSmartMealTime(),
	);
	const [foodId, setFoodId] = useState("");
	const [amount, setAmount] = useState("");
	const [notes, setNotes] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [lastMeal, setLastMeal] = useState<LastMealInfo>(null);
	const [feedbackGiven, setFeedbackGiven] = useState(false);
	const [isLoadingLastMeal, setIsLoadingLastMeal] = useState(true);

	useEffect(() => {
		async function fetchLastMeal() {
			try {
				const res = await fetch("/api/meals?limit=1");
				if (res.ok) {
					const data = await res.json();
					if (data.meals?.length > 0) {
						const meal = data.meals[0];
						setLastMeal({ meal, food: meal.food });
					}
				}
			} catch {
				// silent fail
			} finally {
				setIsLoadingLastMeal(false);
			}
		}
		fetchLastMeal();
	}, []);

	const handleFeedback = async (preference: Food["preference"]) => {
		if (!lastMeal) return;
		try {
			const res = await fetch(`/api/foods/${lastMeal.food.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ preference }),
			});
			if (!res.ok) {
				const error = await res.json();
				toast.error(error.error || "Failed to save feedback");
				return;
			}
			setFeedbackGiven(true);
			toast.success(`Marked as ${preference}`);
			refresh();
		} catch {
			toast.error("Failed to save feedback");
		}
	};

	const handleCreateFood = useCallback(
		async (name: string) => {
			try {
				const res = await fetch("/api/foods", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name,
						preference: "unknown",
						notes: "",
						inventoryQuantity: 0,
					}),
				});
				if (res.ok) {
					const newFood = await res.json();
					toast.success(`Added "${name}"`);
					refresh();
					setFoodId(newFood.id);
				} else {
					toast.error("Failed to add food");
				}
			} catch {
				toast.error("Connection error");
			}
		},
		[refresh],
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const mealData: MealInput = {
			mealDate,
			mealTime,
			foodId,
			amount: amount.trim(),
			notes: notes.trim() || undefined,
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

		setIsSubmitting(true);
		try {
			const res = await fetch("/api/meals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(result.data),
			});

			if (res.ok) {
				const newMeal = await res.json();
				toast.success("Meal logged");
				setLastMeal({ meal: newMeal, food: newMeal.food });
				setFeedbackGiven(false);
				setFoodId("");
				setAmount("");
				setNotes("");
				setMealTime(getSmartMealTime());
				setMealDate(getDateString());
			} else {
				const err = await res.json();
				if (err.details) {
					toast.error(err.details.join(", "));
				} else {
					toast.error(err.error || "Failed to log meal");
				}
			}
		} catch {
			toast.error("Connection error");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto max-w-lg space-y-6 p-4">
			{/* last meal feedback */}
			{!isLoadingLastMeal && lastMeal && !feedbackGiven && (
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">
							How was {lastMeal.food.name}?
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							{lastMeal.meal.mealTime} · {lastMeal.meal.amount}
						</p>
					</CardHeader>
					<CardContent>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleFeedback("likes")}
								className="flex-1"
							>
								<ThumbsUp className="size-4 text-success" />
								Liked
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleFeedback("neutral")}
								className="flex-1"
							>
								<Minus className="size-4 text-warning" />
								Meh
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleFeedback("dislikes")}
								className="flex-1"
							>
								<ThumbsDown className="size-4 text-destructive" />
								Nope
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setFeedbackGiven(true)}
								className="px-2"
							>
								<HelpCircle className="size-4 text-muted-foreground" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* meal form */}
			<Card>
				<CardHeader>
					<CardTitle>Log Meal</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="mealDate">Date</Label>
								<Input
									id="mealDate"
									type="date"
									value={mealDate}
									onChange={(e) => setMealDate(e.target.value)}
									aria-invalid={!!errors.mealDate}
								/>
								{errors.mealDate && <FieldError>{errors.mealDate}</FieldError>}
							</div>

							<div className="space-y-2">
								<Label>Time</Label>
								<RadioGroup
									value={mealTime}
									onValueChange={(v) => setMealTime(v as "morning" | "evening")}
									className="flex gap-4 pt-2"
								>
									<div className="flex items-center gap-1.5">
										<RadioGroupItem value="morning" id="morning" />
										<Label htmlFor="morning" className="font-normal text-sm">
											AM
										</Label>
									</div>
									<div className="flex items-center gap-1.5">
										<RadioGroupItem value="evening" id="evening" />
										<Label htmlFor="evening" className="font-normal text-sm">
											PM
										</Label>
									</div>
								</RadioGroup>
								{errors.mealTime && <FieldError>{errors.mealTime}</FieldError>}
							</div>
						</div>

						<div className="space-y-2">
							<Label>Food</Label>
							<FoodCombobox
								foods={foods}
								value={foodId}
								onChange={setFoodId}
								onCreateNew={handleCreateFood}
								isLoading={isLoadingFoods}
								error={errors.foodId}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="amount">Amount</Label>
							<Input
								id="amount"
								placeholder="1 can, 50g, 1/2 cup..."
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								aria-invalid={!!errors.amount}
							/>
							{errors.amount && <FieldError>{errors.amount}</FieldError>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="notes">Notes (optional)</Label>
							<Textarea
								id="notes"
								placeholder="Any observations..."
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								rows={2}
							/>
							{errors.notes && <FieldError>{errors.notes}</FieldError>}
						</div>

						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Log Meal"}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* secondary nav */}
			<div className="flex gap-2">
				<Button variant="outline" className="flex-1" asChild>
					<Link href="/meals">
						<History className="size-4" />
						Meal History
					</Link>
				</Button>
				<Button variant="outline" className="flex-1" asChild>
					<Link href="/foods">
						<Package className="size-4" />
						Foods
					</Link>
				</Button>
			</div>
		</div>
	);
}
