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
