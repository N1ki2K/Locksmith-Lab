import { db } from "../database.js";

export async function findNotesByUserId(userId: number) {
  const result = await db.query(
    `SELECT * FROM notes WHERE user_id = ${userId} ORDER BY created_at DESC`,
  );

  return result.rows;
}

export async function findNoteById(id: number) {
  const result = await db.query(`SELECT * FROM notes WHERE id = ${id}`);

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
    VALUES(${userId}, '${title}', '${content}')
    RETURNING *
    `,
  );

  return result.rows[0];
}

export async function updateNote(id: number, title: string, content: string) {
  const result = await db.query(
    `
  UPDATE notes
  SET title = '${title}',
    content = '${content}',
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ${id}
  RETURNING *
  `,
  );

  return result.rows[0];
}

export async function deleteNote(id: number) {
  const result = await db.query(`DELETE from notes WHERE id = ${id} RETURNING *`);

  return result.rows[0];
}
