import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            userId: string;
        }
    }
}

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            message: "Authentication required",
        });
        return;
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    try {
        const payload = jwt.verify(token, secret);

        if (
            typeof payload !== "object" ||
            payload === null ||
            typeof payload.userId !== "string"
        ) {
            res.status(401).json({
                message: "Invalid token",
            });
            return;
        }

        req.userId = payload.userId;

        next();
    } catch {
        res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}