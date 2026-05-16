import { Request, Response } from "express";

import { fetchUserPermissions, login, logout, register } from "../services/auth.service";
import { listRoles } from "../services/user.service";

export const loginHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  try {
    const result = await login(String(email), String(password));
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ error: "invalid credentials" });
  }
};

export const registerHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { email, password, roles } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  try {
    const result = await register(String(email), String(password), roles);
    return res.status(201).json(result);
  } catch (error: any) {
    if (error?.code === "23505") {
      return res.status(409).json({ error: "email already exists" });
    }
    return res.status(400).json({ error: "unable to register", details:  String(error) });
  }
};

export const logoutHandler = (req: Request, res: Response): Response => {
  const token = req.auth?.token ?? null;
  logout(token);
  return res.json({ ok: true });
};

export const permissionsHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "missing token" });
  }

  const permissions = await fetchUserPermissions(userId);
  return res.json({ permissions });
};

export const permissionListHandler = async (
  _req: Request,
  res: Response,
): Promise<Response> => {
  const permissions = await listRoles();
  return res.json({ permissions });
};
