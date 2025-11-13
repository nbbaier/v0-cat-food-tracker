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
