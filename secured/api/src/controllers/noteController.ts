import type { Request, Response } from "express";
import { createNote as createNoteService, deleteNote as deleteNoteService, getNoteById as getNoteByIdService, getUserNotes as getUserNotesService, updateNote as updateNoteService } from "../services/noteService.js";

function parseId(value: string): number | undefined {
  if (!/^[1-9]\d*$/.test(value)) return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : undefined;
}
function validNoteBody(body: unknown): body is { title: string; content: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const data = body as Record<string, unknown>;
  return Object.keys(data).length === 2 && Object.keys(data).every((key) => key === "title" || key === "content") &&
    typeof data.title === "string" && data.title.trim().length > 0 && data.title.length <= 255 &&
    typeof data.content === "string" && data.content.trim().length > 0 && data.content.length <= 4000;
}
const userId = (req: Request) => req.session.userId!;

export async function getUserNotes(req: Request, res: Response) {
  return res.json(await getUserNotesService(userId(req)));
}
export async function getNoteById(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = parseId(typeof idParam === "string" ? idParam : "");
  if (!id) return res.status(400).json({ error: "Note ID must be a positive integer" });
  try { return res.json(await getNoteByIdService(id, userId(req))); }
  catch (error) { if (error instanceof Error && error.message === "NOTE_NOT_FOUND") return res.status(404).json({ error: "Note not found" }); throw error; }
}
export async function createNote(req: Request, res: Response) {
  if (!validNoteBody(req.body)) return res.status(400).json({ error: "Title (1-255 characters) and content (1-4000 characters) are required; no other fields are allowed" });
  return res.status(201).json(await createNoteService(userId(req), req.body.title, req.body.content));
}
export async function updateNote(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = parseId(typeof idParam === "string" ? idParam : "");
  if (!id) return res.status(400).json({ error: "Note ID must be a positive integer" });
  if (!validNoteBody(req.body)) return res.status(400).json({ error: "Title (1-255 characters) and content (1-4000 characters) are required; no other fields are allowed" });
  try { return res.json(await updateNoteService(id, userId(req), req.body.title, req.body.content)); }
  catch (error) { if (error instanceof Error && error.message === "NOTE_NOT_FOUND") return res.status(404).json({ error: "Note not found" }); throw error; }
}
export async function deleteNote(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = parseId(typeof idParam === "string" ? idParam : "");
  if (!id) return res.status(400).json({ error: "Note ID must be a positive integer" });
  try { const note = await deleteNoteService(id, userId(req)); return res.json({ message: "Note deleted", note }); }
  catch (error) { if (error instanceof Error && error.message === "NOTE_NOT_FOUND") return res.status(404).json({ error: "Note not found" }); throw error; }
}
