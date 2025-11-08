import { createClient } from "@libsql/client"

export function getTursoClient() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error(
      "Missing Turso environment variables. Please add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the Vars section of the sidebar.",
    )
  }

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  return client
}
