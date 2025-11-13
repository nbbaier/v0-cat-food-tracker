import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is not set");
}

// Configure postgres-js for serverless environments (Vercel)
// This is more efficient than node-postgres pooling in serverless functions
const client = postgres(connectionString, {
	max: 10,
	idle_timeout: 30,
	connect_timeout: 5,
	prepare: false,
});

export const db = drizzle({ client });
