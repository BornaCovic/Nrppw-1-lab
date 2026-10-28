import { randomUUID } from "crypto";
import { Pool, PoolConfig } from "pg";

const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.DATABASE_SSL === "true") {
  config.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(config);

interface Pass {
  id: string;
  name: string;
  document: string;
  issued_at: Date;
  status: string;
}

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

export async function countAll(): Promise<number> {
  const result = await pool.query("SELECT COUNT(*) AS count FROM passes");
  return Number(result.rows[0].count);
}

export async function countActive(): Promise<number> {
  const result = await pool.query("SELECT COUNT(*) AS count FROM passes WHERE status = 'ACTIVE'");
  return Number(result.rows[0].count);
}

export async function getPass(id: string): Promise<Pass | null> {
  const result = await pool.query("SELECT * FROM passes WHERE id::text = $1", [id]);
  if (result.rows.length === 0) {
    return null;
  }
  const pass: Pass = result.rows[0];
  return pass;
}

export async function createPass(name: string, document: string): Promise<string> {
  const id = randomUUID();
  await pool.query(
    "INSERT INTO passes (id, name, document, issued_at, status) VALUES ($1, $2, $3, $4, $5)",
    [id, name, document, new Date(), "ACTIVE"]
  );
  return id;
}

export async function listPasses(): Promise<Pass[]> {
  const result = await pool.query("SELECT * FROM passes ORDER BY issued_at DESC");
  const passes: Pass[] = result.rows;
  return passes;
}

export async function cancelPass(id: string): Promise<void> {
  await pool.query("UPDATE passes SET status = 'CANCELLED' WHERE id::text = $1", [id]);
}

export async function deletePass(id: string): Promise<void> {
  await pool.query("DELETE FROM passes WHERE id::text = $1", [id]);
}
