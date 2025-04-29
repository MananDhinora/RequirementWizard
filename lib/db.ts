import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./shared/schema";

// Configure neonConfig to use websockets
neonConfig.webSocketConstructor = ws;

// Only instantiate the DB client if we're in a server context
let pool: Pool | undefined;
let db: ReturnType<typeof drizzle> | undefined;

if (typeof window === 'undefined') {
  // Verify database connection exists
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  // Create connection pool
  pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Initialize Drizzle with our schema
  db = drizzle({ client: pool, schema });
}

// For SSR - only execute in server context
export function getDb() {
  if (!db) {
    throw new Error('Database connection not initialized');
  }
  return db;
}

// For cleanup - used by API routes
export function closeDb() {
  if (pool) {
    pool.end();
  }
}

// For handling database cleanup on application shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', () => {
    if (pool) pool.end();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    if (pool) pool.end();
    process.exit(0);
  });
}