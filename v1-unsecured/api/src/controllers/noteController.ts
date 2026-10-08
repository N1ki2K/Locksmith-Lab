import type { Request, Response } from "express";
import {
  createNote as createNoteService,
  deleteNote as deleteNoteService,
  getNoteById as getNoteByIdService,
  getUserNotes as getUserNotesService,
  updateNote as updateNoteService,
} from "../services/noteService.js";

export async function getUserNotes(req: Request, res: Response) {
  const notes = await getUserNotesService(req.session.userId!);

  return res.json(notes);
}

export async function getNoteById(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        error: "Note ID is required",
      });
    }

    const notes = await getNoteByIdService(id);

    return res.json(notes);
  } catch (error) {
    if (error instanceof Error && error.message === "NOTE_NOT_FOUND") {
      return res.status(404).json({
        error: "Note not found",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function createNote(req: Request, res: Response) {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      error: "Title and content are required",
    });
  }

  const note = await createNoteService(req.session.userId!, title, content);

  return res.status(201).json(note);
}

export async function updateNote(req: Request, res: Response) {
  try {
    const { title, content } = req.body;

    const note = await updateNoteService(Number(req.params.id), title, content);

    return res.json(note);
  } catch (error) {
    if (error instanceof Error && error.message === "NOTE_NOT_FOUND") {
      return res.status(404).json({
        error: "Note not found",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function deleteNote(req: Request, res: Response) {
  try {
    const note = await deleteNoteService(Number(req.params.id));

    return res.json({
      message: "Note deleted",
      note,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOTE_NOT_FOUND") {
      return res.status(404).json({
        error: "Note not found",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
