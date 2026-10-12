import type { NextFunction, Request, Response } from "express";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({
      error: "Could not authenticate",
    });
  }
  next();
}
