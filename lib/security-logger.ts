/**
 * Security audit logging utilities
 *
 * Provides structured logging for security-relevant events including:
 * - Authentication events (success/failure)
 * - Authorization failures
 * - Data modifications
 * - Rate limit violations
 */

export type SecurityEventType =
	| "auth_success"
	| "auth_failed"
	| "auth_signup_blocked"
	| "unauthorized_access"
	| "data_created"
	| "data_updated"
	| "data_deleted"
	| "validation_error"
	| "rate_limit_exceeded";

export interface SecurityEventContext {
	/** Request path */
	path?: string;
	/** HTTP method */
	method?: string;
	/** Client IP address */
	ip?: string;
	/** User agent string */
	userAgent?: string;
	/** User ID if authenticated */
	userId?: string;
	/** User email if authenticated */
	userEmail?: string;
	/** Resource type being accessed */
	resourceType?: string;
	/** Resource ID being accessed */
	resourceId?: string;
	/** Additional context */
	[key: string]: unknown;
}

/**
 * Log a security-relevant event with structured data
 *
 * @param event - Type of security event
 * @param context - Additional context about the event
 */
export function logSecurityEvent(
	event: SecurityEventType,
	context: SecurityEventContext = {},
): void {
	const logEntry = {
		level: "security",
		event,
		timestamp: new Date().toISOString(),
		...context,
	};

	// In production, this could be sent to a logging service
	// For now, we use structured console logging
	console.log(JSON.stringify(logEntry));
}

/**
 * Log a failed authentication attempt
 */
export function logAuthFailure(context: SecurityEventContext): void {
	logSecurityEvent("auth_failed", context);
}

/**
 * Log a successful authentication
 */
export function logAuthSuccess(context: SecurityEventContext): void {
	logSecurityEvent("auth_success", context);
}

/**
 * Log an unauthorized access attempt
 */
export function logUnauthorizedAccess(context: SecurityEventContext): void {
	logSecurityEvent("unauthorized_access", context);
}

/**
 * Log a data creation event
 */
export function logDataCreation(context: SecurityEventContext): void {
	logSecurityEvent("data_created", context);
}

/**
 * Log a data update event
 */
export function logDataUpdate(context: SecurityEventContext): void {
	logSecurityEvent("data_updated", context);
}

/**
 * Log a data deletion event
 */
export function logDataDeletion(context: SecurityEventContext): void {
	logSecurityEvent("data_deleted", context);
}

/**
 * Extract security context from Next.js request headers
 */
export function getSecurityContext(
	request: Request,
	additionalContext: Partial<SecurityEventContext> = {},
): SecurityEventContext {
	const url = new URL(request.url);
	return {
		path: url.pathname,
		method: request.method,
		ip:
			request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			request.headers.get("x-real-ip") ||
			"unknown",
		userAgent: request.headers.get("user-agent") || "unknown",
		...additionalContext,
	};
}
