import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    Activity,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Gauge,
    Play,
    Plus,
    Trash2,
    XCircle,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
    evaluateFlag,
    getEvaluationMetrics,
    type EvaluationMetrics,
    type EvaluationResult,
    type UserAttributes,
} from "@/lib/evaluation";
import { getFeatureFlags, type FeatureFlag } from "@/lib/feature-flags";
import { getEnvironments, type Environment } from "@/lib/environments";
import { getProjects, type Project } from "@/lib/projects";

const REASON_MAP: Record<string, { label: string; desc: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    FULL_ROLLOUT: {
        label: "100% Full Rollout",
        desc: "Flag is fully enabled without restrictions.",
        variant: "default",
    },
    PERCENTAGE_ROLLOUT: {
        label: "Percentage Rollout (Matched)",
        desc: "User ID was deterministically bucketed within percentage threshold.",
        variant: "default",
    },
    PERCENTAGE_ROLLOUT_EXCLUDED: {
        label: "Percentage Rollout (Excluded)",
        desc: "User ID fell outside of the active percentage rollout threshold.",
        variant: "secondary",
    },
    TARGETING_RULE_NOT_MATCHED: {
        label: "Targeting Rules Failed",
        desc: "User attributes did not satisfy required targeting conditions.",
        variant: "secondary",
    },
    FLAG_DISABLED: {
        label: "Flag Disabled",
        desc: "Master flag kill-switch is set to Disabled.",
        variant: "destructive",
    },
    FLAG_NOT_FOUND: {
        label: "Flag Not Found",
        desc: "No active flag matching this key exists in the environment.",
        variant: "destructive",
    },
};

export function EvaluationPlayground() {
    const { projectId, environmentId } = useParams();

    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [environment, setEnvironment] = useState<Environment | null>(null);
    const [project, setProject] = useState<Project | null>(null);

    const [flagKey, setFlagKey] = useState("");
    const [userId, setUserId] = useState("user-tester-42");
    const [attributes, setAttributes] = useState<Array<{ key: string; value: string }>>([
        { key: "country", value: "US" },
        { key: "plan", value: "pro" },
    ]);

    const [result, setResult] = useState<EvaluationResult | null>(null);
    const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);

    const [loading, setLoading] = useState(false);
    const [metricsLoading, setMetricsLoading] = useState(true);
    const [error, setError] = useState("");
    const [latency, setLatency] = useState<number | null>(null);

    async function loadEnvironmentInfo() {
        if (!environmentId) return;

        try {
            const flagList = await getFeatureFlags(environmentId);
            setFlags(flagList);
            if (flagList.length > 0 && !flagKey) {
                setFlagKey(flagList[0].key);
            }

            if (projectId) {
                const projectList = await getProjects();
                const p = projectList.find((item) => item.id === projectId);
                if (p) setProject(p);

                const envList = await getEnvironments(projectId);
                const env = envList.find((e) => e.id === environmentId);
                if (env) setEnvironment(env);
            }
        } catch (err) {
            console.error("Failed to load environment flags", err);
        }
    }

    async function loadMetrics() {
        if (!environmentId) return;

        try {
            setMetricsLoading(true);
            const data = await getEvaluationMetrics(environmentId);
            setMetrics(data);
        } catch (err) {
            console.error("Failed to load evaluation metrics", err);
        } finally {
            setMetricsLoading(false);
        }
    }

    useEffect(() => {
        loadEnvironmentInfo();
        loadMetrics();
    }, [environmentId, projectId]);

    async function handleEvaluate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!environmentId || !flagKey.trim() || !userId.trim()) return;

        try {
            setLoading(true);
            setError("");
            setResult(null);

            const attrsObj: UserAttributes = {};
            attributes.forEach((attr) => {
                if (attr.key.trim() && attr.value.trim()) {
                    attrsObj[attr.key.trim()] = attr.value.trim();
                }
            });

            const start = performance.now();
            const evaluation = await evaluateFlag({
                environmentId,
                flagKey: flagKey.trim(),
                userId: userId.trim(),
                attributes: attrsObj,
            });
            const end = performance.now();
            setLatency(Math.round(end - start));
            setResult(evaluation);

            await loadMetrics();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Evaluation request failed"
            );
        } finally {
            setLoading(false);
        }
    }

    function addAttributeRow() {
        setAttributes((prev) => [...prev, { key: "", value: "" }]);
    }

    function removeAttributeRow(index: number) {
        setAttributes((prev) => prev.filter((_, i) => i !== index));
    }

    function updateAttributeRow(index: number, key: string, value: string) {
        setAttributes((prev) =>
            prev.map((item, i) => (i === index ? { key, value } : item))
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-150">
            {/* Header */}
            <div>
                {projectId && environmentId && (
                    <Link
                        to={`/projects/${projectId}/environments/${environmentId}`}
                        className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        <span>Back to feature flags</span>
                    </Link>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                Evaluation Playground
                            </h1>
                            {environment && (
                                <Badge variant="outline" className="text-xs font-mono font-normal">
                                    {project ? `${project.name} / ${environment.name}` : environment.name}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Simulate and inspect runtime feature flag evaluations with deterministic bucketing and custom targeting attributes.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                    {error}
                </div>
            )}

            {/* Interactive Evaluation Form + Output */}
            <div className="grid gap-6 md:grid-cols-12">
                {/* Form */}
                <Card className="md:col-span-7">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                            Evaluation Request
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Sends a runtime evaluation request to the FlagForge evaluation engine.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleEvaluate} className="space-y-4">
                            {/* Flag Selection */}
                            <div className="space-y-1.5">
                                <Label htmlFor="flag-key-select" className="text-xs font-medium">
                                    Feature Flag Key
                                </Label>
                                {flags.length > 0 ? (
                                    <div className="flex gap-2">
                                        <select
                                            id="flag-key-select"
                                            value={flagKey}
                                            onChange={(e) => setFlagKey(e.target.value)}
                                            className="w-full h-9 rounded-md border border-input bg-card px-3 py-1 text-xs font-mono shadow-xs focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
                                        >
                                            {flags.map((f) => (
                                                <option key={f.id} value={f.key}>
                                                    {f.name} ({f.key})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <Input
                                        id="flag-key-select"
                                        value={flagKey}
                                        onChange={(e) => setFlagKey(e.target.value)}
                                        placeholder="e.g. new_checkout"
                                        className="font-mono text-xs"
                                        required
                                    />
                                )}
                            </div>

                            {/* User ID */}
                            <div className="space-y-1.5">
                                <Label htmlFor="playground-user-id" className="text-xs font-medium">
                                    User Identifier (Deterministic Hash)
                                </Label>
                                <Input
                                    id="playground-user-id"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="e.g. user_84920, guest-session-12"
                                    className="font-mono text-xs"
                                    required
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    The engine hashes this User ID for percentage rollout bucketing.
                                </p>
                            </div>

                            {/* Dynamic Attributes */}
                            <div className="space-y-2 pt-2 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">
                                        User Attributes (Evaluation Context)
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="xs"
                                        onClick={addAttributeRow}
                                        className="h-6 text-[11px] px-2"
                                    >
                                        <Plus className="size-3 mr-1" />
                                        Add Attribute
                                    </Button>
                                </div>

                                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {attributes.map((attr, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                placeholder="Key (e.g. country)"
                                                value={attr.key}
                                                onChange={(e) =>
                                                    updateAttributeRow(index, e.target.value, attr.value)
                                                }
                                                className="font-mono text-xs flex-1"
                                            />
                                            <Input
                                                placeholder="Value (e.g. US)"
                                                value={attr.value}
                                                onChange={(e) =>
                                                    updateAttributeRow(index, attr.key, e.target.value)
                                                }
                                                className="font-mono text-xs flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => removeAttributeRow(index)}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !flagKey.trim() || !userId.trim()}
                                className="w-full gap-2 text-xs font-semibold"
                            >
                                <Play className="size-3.5" />
                                {loading ? "Evaluating..." : "Evaluate Flag"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Output Card */}
                <Card className="md:col-span-5 flex flex-col justify-between">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Evaluation Result</CardTitle>
                        <CardDescription className="text-xs">
                            Runtime decision returned for {userId}.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col justify-center">
                        {!result ? (
                            <div className="py-12 text-center text-muted-foreground space-y-2">
                                <Gauge className="size-8 mx-auto opacity-40" />
                                <p className="text-xs">Click "Evaluate Flag" to see evaluation results.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in zoom-in-95 duration-150">
                                <div
                                    className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                                        result.enabled
                                            ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
                                            : "bg-muted/50 border-border text-muted-foreground"
                                    }`}
                                >
                                    {result.enabled ? (
                                        <CheckCircle2 className="size-8 text-green-600 shrink-0" />
                                    ) : (
                                        <XCircle className="size-8 text-muted-foreground shrink-0" />
                                    )}
                                    <div>
                                        <p className="text-lg font-bold tracking-tight">
                                            {result.enabled ? "ENABLED" : "DISABLED"}
                                        </p>
                                        <p className="text-xs font-medium opacity-90">
                                            Flag: <code className="font-mono">{flagKey}</code>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/60">
                                        <span className="text-muted-foreground font-medium">Evaluation Reason:</span>
                                        <Badge
                                            variant={REASON_MAP[result.reason]?.variant || "secondary"}
                                            className="font-mono text-[11px]"
                                        >
                                            {REASON_MAP[result.reason]?.label || result.reason}
                                        </Badge>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40 text-muted-foreground text-[11px]">
                                        {REASON_MAP[result.reason]?.desc || "Evaluated by engine."}
                                    </div>

                                    {latency !== null && (
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-muted-foreground text-[11px]">
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                Engine Latency:
                                            </span>
                                            <span className="font-mono font-semibold text-foreground">
                                                {latency} ms
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Live Metrics Grid */}
            <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                    <Activity className="size-4 text-muted-foreground" />
                    <h2 className="text-base font-bold tracking-tight text-foreground">
                        Environment Evaluation Metrics
                    </h2>
                </div>

                {metricsLoading && !metrics ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : metrics ? (
                    <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card className="shadow-2xs">
                                <CardContent className="pt-5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Total Evaluations
                                    </p>
                                    <p className="mt-1 text-2xl font-bold font-mono text-foreground">
                                        {metrics.totalEvaluations}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-2xs">
                                <CardContent className="pt-5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Enabled Results
                                    </p>
                                    <p className="mt-1 text-2xl font-bold font-mono text-green-600">
                                        {metrics.enabledEvaluations}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-2xs">
                                <CardContent className="pt-5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Disabled Results
                                    </p>
                                    <p className="mt-1 text-2xl font-bold font-mono text-muted-foreground">
                                        {metrics.disabledEvaluations}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-2xs">
                                <CardContent className="pt-5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Average Latency
                                    </p>
                                    <p className="mt-1 text-2xl font-bold font-mono text-foreground">
                                        {metrics.averageLatencyMs} ms
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Reason Breakdown */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">
                                    Evaluation Reason Breakdown
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Cumulative count of evaluation outcomes in this environment.
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {Object.entries(metrics.reasons).map(([key, count]) => (
                                        <div
                                            key={key}
                                            className="flex items-center justify-between rounded-lg border border-border/70 p-3 bg-card"
                                        >
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-medium text-foreground">
                                                    {REASON_MAP[key]?.label || key}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-mono">
                                                    {key}
                                                </p>
                                            </div>
                                            <span className="font-mono text-sm font-bold text-foreground">
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card className="bg-muted/10">
                        <CardContent className="py-6 text-center text-xs text-muted-foreground">
                            No evaluation metrics recorded yet in this environment.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}