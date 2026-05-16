import { Request, Response, NextFunction } from "express";

import { verifyToken } from "../services/auth.service";
import { RequestWithUser } from "../types/interface";

const parseBearer = (header?: string): string | null => {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = parseBearer(req.header("authorization"));
  if (!token) {
    res.status(401).json({ error: "missing token" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.auth = { userId: payload.sub, email: payload.email, token };
    next();
  } catch (error) {
    res.status(401).json({ error: "invalid token" });
  }
};
