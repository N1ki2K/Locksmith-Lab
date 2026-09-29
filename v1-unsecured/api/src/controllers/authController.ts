import type { Request, Response } from "express";
import { registerUser } from "../services/authService.js";

export async function register(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const user = await registerUser(username, password);

    return res.status(201).json({
      message: "User created",
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_EXISTS") {
      return res.status(409).json({
        error: "Username already exists",
      });
    }

    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
