import { Request, Response } from "express";

export interface RequestWithUser extends Request {
    auth: {
        token?: string;
        userId?: string;
        permissions?: string[];
        email?: string;
    }
}