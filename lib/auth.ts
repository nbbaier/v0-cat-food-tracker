import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { db } from "./db";
import * as schema from "./db/schema";
import { logAuthSuccess, logSecurityEvent } from "./security-logger";

const baseURL =
	process.env.BETTER_AUTH_URL ??
	(process.env.VERCEL_URL
		? `https://${process.env.VERCEL_URL}`
		: "http://localhost:3000");

export const auth = betterAuth({
	baseURL,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	emailAndPassword: { enabled: true },
	plugins: [],
	trustedOrigins: [
		"http://localhost:3000",
		"https://*.vercel.app",
		process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
		process.env.NEXT_PUBLIC_VERCEL_URL
			? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
			: undefined,
	].filter(Boolean) as string[],
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			if (ctx.path !== "/sign-up/email") return;
			const allowedEmails = [
				"nico.baier@gmail.com",
				"rebeccalmiller13@gmail.com",
			];
			if (!allowedEmails.includes(ctx.body?.email)) {
				// Log blocked sign-up attempt
				logSecurityEvent("auth_signup_blocked", {
					email: ctx.body?.email,
					path: ctx.path,
					ip:
						ctx.request?.headers
							.get("x-forwarded-for")
							?.split(",")[0]
							?.trim() ||
						ctx.request?.headers.get("x-real-ip") ||
						"unknown",
					userAgent: ctx.request?.headers.get("user-agent") || "unknown",
				});
				throw new APIError("BAD_REQUEST", {
					message: "Sorry, you are not allowed to sign up. Be cooler.",
				});
			}
		}),
		after: createAuthMiddleware(async (ctx) => {
			// Log successful authentication events
			if (ctx.path === "/sign-in/email" && ctx.context.returned) {
				const returned = ctx.context.returned as { user?: { id: string; email: string } };
				const user = returned?.user;
				logAuthSuccess({
					path: ctx.path,
					userId: user?.id,
					userEmail: user?.email,
					ip:
						ctx.request?.headers
							.get("x-forwarded-for")
							?.split(",")[0]
							?.trim() ||
						ctx.request?.headers.get("x-real-ip") ||
						"unknown",
					userAgent: ctx.request?.headers.get("user-agent") || "unknown",
				});
			}

			// Log sign-up events
			if (ctx.path === "/sign-up/email" && ctx.context.returned) {
				const returned = ctx.context.returned as { user?: { id: string; email: string } };
				const user = returned?.user;
				logAuthSuccess({
					path: ctx.path,
					userId: user?.id,
					userEmail: user?.email,
					ip:
						ctx.request?.headers
							.get("x-forwarded-for")
							?.split(",")[0]
							?.trim() ||
						ctx.request?.headers.get("x-real-ip") ||
						"unknown",
					userAgent: ctx.request?.headers.get("user-agent") || "unknown",
				});
			}
		}),
	},
});
