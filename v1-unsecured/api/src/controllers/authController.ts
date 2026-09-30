import type { Request, Response } from "express";
import { loginUser, registerUser } from "../services/authService.js";
import { error } from "node:console";

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

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const user = await loginUser(username, password);

    req.session.userId = user.id;

    return res.status(200).json({
      message: "login successfull",
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

export async function logout(req: Request, res: Response) {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        error: "Could not logout",
      });
    }
    return res.status(200).json({
      message: "Logout successfull",
    });
  });
}
