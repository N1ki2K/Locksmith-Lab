import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createNote,
  deleteNote,
  updateNote,
  getNoteById,
  getUserNotes,
} from "../controllers/noteController.js";

const router = Router();

router.use(authenticate);

router.get("/", getUserNotes);
router.get("/:id", getNoteById);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
