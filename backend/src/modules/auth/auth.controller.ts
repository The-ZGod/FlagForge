import type { Request, Response } from "express";
import {
    registerUser,
    loginUser,
    generateAccessToken,
} from "./auth.service.js";

import {
    validateRegistration,
    validateLogin,
} from "./auth.validation.js";

export async function registerHandler(
    req: Request,
    res: Response
) {
    const { email, password, name } = req.body;

    const validationError = validateRegistration(
        email,
        password,
        name
    );

    if (validationError) {
        res.status(400).json({
            message: validationError,
        });
        return;
    }

    try {
        const user = await registerUser(
            email,
            password,
            name
        );

        res.status(201).json(user);
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes("Unique constraint")
        ) {
            res.status(409).json({
                message: "Email already registered",
            });
            return;
        }

        throw error;
    }
}

export async function loginHandler(
    req: Request,
    res: Response
) {
    const { email, password } = req.body;

    const validationError = validateLogin(
        email,
        password
    );

    if (validationError) {
        res.status(400).json({
            message: validationError,
        });
        return;
    }

    const user = await loginUser(email, password);

    if (!user) {
        res.status(401).json({
            message: "Invalid email or password",
        });
        return;
    }

    const accessToken = generateAccessToken(user.id);

    res.json({
        user,
        accessToken,
    });
}