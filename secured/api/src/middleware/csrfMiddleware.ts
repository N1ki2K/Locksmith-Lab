import { randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
export function csrfToken(req: Request, res: Response) {
  if (!req.session.csrfToken) req.session.csrfToken = randomBytes(32).toString("hex");
  return res.json({ csrfToken: req.session.csrfToken });
}
export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  if (safeMethods.has(req.method)) return next();
  const supplied = req.get("x-csrf-token");
  const expected = req.session.csrfToken;
  if (!supplied || !expected) return res.status(403).json({ error: "CSRF token required" });
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  return next();
}
