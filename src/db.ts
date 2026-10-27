import { Pool, PoolConfig } from "pg";

const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.DATABASE_SSL === "true") {
  config.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(config);

export async function createTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS passes (
      id UUID PRIMARY KEY,
      name VARCHAR,
      document VARCHAR,
      issued_at TIMESTAMPTZ,
      status VARCHAR
    )
  `);
}
