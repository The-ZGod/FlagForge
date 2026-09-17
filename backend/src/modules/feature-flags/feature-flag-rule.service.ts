import { prisma } from "../../lib/prisma.js";
import type { RuleOperator } from "./feature-flag.validation.js";

export async function createFlagRule(
    featureFlagId: string,
    attribute: string,
    operator: RuleOperator,
    value: string
) {
    return prisma.flagRule.create({
        data: {
            featureFlagId,
            attribute,
            operator,
            value,
        },
    });
}

export async function getFlagRules(
    featureFlagId: string
) {
    return prisma.flagRule.findMany({
        where: {
            featureFlagId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}

export async function deleteFlagRule(
    ruleId: string
) {
    return prisma.flagRule.delete({
        where: {
            id: ruleId,
        },
    });
}