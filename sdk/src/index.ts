export const SDK_VERSION = "1.0.0";

export type UserAttributes = Record<string, string>;

export interface FlagForgeConfig {
    apiUrl: string;
    environmentId: string;
}

export interface EvaluationUser {
    userId: string;
    attributes?: UserAttributes;
}

export interface EvaluationResult {
    enabled: boolean;
    reason:
    | "FLAG_NOT_FOUND"
    | "FLAG_DISABLED"
    | "FULL_ROLLOUT"
    | "PERCENTAGE_ROLLOUT"
    | "PERCENTAGE_ROLLOUT_EXCLUDED"
    | "TARGETING_RULE_NOT_MATCHED";
}


export class FlagForge {
    private readonly apiUrl: string;
    private readonly environmentId: string;

    constructor(config: FlagForgeConfig) {
        this.apiUrl = config.apiUrl.replace(/\/$/, "");
        this.environmentId = config.environmentId;
    }

    async isEnabled(
        flagKey: string,
        user: EvaluationUser
    ): Promise<boolean> {
        const result = await this.evaluate(flagKey, user);

        return result.enabled;
    }

    async evaluate(
        flagKey: string,
        user: EvaluationUser
    ): Promise<EvaluationResult> {
        const response = await fetch(
            `${this.apiUrl}/api/evaluation`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    environmentId: this.environmentId,
                    flagKey,
                    userId: user.userId,
                    attributes: user.attributes,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(
                `FlagForge evaluation failed: ${response.status}`
            );
        }

        return (await response.json()) as EvaluationResult;
    }
}