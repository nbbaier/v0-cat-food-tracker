import type { FoodSummary } from "@/lib/types";
import { getDateString } from "@/lib/utils";
import { extractFoodFromText } from "./fuzzy-match";
import type {
	ParseConfidence,
	ParsedAmount,
	ParsedDate,
	ParsedMeal,
	ParsedMealTime,
	ParsedSentiment,
} from "./types";

// ---------------------------------------------------------------------------
// Amount extraction
// ---------------------------------------------------------------------------

type AmountPattern = {
	pattern: RegExp;
	normalize: (match: RegExpMatchArray) => string;
};

const AMOUNT_PATTERNS: AmountPattern[] = [
	// "half a can", "half can"
	{
		pattern: /\bhalf\s+(?:a\s+)?(can|cup|pouch|packet|sachet|bowl)\b/i,
		normalize: (m) => `1/2 ${m[1].toLowerCase()}`,
	},
	// "a can", "a cup", "a pouch"
	{
		pattern: /\ba\s+(can|cup|pouch|packet|sachet|bowl)\b/i,
		normalize: (m) => `1 ${m[1].toLowerCase()}`,
	},
	// "2 cans", "1.5 cups", "3 pouches"
	{
		pattern:
			/\b(\d+(?:\.\d+)?)\s*(cans?|cups?|pouche?s?|packets?|sachets?|bowls?|g|ml|oz|lb|kg|tbsp|tsp)\b/i,
		normalize: (m) => {
			const unit = m[2].toLowerCase().replace(/s$/, "").replace(/che$/, "ch");
			const num = m[1];
			return `${num} ${unit}`;
		},
	},
	// "1/2 can", "3/4 cup"
	{
		pattern:
			/\b(\d+\/\d+)\s*(cans?|cups?|pouche?s?|packets?|sachets?|bowls?|g|ml|oz|lb|kg|tbsp|tsp)\b/i,
		normalize: (m) => {
			const unit = m[2].toLowerCase().replace(/s$/, "").replace(/che$/, "ch");
			return `${m[1]} ${unit}`;
		},
	},
	// "couple cans", "couple of cans"
	{
		pattern:
			/\bcouple\s+(?:of\s+)?(cans?|cups?|pouche?s?|packets?|sachets?|bowls?)\b/i,
		normalize: (m) => {
			const unit = m[1].toLowerCase().replace(/s$/, "").replace(/che$/, "ch");
			return `2 ${unit}`;
		},
	},
];

function extractAmount(text: string): ParsedAmount {
	for (const { pattern, normalize } of AMOUNT_PATTERNS) {
		const match = text.match(pattern);
		if (match) {
			return {
				rawText: match[0],
				normalized: normalize(match),
				confidence: "high",
			};
		}
	}

	return {
		rawText: "",
		normalized: "",
		confidence: "none",
	};
}

// ---------------------------------------------------------------------------
// Meal time extraction
// ---------------------------------------------------------------------------

const MORNING_PATTERNS = /\b(morning|breakfast|this\s+am|this\s+morning)\b/i;
const EVENING_PATTERNS =
	/\b(evening|dinner|tonight|this\s+pm|this\s+evening|supper|night)\b/i;

function extractMealTime(text: string): ParsedMealTime {
	if (MORNING_PATTERNS.test(text)) {
		return { value: "morning", source: "explicit", confidence: "high" };
	}

	if (EVENING_PATTERNS.test(text)) {
		return { value: "evening", source: "explicit", confidence: "high" };
	}

	// Infer from current time
	const hour = new Date().getHours();
	return {
		value: hour < 14 ? "morning" : "evening",
		source: "inferred",
		confidence: "medium",
	};
}

// ---------------------------------------------------------------------------
// Date extraction
// ---------------------------------------------------------------------------

function extractDate(text: string): ParsedDate {
	const today = new Date();

	if (/\byesterday\b/i.test(text)) {
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		return {
			value: getDateString(yesterday),
			source: "explicit",
			confidence: "high",
		};
	}

	if (/\b(today|this\s+morning|this\s+evening|tonight)\b/i.test(text)) {
		return {
			value: getDateString(today),
			source: "explicit",
			confidence: "high",
		};
	}

	// Default to today
	return {
		value: getDateString(today),
		source: "inferred",
		confidence: "medium",
	};
}

// ---------------------------------------------------------------------------
// Sentiment extraction
// ---------------------------------------------------------------------------

const POSITIVE_PATTERNS =
	/\b(loved?|loves?|gobbled|devoured|favorite|favourite|enjoyed|couldn't get enough|yum|gobbled\s+up|wolfed|ate\s+it\s+all|licked\s+the\s+bowl)\b/i;
const NEGATIVE_PATTERNS =
	/\b(hated?|hates?|refused?|wouldn't\s+eat|wouldn't\s+touch|ignored?|left\s+most|didn't\s+eat|didn't\s+like|spit|turned\s+away|didn't\s+touch)\b/i;
const NEUTRAL_PATTERNS =
	/\b(ate|finished|had|ok|fine|seemed\s+fine|meh|whatever|picked\s+at)\b/i;

function extractSentiment(text: string): ParsedSentiment {
	const posMatch = text.match(POSITIVE_PATTERNS);
	if (posMatch) {
		return {
			preference: "likes",
			rawText: posMatch[0],
			confidence: "high",
		};
	}

	const negMatch = text.match(NEGATIVE_PATTERNS);
	if (negMatch) {
		return {
			preference: "dislikes",
			rawText: negMatch[0],
			confidence: "high",
		};
	}

	const neutralMatch = text.match(NEUTRAL_PATTERNS);
	if (neutralMatch) {
		return {
			preference: "neutral",
			rawText: neutralMatch[0],
			confidence: "medium",
		};
	}

	return {
		preference: null,
		rawText: null,
		confidence: "none",
	};
}

// ---------------------------------------------------------------------------
// Notes extraction
// ---------------------------------------------------------------------------

/**
 * Extract notes/commentary from the input that isn't part of the structured data.
 * This captures sentiment phrases and other commentary as notes.
 */
function extractNotes(text: string, sentiment: ParsedSentiment): string | null {
	if (!sentiment.rawText) return null;

	// Look for phrases around the sentiment word
	const sentimentPatterns = [
		// "she loved it", "he hated it", "cat gobbled it"
		/\b(?:she|he|they|it|cat|kitty)\s+\w+(?:\s+(?:it|that|this))?\b/i,
		// "wouldn't eat it", "didn't touch it"
		/\b(?:wouldn't|didn't|won't|doesn't)\s+\w+(?:\s+(?:it|that|this))?\b/i,
		// "loved it", "gobbled it up"
		/\b\w+(?:ed|es|s)\s+(?:it|that|this)(?:\s+(?:up|down|all))?\b/i,
	];

	for (const pattern of sentimentPatterns) {
		const match = text.match(pattern);
		if (match) return match[0];
	}

	return sentiment.rawText;
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

function overallConfidence(...confidences: ParseConfidence[]): ParseConfidence {
	if (confidences.includes("none")) return "low";
	if (confidences.every((c) => c === "high")) return "high";
	if (confidences.some((c) => c === "low")) return "low";
	return "medium";
}

/**
 * Parse natural language meal input into structured data.
 */
export function parseMealInput(
	input: string,
	foods: FoodSummary[],
): ParsedMeal {
	const text = input.trim();

	const amount = extractAmount(text);
	const mealTime = extractMealTime(text);
	const date = extractDate(text);
	const sentiment = extractSentiment(text);
	const notes = extractNotes(text, sentiment);

	// Extract food name (the trickiest part)
	const foodResult = extractFoodFromText(text, foods);

	const foodConfidence: ParseConfidence = foodResult
		? foodResult.matches.length > 0
			? foodResult.matches[0].score >= 0.7
				? "high"
				: "medium"
			: "low"
		: "none";

	return {
		food: {
			rawText: foodResult?.foodText ?? text,
			matches: foodResult?.matches ?? [],
			confidence: foodConfidence,
		},
		amount,
		mealTime,
		date,
		notes,
		sentiment,
	};
}

/**
 * Compute an overall confidence level for the parsed meal.
 * Used to determine if we need user confirmation or can auto-submit.
 */
export function getParsedMealConfidence(parsed: ParsedMeal): ParseConfidence {
	return overallConfidence(
		parsed.food.confidence,
		parsed.amount.confidence,
		parsed.mealTime.confidence,
		parsed.date.confidence,
	);
}
