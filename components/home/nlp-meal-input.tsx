"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ParsedMealCard } from "@/components/home/parsed-meal-card";
import { Button } from "@/components/ui/button";
import {
	invalidateFoodSummariesCache,
	useFoodSummaries,
} from "@/hooks/use-food-summaries";
import { parseMealInput } from "@/lib/nlp/meal-parser";
import type { ParsedMeal } from "@/lib/nlp/types";
import type { MealInput } from "@/lib/types";

type NlpMealInputProps = {
	onMealLogged: (meal: {
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
	}) => void;
};

export function NlpMealInput({ onMealLogged }: NlpMealInputProps) {
	const { foods, isLoading: isLoadingFoods, refresh } = useFoodSummaries(true);
	const [input, setInput] = useState("");
	const [parsed, setParsed] = useState<ParsedMeal | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const handleParse = useCallback(() => {
		const trimmed = input.trim();
		if (!trimmed) return;

		const result = parseMealInput(trimmed, foods);
		setParsed(result);
	}, [input, foods]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleParse();
		}
	};

	const handleConfirm = async (data: {
		foodId: string;
		amount: string;
		mealTime: "morning" | "evening";
		mealDate: string;
		notes?: string;
		newFoodName?: string;
	}) => {
		setIsSubmitting(true);

		try {
			let foodId = data.foodId;

			// Create new food if needed
			if (!foodId && data.newFoodName) {
				const foodRes = await fetch("/api/foods", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: data.newFoodName,
						preference: parsed?.sentiment.preference ?? "unknown",
						notes: "",
						inventoryQuantity: 0,
					}),
				});

				if (!foodRes.ok) {
					const err = await foodRes.json().catch(() => ({}));
					toast.error(err.error || "Failed to create food");
					setIsSubmitting(false);
					return;
				}

				const newFood = await foodRes.json();
				foodId = newFood.id;
				invalidateFoodSummariesCache();
				refresh();
			}

			// Create the meal
			const mealData: MealInput = {
				mealDate: data.mealDate,
				mealTime: data.mealTime,
				foodId,
				amount: data.amount,
				notes: data.notes,
			};

			const res = await fetch("/api/meals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(mealData),
			});

			if (res.ok) {
				const meal = await res.json();
				toast.success("Meal logged");
				setParsed(null);
				setInput("");
				onMealLogged(meal);
				inputRef.current?.focus();

				// Update food preference if sentiment was detected
				if (parsed?.sentiment.preference && foodId) {
					try {
						await fetch(`/api/foods/${foodId}`, {
							method: "PATCH",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								preference: parsed.sentiment.preference,
							}),
						});
						refresh();
					} catch {
						// Non-critical, don't block on this
					}
				}
			} else {
				const err = await res.json().catch(() => ({}));
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

	const handleCancel = () => {
		setParsed(null);
		inputRef.current?.focus();
	};

	return (
		<div className="space-y-4">
			{/* Input area */}
			{!parsed && (
				<div className="space-y-3">
					<div className="relative">
						<textarea
							ref={inputRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={
								isLoadingFoods
									? "Loading foods..."
									: 'What did you feed your cat?\ne.g. "half can fancy feast this morning"'
							}
							disabled={isLoadingFoods}
							rows={2}
							className="flex w-full rounded-xl border border-input bg-background px-4 py-3 pr-12 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
						/>
						<Button
							type="button"
							size="icon"
							variant="ghost"
							onClick={handleParse}
							disabled={!input.trim() || isLoadingFoods}
							className="absolute right-2 bottom-2 size-8 rounded-lg"
							aria-label="Parse meal input"
						>
							{isLoadingFoods ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<ArrowRight className="size-4" />
							)}
						</Button>
					</div>
					<p className="text-xs text-muted-foreground text-center">
						Press{" "}
						<kbd className="rounded border px-1 py-0.5 text-[10px]">Enter</kbd>{" "}
						to parse
					</p>
				</div>
			)}

			{/* Parsed result */}
			{parsed && (
				<ParsedMealCard
					parsed={parsed}
					foods={foods}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
					isSubmitting={isSubmitting}
				/>
			)}
		</div>
	);
}
