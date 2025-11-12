import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

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
});
