import { prisma } from "../../lib/prisma.js";

export async function createProject(name: string, ownerId: string) {
    return prisma.project.create({
        data: {
            name,
            ownerId,
        },
    });
}

export async function getProjectsByOwner(ownerId: string) {
    return prisma.project.findMany({
        where: {
            ownerId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}