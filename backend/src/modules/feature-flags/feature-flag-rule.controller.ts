import type { Request, Response } from "express";
import {
    createFlagRule,
    getFlagRules,
    deleteFlagRule,
} from "./feature-flag-rule.service.js";
import { validateFlagRuleCreation } from "./feature-flag.validation.js";

export async function createFlagRuleHandler(
    req: Request,
    res: Response
) {
    const {
        featureFlagId,
        attribute,
        operator,
        value,
    } = req.body;

    const validationError =
        validateFlagRuleCreation(
            featureFlagId,
            attribute,
            operator,
            value
        );

    if (validationError) {
        res.status(400).json({
            message: validationError,
        });
        return;
    }

    const rule = await createFlagRule(
        featureFlagId,
        attribute,
        operator,
        value
    );

    res.status(201).json(rule);
}

export async function getFlagRulesHandler(
    req: Request,
    res: Response
) {
    const { featureFlagId } = req.params;

    if (typeof featureFlagId !== "string") {
        res.status(400).json({
            message: "Invalid featureFlagId",
        });
        return;
    }

    const rules = await getFlagRules(featureFlagId);

    res.json(rules);
}

export async function deleteFlagRuleHandler(
    req: Request,
    res: Response
) {
    const { ruleId } = req.params;

    if (typeof ruleId !== "string") {
        res.status(400).json({
            message: "Invalid ruleId",
        });
        return;
    }

    await deleteFlagRule(ruleId);

    res.status(204).send();
}