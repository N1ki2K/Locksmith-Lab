import { randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { loginUser as loginUserService, logoutUser as logoutUserService, registerUser as registerUserService } from "../services/authService.js";

const validUsername = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z0-9_.-]{3,100}$/.test(v);
const validPassword = (v: unknown): v is string => typeof v === "string" && v.length >= 12 && v.length <= 128;

export async function registerUser(req: Request, res: Response) {
  const { username, password } = req.body ?? {};
  if (!validUsername(username) || !validPassword(password)) {
    return res.status(400).json({ error: "Username must be 3-100 letters, numbers, dots, underscores or hyphens; password must be 12-128 characters" });
  }
  try {
    const user = await registerUserService(username, password);
    return res.status(201).json({ message: "User created", user });
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_EXISTS") return res.status(409).json({ error: "Username already exists" });
    throw error;
  }
}

export async function loginUser(req: Request, res: Response) {
  const { username, password } = req.body ?? {};
  if (!validUsername(username) || !validPassword(password)) {
    return res.status(400).json({ error: "Valid username and password are required" });
  }
  try {
    const user = await loginUserService(username, password);
    await new Promise<void>((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
    req.session.userId = user.id;
    req.session.csrfToken = randomBytes(32).toString("hex");
    return req.session.save((error) => {
      if (error) return res.status(500).json({ error: "Could not create session" });
      return res.status(200).json({ message: "Login successful", user, csrfToken: req.session.csrfToken });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") return res.status(401).json({ error: "Invalid username or password" });
    throw error;
  }
}

export async function logoutUser(req: Request, res: Response) {
  try {
    await logoutUserService(req.session.destroy.bind(req.session));
    res.clearCookie("secured.sid", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) { throw error; }
}
