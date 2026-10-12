import type { Request, Response } from "express";
import {
  loginUser as loginUserService,
  logoutUser as logoutUserService,
  registerUser as registerUserService,
} from "../services/authService.js";

export async function registerUser(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const user = await registerUserService(username, password);

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

export async function loginUser(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const user = await loginUserService(username, password);

    req.session.userId = user.id;

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function logoutUser(req: Request, res: Response) {
  try {
    await logoutUserService(req.session.destroy.bind(req.session));

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Could not logout",
    });
  }
}
