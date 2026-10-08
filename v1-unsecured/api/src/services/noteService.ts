import {
  createNote as createNoteRecord,
  deleteNote as deleteNoteRecord,
  findNoteById,
  findNotesByUserId,
  updateNote as updateNoteRecord,
} from "../repositories/noteRepository.js";

export async function getUserNotes(userId: number) {
  return findNotesByUserId(userId);
}

export async function getNoteById(id: string) {
  const notes = await findNoteById(id);

  if (notes.length === 0) {
    throw new Error("NOTE_NOT_FOUND");
  }

  return notes;
}

export async function createNote(userId: number, title: string, content: string) {
  return createNoteRecord(userId, title, content);
}

export async function updateNote(id: number, title: string, content: string) {
  const note = await updateNoteRecord(id, title, content);

  if (!note) {
    throw new Error("NOTE_NOT_FOUND");
  }

  return note;
}

export async function deleteNote(id: number) {
  const note = await deleteNoteRecord(id);

  if (!note) {
    throw new Error("NOTE_NOT_FOUND");
  }

  return note;
}
