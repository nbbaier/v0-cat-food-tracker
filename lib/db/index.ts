import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is not set");
}

// Configure postgres-js for serverless environments (Vercel)
// This is more efficient than node-postgres pooling in serverless functions
const client = postgres(connectionString, {
	max: 10, // Maximum number of connections
	idle_timeout: 30, // Close idle connections after 30 seconds
	connect_timeout: 10, // Fail fast if DB is overloaded (10 seconds)
	prepare: false, // Disable prepared statements for better serverless compatibility
});

export const db = drizzle({ client });
