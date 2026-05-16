import { Request, Response, NextFunction } from "express";

import { fetchUserPermissions } from "../services/auth.service";
import { RequestWithUser } from "../types/interface";

export const requireRoles =
  (...roles: string[]) =>
  async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: "missing token" });
      return;
    }

    const permissions = await fetchUserPermissions(userId);
    const hasRole = roles.some((role) => permissions.includes(role));
    if (!hasRole) {
      res.status(403).json({ error: "forbidden" });
      return;
    }

    req.auth = { ...req.auth, permissions };
    next();
  };
