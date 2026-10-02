import { db } from "../database.js";

export async function findNotesByUserId(userId: number) {
  const result = await db.query(
    "SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );

  return result.rows;
}

export async function findNoteById(id: number) {
  const result = await db.query("SELECT * FROM notes WHERE id = $1", [id]);

  return result.rows[0];
}

export async function createNote(
  userId: number,
  title: string,
  content: string,
) {
  const result = await db.query(
    `
    INSERT INTO notes (user_id, title, content)
    VALUES($1, $2, $3)
    RETURNING *
    `,
    [userId, title, content],
  );

  return result.rows[0];
}

export async function updateNote(id: number, title: string, content: string) {
  const result = await db.query(
    `
  UPDATE notes
  SET title = $1,
    content = $2,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $3
  RETURNING *
  `,
    [title, content, id],
  );

  return result.rows[0];
}

export async function deleteNote(id: number) {
  const result = await db.query("DELETE from notes WHERE id = $1 RETURNING *", [
    id,
  ]);

  return result.rows[0];
}
