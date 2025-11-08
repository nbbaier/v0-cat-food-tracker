import { createClient } from "@libsql/client"

let client: ReturnType<typeof createClient> | null = null

export function getDbClient() {
  if (!client) {
    console.log("[v0] Turso DB Client - Initializing for the first time")
    console.log("[v0] Environment check:")
    console.log("[v0]   TURSO_DATABASE_URL exists:", !!process.env.TURSO_DATABASE_URL)
    console.log("[v0]   TURSO_DATABASE_URL value:", process.env.TURSO_DATABASE_URL)
    console.log("[v0]   TURSO_DATABASE_URL length:", process.env.TURSO_DATABASE_URL?.length || 0)
    console.log("[v0]   TURSO_AUTH_TOKEN exists:", !!process.env.TURSO_AUTH_TOKEN)
    console.log("[v0]   TURSO_AUTH_TOKEN length:", process.env.TURSO_AUTH_TOKEN?.length || 0)
    console.log("[v0]   TURSO_AUTH_TOKEN first 10 chars:", process.env.TURSO_AUTH_TOKEN?.substring(0, 10) || "N/A")

    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      const errorMsg = "Missing Turso environment variables: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN"
      console.error("[v0]", errorMsg)
      throw new Error(errorMsg)
    }

    try {
      console.log("[v0] Calling createClient with config:", {
        url: process.env.TURSO_DATABASE_URL,
        authTokenProvided: !!process.env.TURSO_AUTH_TOKEN,
        authTokenLength: process.env.TURSO_AUTH_TOKEN.length,
      })

      client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })

      console.log("[v0] Turso client created successfully")
      console.log("[v0] Client object type:", typeof client)
      console.log("[v0] Client has execute method:", typeof client.execute === "function")
    } catch (error) {
      console.error("[v0] Failed to create Turso client:")
      console.error("[v0] Error type:", error?.constructor?.name)
      console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
      console.error("[v0] Error stack:", error instanceof Error ? error.stack : undefined)
      throw error
    }
  } else {
    console.log("[v0] Turso DB Client - Reusing existing client")
  }
  return client
}
