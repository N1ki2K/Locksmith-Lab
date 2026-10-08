import { db } from "../database.js";

export async function findByUsername(username: string) {
  const result = await db.query(`SELECT * FROM users WHERE username = '${username}'`);

  return result.rows[0];
}

export async function create(username: string, password: string) {
  const result = await db.query(
    `INSERT INTO users (username, password)
    VALUES ('${username}', '${password}')
    RETURNING id, username, created_at `,
  );

  return result.rows[0];
}

export async function findById(id: number) {
  const result = await db.query(
    `SELECT id, username, password, created_at FROM users WHERE id = ${id}`,
  );

  return result.rows[0];
}

export async function findByCredentials(
  username: string,
  password: string,
) {
  const result = await db.query(
    `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`,
  );

  return result.rows[0];
}
