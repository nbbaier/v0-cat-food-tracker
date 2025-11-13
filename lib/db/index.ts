import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
	connectionString: connectionString,
	max: 10,
	idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
	connectionTimeoutMillis: 10000, // Fail fast if DB is overloaded
});

export const db = drizzle({ client: pool });
