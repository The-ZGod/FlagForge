import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";

export async function registerUser(
    email: string,
    password: string,
    name?: string
) {
    const passwordHash = await bcrypt.hash(password, 10);

    return prisma.user.create({
        data: {
            email,
            password: passwordHash,
            ...(name !== undefined && { name }),
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
    });
}

export async function loginUser(
    email: string,
    password: string
) {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user || !user.password) {
        return null;
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatches) {
        return null;
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name,
    };
}

export function generateAccessToken(userId: string) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        {
            userId,
        },
        secret,
        {
            expiresIn: "1h",
        }
    );
}