import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getDateString(date: Date = new Date()): string {
	return date.toISOString().split("T")[0];
}

export function parseValidationErrors(
	details: string[] | undefined,
): Record<string, string> {
	if (!details || !Array.isArray(details)) {
		return {};
	}

	const errors: Record<string, string> = {};
	for (const detail of details) {
		const match = detail.match(/^([^:]+):\s*(.+)$/);
		if (match) {
			const [, field, message] = match;
			errors[field.trim()] = message.trim();
		}
	}
	return errors;
}

export function safeLogError(context: string, error: unknown): void {
	if (process.env.NODE_ENV === "development") {
		console.error(`[${context}]`, error);
	} else {
		const sanitizedError =
			error instanceof Error
				? { name: error.name, message: error.message }
				: { type: typeof error, value: String(error) };
		console.error(`[${context}]`, sanitizedError);
	}
}

export function getErrorDetails(error: unknown): string | undefined {
	if (process.env.NODE_ENV === "development") {
		return error instanceof Error ? error.message : String(error);
	}
	return undefined;
}

/**
 * Sanitizes error messages for client responses to prevent information disclosure.
 * Maps known error patterns to safe, user-friendly messages.
 * Always logs the full error internally for debugging.
 *
 * @param error - The error to sanitize
 * @param context - Context for logging (e.g., "GET /api/foods")
 * @returns A safe, generic error message for client consumption
 */
export function sanitizeErrorForClient(
	error: unknown,
	context: string,
): string {
	// Log the full error internally for debugging
	safeLogError(context, error);

	// In development, we can be more permissive (but still sanitized)
	if (process.env.NODE_ENV === "development") {
		if (error instanceof Error) {
			// Still sanitize sensitive patterns even in development
			const message = error.message;

			// Remove potential credentials, tokens, or secrets
			if (
				message.match(
					/api[_-]?key|token|secret|password|credential|bearer|authorization|private[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token/i,
				)
			) {
				return "Authentication service temporarily unavailable";
			}

			// Check for database errors
			if (
				message.match(/database|sql|postgres|connection/i) ||
				error.name === "PostgresError"
			) {
				return "Database operation failed";
			}

			// Return the message but truncated to prevent stack traces
			return message.split("\n")[0].slice(0, 200);
		}
		return "An unexpected error occurred";
	}

	// In production, use generic messages mapped from error patterns
	if (error instanceof Error) {
		const message = error.message.toLowerCase();

		// Database/ORM errors
		if (
			message.includes("database") ||
			message.includes("postgres") ||
			message.includes("drizzle") ||
			message.includes("connection") ||
			error.name === "PostgresError"
		) {
			return "A database error occurred. Please try again.";
		}

		// Authentication errors
		if (
			message.includes("auth") ||
			message.includes("unauthorized") ||
			message.includes("token") ||
			message.includes("session")
		) {
			return "Authentication error. Please sign in again.";
		}

		// Network/API errors
		if (
			message.includes("fetch") ||
			message.includes("network") ||
			message.includes("timeout")
		) {
			return "Network error. Please check your connection and try again.";
		}

		// GitHub API errors
		if (message.includes("github")) {
			return "External service temporarily unavailable";
		}
	}

	// Default generic message
	return "An unexpected error occurred. Please try again.";
}
