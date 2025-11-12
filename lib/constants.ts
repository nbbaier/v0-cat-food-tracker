/**
 * Centralized error messages and constants
 */

export const ERROR_MESSAGES = {
	FETCH_FAILED: (resource: string) =>
		`Failed to load ${resource}. Please try again.`,
	CONNECTION_ERROR: "Unable to connect to server. Please check your connection.",
	DELETE_FAILED: (resource: string) =>
		`Failed to delete ${resource}. Please try again.`,
	UPDATE_FAILED: (resource: string) =>
		`Failed to update ${resource}. Please try again.`,
	ADD_FAILED: (resource: string) =>
		`Failed to add ${resource}. Please try again.`,
} as const;

export const SUCCESS_MESSAGES = {
	ADDED: (resource: string, name?: string) =>
		name ? `Added ${name} successfully!` : `${resource} added successfully!`,
	UPDATED: (resource: string) => `${resource} updated successfully!`,
	DELETED: (resource: string, name?: string) =>
		name
			? `Deleted ${name} successfully!`
			: `${resource} deleted successfully!`,
} as const;
