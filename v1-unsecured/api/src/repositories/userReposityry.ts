import { warn } from "node:console";
import { db } from "../database.js";

export async function findUserByUsername(username: string) {
  const result = await db.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return result.rows[0];
}

export async function createUser(username: string, password: string) {
  const result = await db.query(
    `INSERT INTO users (username, password)
    VALUES ($1, $2)
    RETURNING id, username, created_at `,
    [username, password],
  );

  return result.rows[0];
}
