import type { FoodSummary } from "@/lib/types";
import type { FoodMatch } from "./types";

/**
 * Compute a similarity score between two strings.
 * Uses a combination of token overlap and substring matching.
 * Returns a value between 0 (no match) and 1 (exact match).
 */
function similarityScore(query: string, target: string): number {
	const q = query.toLowerCase().trim();
	const t = target.toLowerCase().trim();

	// Exact match
	if (q === t) return 1;

	// Target contains the full query as a substring
	if (t.includes(q)) {
		// Score based on how much of the target the query covers
		return 0.7 + 0.3 * (q.length / t.length);
	}

	// Query contains the full target as a substring
	if (q.includes(t)) {
		return 0.6 + 0.2 * (t.length / q.length);
	}

	// Token-based matching
	const queryTokens = q.split(/\s+/);
	const targetTokens = t.split(/\s+/);

	let matchedTokens = 0;
	for (const qt of queryTokens) {
		if (
			targetTokens.some(
				(tt) => tt.includes(qt) || qt.includes(tt) || levenshtein(qt, tt) <= 1,
			)
		) {
			matchedTokens++;
		}
	}

	if (queryTokens.length === 0) return 0;
	const tokenScore = matchedTokens / queryTokens.length;

	// Boost if all query tokens matched
	if (matchedTokens === queryTokens.length) {
		return 0.5 + 0.3 * tokenScore;
	}

	return tokenScore * 0.5;
}

/**
 * Simple Levenshtein distance for short strings (typo tolerance).
 */
function levenshtein(a: string, b: string): number {
	if (a.length === 0) return b.length;
	if (b.length === 0) return a.length;

	const matrix: number[][] = [];
	for (let i = 0; i <= a.length; i++) {
		matrix[i] = [i];
	}
	for (let j = 0; j <= b.length; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1,
				matrix[i][j - 1] + 1,
				matrix[i - 1][j - 1] + cost,
			);
		}
	}

	return matrix[a.length][b.length];
}

/**
 * Find the best food matches for a query string from the list of known foods.
 * Returns matches sorted by score (highest first), filtered to score > threshold.
 */
export function matchFoods(
	query: string,
	foods: FoodSummary[],
	threshold = 0.3,
): FoodMatch[] {
	if (!query.trim()) return [];

	return foods
		.map((food) => ({
			food,
			score: similarityScore(query, food.name),
		}))
		.filter((m) => m.score > threshold)
		.sort((a, b) => b.score - a.score);
}

/**
 * Try to extract a food name from the input text by testing progressively
 * smaller windows of consecutive words against the food list.
 *
 * Returns the best match and the text that was matched.
 */
export function extractFoodFromText(
	text: string,
	foods: FoodSummary[],
): { foodText: string; matches: FoodMatch[] } | null {
	const words = text.split(/\s+/);

	// Try windows of decreasing size (longer matches preferred)
	for (
		let windowSize = Math.min(words.length, 6);
		windowSize >= 1;
		windowSize--
	) {
		for (let start = 0; start <= words.length - windowSize; start++) {
			const candidate = words.slice(start, start + windowSize).join(" ");
			const matches = matchFoods(candidate, foods, 0.5);
			if (matches.length > 0 && matches[0].score >= 0.5) {
				return { foodText: candidate, matches };
			}
		}
	}

	// Fallback: try the whole text minus known patterns (amounts, times, etc.)
	const cleaned = text
		.replace(
			/\b(this\s+)?(morning|evening|tonight|breakfast|dinner|yesterday|today|am|pm)\b/gi,
			"",
		)
		.replace(
			/\b(half\s+a?\s*|a\s+|(\d+\/?\d*)\s*)(cans?|cups?|pouche?s?|g|ml|oz|lb|kg|tbsp|tsp)\b/gi,
			"",
		)
		.replace(
			/\b(she|he|they|it|cat)\s+(loved?|hated?|ate|refused|gobbled|devoured|finished|liked|enjoyed|ignored|left)\b/gi,
			"",
		)
		.replace(
			/\b(loved?|hated?|refused|gobbled|devoured|enjoyed|ignored)\s+(it|that)\b/gi,
			"",
		)
		.replace(/[,.]*/g, "")
		.replace(/\s+/g, " ")
		.trim();

	if (cleaned.length >= 2) {
		const matches = matchFoods(cleaned, foods, 0.3);
		if (matches.length > 0) {
			return { foodText: cleaned, matches };
		}
		// No match found - return the cleaned text as an unmatched food name
		return { foodText: cleaned, matches: [] };
	}

	return null;
}
