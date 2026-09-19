import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    CheckCircle2,
    XCircle,
    Play,
    Activity,
    Gauge,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    evaluateFlag,
    getEvaluationMetrics,
    type EvaluationMetrics,
    type EvaluationResult,
} from "@/lib/evaluation";

export function EvaluationPlayground() {
    const { environmentId } = useParams();

    const [flagKey, setFlagKey] = useState("new_checkout");
    const [userId, setUserId] = useState("user-123");

    const [country, setCountry] = useState("IN");
    const [plan, setPlan] = useState("premium");

    const [result, setResult] =
        useState<EvaluationResult | null>(null);

    const [metrics, setMetrics] =
        useState<EvaluationMetrics | null>(null);

    const [loading, setLoading] = useState(false);
    const [metricsLoading, setMetricsLoading] =
        useState(true);

    const [error, setError] = useState("");

    async function loadMetrics() {
        if (!environmentId) {
            return;
        }

        try {
            setMetricsLoading(true);

            const data = await getEvaluationMetrics(
                environmentId
            );

            setMetrics(data);
        } catch (error) {
            console.error(
                "Failed to load evaluation metrics",
                error
            );
        } finally {
            setMetricsLoading(false);
        }
    }

    useEffect(() => {
        void loadMetrics();
    }, [environmentId]);

    async function handleEvaluate(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!environmentId) {
            setError("Environment ID is missing");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setResult(null);

            const evaluation = await evaluateFlag({
                environmentId,
                flagKey,
                userId,
                attributes: {
                    country,
                    plan,
                },
            });

            setResult(evaluation);

            await loadMetrics();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Evaluation failed"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    Evaluation Playground
                </h1>

                <p className="text-sm text-muted-foreground">
                    Test feature flag evaluation for different
                    users and attributes.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Evaluate Feature Flag
                    </CardTitle>

                    <CardDescription>
                        Send a real evaluation request to the
                        FlagForge evaluation engine.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleEvaluate}
                        className="space-y-6"
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="flag-key">
                                    Flag Key
                                </Label>

                                <Input
                                    id="flag-key"
                                    value={flagKey}
                                    onChange={(event) =>
                                        setFlagKey(
                                            event.target.value
                                        )
                                    }
                                    placeholder="new_checkout"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user-id">
                                    User ID
                                </Label>

                                <Input
                                    id="user-id"
                                    value={userId}
                                    onChange={(event) =>
                                        setUserId(
                                            event.target.value
                                        )
                                    }
                                    placeholder="user-123"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <p className="mb-3 text-sm font-medium">
                                User Attributes
                            </p>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="country">
                                        Country
                                    </Label>

                                    <Input
                                        id="country"
                                        value={country}
                                        onChange={(event) =>
                                            setCountry(
                                                event.target.value
                                            )
                                        }
                                        placeholder="IN"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="plan">
                                        Plan
                                    </Label>

                                    <Input
                                        id="plan"
                                        value={plan}
                                        onChange={(event) =>
                                            setPlan(
                                                event.target.value
                                            )
                                        }
                                        placeholder="premium"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            <Play className="mr-2 h-4 w-4" />

                            {loading
                                ? "Evaluating..."
                                : "Evaluate Flag"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                    </CardContent>
                </Card>
            )}

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Evaluation Result
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="flex items-center gap-3">
                            {result.enabled ? (
                                <CheckCircle2 className="h-6 w-6" />
                            ) : (
                                <XCircle className="h-6 w-6" />
                            )}

                            <div>
                                <p className="text-lg font-semibold">
                                    {result.enabled
                                        ? "ENABLED"
                                        : "DISABLED"}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    Reason: {result.reason}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div>
                <div className="mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />

                    <h2 className="text-xl font-semibold">
                        Evaluation Metrics
                    </h2>
                </div>

                {metricsLoading && !metrics ? (
                    <p className="text-sm text-muted-foreground">
                        Loading metrics...
                    </p>
                ) : metrics ? (
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <MetricCard
                                label="Total Evaluations"
                                value={metrics.totalEvaluations}
                            />

                            <MetricCard
                                label="Enabled"
                                value={
                                    metrics.enabledEvaluations
                                }
                            />

                            <MetricCard
                                label="Disabled"
                                value={
                                    metrics.disabledEvaluations
                                }
                            />

                            <MetricCard
                                label="Average Latency"
                                value={`${metrics.averageLatencyMs} ms`}
                                icon={<Gauge className="h-4 w-4" />}
                            />
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Evaluation Reasons
                                </CardTitle>

                                <CardDescription>
                                    Breakdown of why feature flag
                                    evaluations returned their
                                    results.
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <ReasonRow
                                        label="Full Rollout"
                                        value={
                                            metrics.reasons
                                                .FULL_ROLLOUT
                                        }
                                    />

                                    <ReasonRow
                                        label="Percentage Rollout"
                                        value={
                                            metrics.reasons
                                                .PERCENTAGE_ROLLOUT
                                        }
                                    />

                                    <ReasonRow
                                        label="Percentage Excluded"
                                        value={
                                            metrics.reasons
                                                .PERCENTAGE_ROLLOUT_EXCLUDED
                                        }
                                    />

                                    <ReasonRow
                                        label="Targeting Not Matched"
                                        value={
                                            metrics.reasons
                                                .TARGETING_RULE_NOT_MATCHED
                                        }
                                    />

                                    <ReasonRow
                                        label="Flag Disabled"
                                        value={
                                            metrics.reasons
                                                .FLAG_DISABLED
                                        }
                                    />

                                    <ReasonRow
                                        label="Flag Not Found"
                                        value={
                                            metrics.reasons
                                                .FLAG_NOT_FOUND
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Metrics are unavailable.
                    </p>
                )}
            </div>
        </main>
    );
}

function MetricCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {label}
                    </p>

                    {icon}
                </div>

                <p className="mt-2 text-2xl font-semibold">
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

function ReasonRow({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm">
                {label}
            </span>

            <span className="font-mono text-sm font-medium">
                {value}
            </span>
        </div>
    );
}