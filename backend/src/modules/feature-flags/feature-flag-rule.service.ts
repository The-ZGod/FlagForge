import { prisma } from "../../lib/prisma.js";
import { createActivity } from "../activity/activity.service.js";

import type { RuleOperator } from "./feature-flag.validation.js";

export async function createFlagRule(
    featureFlagId: string,
    attribute: string,
    operator: RuleOperator,
    value: string,
    userId: string
) {
    const rule = await prisma.flagRule.create({
        data: {
            featureFlagId,
            attribute,
            operator,
            value,
        },
    });

    await createActivity({
        userId,
        action: "CREATED",
        entity: "FLAG_RULE",
        entityId: rule.id,
        metadata: {
            featureFlagId,
            attribute,
            operator,
            value,
        },
    });

    return rule;
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
    ruleId: string,
    userId: string
) {
    const rule = await prisma.flagRule.delete({
        where: {
            id: ruleId,
        },
    });

    await createActivity({
        userId,
        action: "DELETED",
        entity: "FLAG_RULE",
        entityId: rule.id,
        metadata: {
            featureFlagId: rule.featureFlagId,
            attribute: rule.attribute,
            operator: rule.operator,
            value: rule.value,
        },
    });

    return rule;
}