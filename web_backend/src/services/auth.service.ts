import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { createUser, findUserByEmail, getUserRoles } from "./user.service";

const revokedTokens = new Set<string>();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "5h";

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required.");
}

type LoginResult = {
  token: string;
  user: { id: string; email: string };
};

type RegisterResult = LoginResult;

export const login = async (
  email: string,
  password: string,
): Promise<LoginResult> => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error("invalid credentials");
  }
  const token = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET as string,
    {
      subject: String(user.id),
      expiresIn: "5h",
    },
  );

  return { token, user: { id: user.id, email: user.email } };
};

export const logout = (token: string | null): void => {
  if (token) {
    revokedTokens.add(token);
  }
};

export const register = async (
  email: string,
  password: string,
  roles?: string[],
): Promise<RegisterResult> => {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ email, passwordHash, roles });
  const token = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET as string,
    {
      subject: String(user.id),
      expiresIn: "5h",
    },
  );

  return { token, user: { id: user.id, email: user.email } };
};

export const verifyToken = (token: string): { sub: string; email: string } => {
  if (revokedTokens.has(token)) {
    throw new Error("token revoked");
  }

  const payload = jwt.verify(token, jwtSecret) as {
    sub: string;
    email: string;
  };
  return payload;
};

export const fetchUserPermissions = async (userId: string): Promise<string[]> =>
  getUserRoles(userId);
