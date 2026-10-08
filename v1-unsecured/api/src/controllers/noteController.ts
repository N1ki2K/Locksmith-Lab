import type { Request, Response } from "express";
import {
  addNote,
  editNote,
  getNotesById,
  getUserNotes,
  removeNote,
} from "../services/noteService.js";

export async function getNotes(req: Request, res: Response) {
  const note = await getUserNotes(req.session.userId!);

  return res.json(note);
}

export async function getNote(req: Request, res: Response) {
  try {
    const note = await getNotesById(req.params.id);

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

export async function createNoteController(req: Request, res: Response) {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      erorr: "Title and content are requited",
    });
  }

  const note = await addNote(req.session.userId!, title, content);

  return res.status(201).json(note);
}

export async function updateNoteController(req: Request, res: Response) {
  try {
    const { title, content } = req.body;

    const note = await editNote(Number(req.params.id), title, content);

    return res.json(note);
  } catch (erorr) {
    if (erorr instanceof Error && erorr.message === "NOTE_NOT_FOUND") {
      return res.status(404).json({
        error: "Note not found",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function deleteNoteController(req: Request, res: Response) {
  try {
    const note = await removeNote(Number(req.params.id));

    return res.json({
      message: "Note deleated",
      note,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOTE_NOTE_FOUND") {
      return res.status(404).json({
        error: "Note not found",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
