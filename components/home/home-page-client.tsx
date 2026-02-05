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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NlpMealInput } from "@/components/home/nlp-meal-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFoodSummaries } from "@/hooks/use-food-summaries";
import type { Food, FoodSummary, Meal } from "@/lib/types";

type LastMealInfo = {
	meal: Meal;
	food: FoodSummary;
} | null;

export function HomePageClient() {
	const { refresh } = useFoodSummaries(true);

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
			} catch (error) {
				console.error("Failed to fetch last meal:", error);
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

	const handleMealLogged = (meal: {
		id: string;
		mealDate: string;
		mealTime: "morning" | "evening";
		foodId: string;
		food: {
			id: string;
			name: string;
			preference: "likes" | "neutral" | "dislikes" | "unknown";
		};
		amount: string;
		notes: string;
		createdAt: string;
		updatedAt: string;
	}) => {
		setLastMeal({
			meal,
			food: meal.food,
		});
		setFeedbackGiven(false);
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

			{/* NLP meal input */}
			<NlpMealInput onMealLogged={handleMealLogged} />

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
