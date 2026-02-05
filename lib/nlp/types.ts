import type { FoodSummary } from "@/lib/types";

export type ParseConfidence = "high" | "medium" | "low" | "none";

export type FoodMatch = {
	food: FoodSummary;
	score: number;
};

export type ParsedFood = {
	rawText: string;
	matches: FoodMatch[];
	confidence: ParseConfidence;
};

export type ParsedAmount = {
	rawText: string;
	normalized: string;
	confidence: ParseConfidence;
};

export type ParsedMealTime = {
	value: "morning" | "evening";
	source: "explicit" | "inferred";
	confidence: ParseConfidence;
};

export type ParsedDate = {
	value: string; // YYYY-MM-DD
	source: "explicit" | "inferred";
	confidence: ParseConfidence;
};

export type ParsedSentiment = {
	preference: "likes" | "neutral" | "dislikes" | null;
	rawText: string | null;
	confidence: ParseConfidence;
};

export type ParsedMeal = {
	food: ParsedFood;
	amount: ParsedAmount;
	mealTime: ParsedMealTime;
	date: ParsedDate;
	notes: string | null;
	sentiment: ParsedSentiment;
};
