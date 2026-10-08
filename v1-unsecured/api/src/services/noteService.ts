import {
  createNote,
  deleteNote,
  findNoteById,
  findNotesByUserId,
  updateNote,
} from "../repositories/noteRepository.js";

export async function getUserNotes(userId: number) {
  return findNotesByUserId(userId);
}

export async function getNotesById(id: string) {
  const notes = await findNoteById(id);

  if (notes.length === 0) {
    throw new Error("NOTE_NOT_FOUND");
  }

  return notes;
}

export async function addNote(userId: number, title: string, content: string) {
  return createNote(userId, title, content);
}

export async function editNote(id: number, title: string, content: string) {
  const note = await updateNote(id, title, content);

  if (!note) {
    throw new Error("NOTE_NOT_FOUND");
  }

  return note;
}

export async function removeNote(id: number) {
  const note = await deleteNote(id);

  if (!note) {
    throw new Error("NOTE_NOT_FOUND");
  }

  return note;
}
