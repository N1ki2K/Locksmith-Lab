import { db } from "../database.js";

export async function findUserByUsername(username: string) {
  const result = await db.query(`SELECT * FROM users WHERE username = '${username}'`);

  return result.rows[0];
}

export async function createUser(username: string, password: string) {
  const result = await db.query(
    `INSERT INTO users (username, password)
    VALUES ('${username}', '${password}')
    RETURNING id, username, created_at `,
  );

  return result.rows[0];
}

export async function findUserById(id: number) {
  const result = await db.query(
    `SELECT id, username, password, created_at FROM users WHERE id = ${id}`,
  );

  return result.rows[0];
}

export async function findUserByCreadentials(
  username: string,
  password: string,
) {
  const result = await db.query(
    `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`,
  );

  return result.rows[0];
}
