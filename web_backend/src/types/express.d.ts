import "express";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
        token: string;
        permissions?: string[];
      };
    }
  }
}