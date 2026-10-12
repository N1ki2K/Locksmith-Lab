import {
  createNote as createNoteRecord,
  deleteNote as deleteNoteRecord,
  findNoteById,
  findNotesByUserId,
  updateNote as updateNoteRecord,
} from "../repositories/noteRepository.js";

export async function getUserNotes(userId: number) { return findNotesByUserId(userId); }
export async function getNoteById(id: number, userId: number) {
  const note = await findNoteById(id, userId);
  if (!note) throw new Error("NOTE_NOT_FOUND");
  return note;
}
export async function createNote(userId: number, title: string, content: string) {
  return createNoteRecord(userId, title, content);
}
export async function updateNote(id: number, userId: number, title: string, content: string) {
  const note = await updateNoteRecord(id, userId, title, content);
  if (!note) throw new Error("NOTE_NOT_FOUND");
  return note;
}
export async function deleteNote(id: number, userId: number) {
  const note = await deleteNoteRecord(id, userId);
  if (!note) throw new Error("NOTE_NOT_FOUND");
  return note;
}
