import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./shared/schema";

// Configure neonConfig to use websockets
neonConfig.webSocketConstructor = ws;

// Verify database connection exists
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a pool lazily
let pool: Pool | null = null;

export function getDb() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return drizzle({ client: pool, schema });
}

// For handling database cleanup
export function closeDb() {
  if (pool) {
    pool.end();
    pool = null;
  }
}

// Handle shutdown gracefully in case this is used in a server context
if (typeof window === 'undefined') {
  process.on('SIGINT', () => {
    closeDb();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    closeDb();
    process.exit(0);
  });
}