import { db } from "../database.js";

export async function findByUsername(username: string) {
  const result = await db.query(
    "SELECT id, username, password, created_at FROM users WHERE username = $1",
    [username],
  );
  return result.rows[0];
}

export async function create(username: string, passwordHash: string) {
  const result = await db.query(
    "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at",
    [username, passwordHash],
  );
  return result.rows[0];
}

export async function findById(id: number) {
  const result = await db.query(
    "SELECT id, username, created_at FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0];
}
