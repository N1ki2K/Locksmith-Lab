import { db } from "../database.js";

export async function findNotesByUserId(userId: number) {
  const result = await db.query(
    "SELECT id, user_id, title, content, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return result.rows;
}

export async function findNoteById(id: number, userId: number) {
  const result = await db.query(
    "SELECT id, user_id, title, content, created_at, updated_at FROM notes WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  return result.rows[0];
}

export async function createNote(userId: number, title: string, content: string) {
  const result = await db.query(
    "INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, user_id, title, content, created_at, updated_at",
    [userId, title, content],
  );
  return result.rows[0];
}

export async function updateNote(id: number, userId: number, title: string, content: string) {
  const result = await db.query(
    "UPDATE notes SET title = $3, content = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING id, user_id, title, content, created_at, updated_at",
    [id, userId, title, content],
  );
  return result.rows[0];
}

export async function deleteNote(id: number, userId: number) {
  const result = await db.query(
    "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id, user_id, title, content, created_at, updated_at",
    [id, userId],
  );
  return result.rows[0];
}
