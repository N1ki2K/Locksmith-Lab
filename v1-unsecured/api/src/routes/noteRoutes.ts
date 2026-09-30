import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createNoteController,
  deleteNoteController,
  updateNoteController,
  getNote,
  getNotes,
} from "../controllers/noteController.js";

const router = Router();

router.use(authenticate);

router.get("/", getNotes);
router.get("/:id", getNote);
router.post("/", createNoteController);
router.put("/:id", updateNoteController);
router.delete("/:id", deleteNoteController);

export default router;
