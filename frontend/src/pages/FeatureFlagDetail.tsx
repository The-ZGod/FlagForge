import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    Edit2,
    Gauge,
    Play,
    Plus,
    Radio,
    Save,
    Sliders,
    Sparkles,
    Trash2,
    XCircle,
} from "lucide-react";

import {
    deleteFeatureFlag,
    getFeatureFlag,
    updateFeatureFlag,
    type FeatureFlag,
} from "@/lib/feature-flags";
import {
    createFlagRule,
    deleteFlagRule,
    getFlagRules,
    updateFlagRule,
    type FlagRule,
    type RuleOperator,
} from "@/lib/flag-rules";
import {
    evaluateFlag,
    type EvaluationResult,
    type UserAttributes,
} from "@/lib/evaluation";
import { getEnvironments, type Environment } from "@/lib/environments";
import { getProjects, type Project } from "@/lib/projects";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const REASON_LABELS: Record<string, { label: string; desc: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    FULL_ROLLOUT: {
        label: "100% Full Rollout",
        desc: "Flag is active and rollout is set to 100%. All users receive this feature.",
        variant: "default",
    },
    PERCENTAGE_ROLLOUT: {
        label: "Percentage Rollout Match",
        desc: "User ID was deterministically bucketed within the rollout percentage threshold.",
        variant: "default",
    },
    PERCENTAGE_ROLLOUT_EXCLUDED: {
        label: "Percentage Excluded",
        desc: "User ID bucket fell outside the configured percentage rollout range.",
        variant: "secondary",
    },
    TARGETING_RULE_NOT_MATCHED: {
        label: "Targeting Rules Failed",
        desc: "User attributes did not satisfy one or more required targeting conditions.",
        variant: "secondary",
    },
    FLAG_DISABLED: {
        label: "Flag Disabled",
        desc: "The flag master kill-switch is set to Disabled in this environment.",
        variant: "destructive",
    },
    FLAG_NOT_FOUND: {
        label: "Flag Not Found",
        desc: "No flag matching this key exists in the environment.",
        variant: "destructive",
    },
};

export function FeatureFlagDetail() {
    const { projectId, environmentId, flagId } = useParams();
    const navigate = useNavigate();

    const [flag, setFlag] = useState<FeatureFlag | null>(null);
    const [rules, setRules] = useState<FlagRule[]>([]);
    const [environment, setEnvironment] = useState<Environment | null>(null);
    const [project, setProject] = useState<Project | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copiedKey, setCopiedKey] = useState(false);

    // Rollout draft state
    const [draftRollout, setDraftRollout] = useState<number>(100);
    const [savingRollout, setSavingRollout] = useState(false);
    const [rolloutSavedSuccess, setRolloutSavedSuccess] = useState(false);

    // Toggle Flag state
    const [togglingFlag, setTogglingFlag] = useState(false);

    // Delete Flag Modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingFlag, setDeletingFlag] = useState(false);

    // Rule modal state
    const [ruleModalOpen, setRuleModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<FlagRule | null>(null);
    const [ruleAttribute, setRuleAttribute] = useState("");
    const [ruleOperator, setRuleOperator] = useState<RuleOperator>("EQUALS");
    const [ruleValue, setRuleValue] = useState("");
    const [savingRule, setSavingRule] = useState(false);
    const [ruleError, setRuleError] = useState("");

    // Evaluation playground state
    const [evalUserId, setEvalUserId] = useState("user-prod-101");
    const [evalAttributes, setEvalAttributes] = useState<Array<{ key: string; value: string }>>([
        { key: "country", value: "US" },
        { key: "plan", value: "enterprise" },
    ]);
    const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
    const [evaluating, setEvaluating] = useState(false);
    const [evalError, setEvalError] = useState("");
    const [evalLatency, setEvalLatency] = useState<number | null>(null);

    // Initial load
    useEffect(() => {
        if (!flagId) return;

        async function loadFlagWorkspace() {
            try {
                setLoading(true);
                setError("");

                const flagData = await getFeatureFlag(flagId!);
                setFlag(flagData);
                setDraftRollout(flagData.rolloutPercentage);

                const rulesData = await getFlagRules(flagId!);
                setRules(rulesData);

                if (projectId) {
                    const projectsList = await getProjects();
                    const p = projectsList.find((item) => item.id === projectId);
                    if (p) setProject(p);
                }

                if (projectId && environmentId) {
                    const envs = await getEnvironments(projectId);
                    const env = envs.find((e) => e.id === environmentId);
                    if (env) setEnvironment(env);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load feature flag details");
            } finally {
                setLoading(false);
            }
        }

        loadFlagWorkspace();
    }, [flagId, projectId, environmentId]);

    // Handle Enable/Disable Toggle
    async function handleToggleStatus() {
        if (!flag) return;
        try {
            setTogglingFlag(true);
            const nextState = !flag.enabled;
            const updated = await updateFeatureFlag(flag.id, nextState);
            setFlag(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to toggle feature flag");
        } finally {
            setTogglingFlag(false);
        }
    }

    // Handle Save Rollout Percentage
    async function handleSaveRollout() {
        if (!flag) return;
        try {
            setSavingRollout(true);
            setRolloutSavedSuccess(false);
            const updated = await updateFeatureFlag(flag.id, undefined, draftRollout);
            setFlag(updated);
            setRolloutSavedSuccess(true);
            setTimeout(() => setRolloutSavedSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update rollout percentage");
        } finally {
            setSavingRollout(false);
        }
    }

    // Handle Delete Flag
    async function handleDeleteFlagSubmit() {
        if (!flag || !projectId || !environmentId) return;
        try {
            setDeletingFlag(true);
            await deleteFeatureFlag(flag.id);
            navigate(`/projects/${projectId}/environments/${environmentId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete flag");
            setDeleteModalOpen(false);
        } finally {
            setDeletingFlag(false);
        }
    }

    // Handle Rule Modal Open
    function handleOpenAddRule() {
        setEditingRule(null);
        setRuleAttribute("");
        setRuleOperator("EQUALS");
        setRuleValue("");
        setRuleError("");
        setRuleModalOpen(true);
    }

    function handleOpenEditRule(rule: FlagRule) {
        setEditingRule(rule);
        setRuleAttribute(rule.attribute);
        setRuleOperator(rule.operator);
        setRuleValue(rule.value);
        setRuleError("");
        setRuleModalOpen(true);
    }

    // Handle Save Rule
    async function handleSaveRule(e: React.FormEvent) {
        e.preventDefault();
        if (!flag || !ruleAttribute.trim() || !ruleValue.trim()) return;

        try {
            setSavingRule(true);
            setRuleError("");

            if (editingRule) {
                const updated = await updateFlagRule(
                    editingRule.id,
                    ruleAttribute.trim(),
                    ruleOperator,
                    ruleValue.trim()
                );
                setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            } else {
                const created = await createFlagRule(
                    flag.id,
                    ruleAttribute.trim(),
                    ruleOperator,
                    ruleValue.trim()
                );
                setRules((prev) => [...prev, created]);
            }

            setRuleModalOpen(false);
        } catch (err) {
            setRuleError(err instanceof Error ? err.message : "Failed to save targeting rule");
        } finally {
            setSavingRule(false);
        }
    }

    // Handle Delete Rule
    async function handleDeleteRule(ruleId: string) {
        try {
            await deleteFlagRule(ruleId);
            setRules((prev) => prev.filter((r) => r.id !== ruleId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete targeting rule");
        }
    }

    // Handle Copy Flag Key
    function handleCopyKey() {
        if (!flag) return;
        navigator.clipboard.writeText(flag.key);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    }

    // Handle Evaluation Run
    async function handleRunEvaluation(e: React.FormEvent) {
        e.preventDefault();
        if (!flag || !environmentId) return;

        try {
            setEvaluating(true);
            setEvalError("");
            setEvalResult(null);

            const attrsObj: UserAttributes = {};
            evalAttributes.forEach((attr) => {
                if (attr.key.trim() && attr.value.trim()) {
                    attrsObj[attr.key.trim()] = attr.value.trim();
                }
            });

            const start = performance.now();
            const res = await evaluateFlag({
                environmentId,
                flagKey: flag.key,
                userId: evalUserId.trim(),
                attributes: attrsObj,
            });
            const end = performance.now();
            setEvalLatency(Math.round(end - start));
            setEvalResult(res);
        } catch (err) {
            setEvalError(err instanceof Error ? err.message : "Evaluation failed");
        } finally {
            setEvaluating(false);
        }
    }

    function addAttributeRow() {
        setEvalAttributes((prev) => [...prev, { key: "", value: "" }]);
    }

    function removeAttributeRow(index: number) {
        setEvalAttributes((prev) => prev.filter((_, i) => i !== index));
    }

    function updateAttributeRow(index: number, key: string, value: string) {
        setEvalAttributes((prev) =>
            prev.map((item, i) => (i === index ? { key, value } : item))
        );
    }

    if (loading) {
        return (
            <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error && !flag) {
        return (
            <div className="p-6 md:p-8 max-w-5xl mx-auto">
                <Card className="border-destructive/40 bg-destructive/5 p-8 text-center space-y-4">
                    <AlertCircle className="size-10 text-destructive mx-auto" />
                    <div>
                        <h3 className="text-lg font-bold text-destructive">Feature Flag Not Found</h3>
                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    </div>
                    <Link
                        to={
                            projectId && environmentId
                                ? `/projects/${projectId}/environments/${environmentId}`
                                : "/dashboard"
                        }
                    >
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="size-4" />
                            Back to Feature Flags
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (!flag) return null;

    const rolloutChanged = draftRollout !== flag.rolloutPercentage;

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
            {/* Top Breadcrumb & Actions */}
            <div className="flex items-center justify-between">
                <Link
                    to={`/projects/${projectId}/environments/${environmentId}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Feature Flags</span>
                    {environment && (
                        <span className="text-muted-foreground/70 font-mono">({environment.name})</span>
                    )}
                </Link>

                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteModalOpen(true)}
                    className="gap-1.5 text-xs font-semibold h-8"
                >
                    <Trash2 className="size-3.5" />
                    <span>Delete Flag</span>
                </Button>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="text-xs underline cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Main Flag Header Banner */}
            <Card className="border-border/80 shadow-xs">
                <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate text-foreground">
                                    {flag.name}
                                </h1>
                                <Badge
                                    variant={flag.enabled ? "default" : "secondary"}
                                    className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5"
                                >
                                    {flag.enabled ? "ENABLED" : "DISABLED"}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                                <span className="font-medium">Flag Key:</span>
                                <button
                                    type="button"
                                    onClick={handleCopyKey}
                                    className="inline-flex items-center gap-1 rounded bg-muted/80 hover:bg-muted px-2 py-0.5 font-mono text-xs font-medium text-foreground transition-colors cursor-pointer"
                                    title="Click to copy key"
                                >
                                    <span>{flag.key}</span>
                                    {copiedKey ? (
                                        <Check className="size-3 text-green-600" />
                                    ) : (
                                        <Copy className="size-3 text-muted-foreground" />
                                    )}
                                </button>

                                {project && environment && (
                                    <>
                                        <span>•</span>
                                        <span className="font-medium text-foreground/80">
                                            {project.name} / {environment.name}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Master Toggle Switch */}
                        <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border/60 shrink-0 self-start sm:self-auto">
                            <div className="text-right">
                                <p className="text-xs font-bold text-foreground">Master Status</p>
                                <p className="text-[11px] text-muted-foreground">
                                    {flag.enabled ? "Serving live values" : "Kill-switch active"}
                                </p>
                            </div>
                            <Switch
                                checked={flag.enabled}
                                onCheckedChange={handleToggleStatus}
                                disabled={togglingFlag}
                                aria-label="Toggle feature flag status"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs: Configuration vs Evaluation */}
            <Tabs defaultValue="configuration" className="w-full">
                <TabsList className="grid w-full sm:w-80 grid-cols-2">
                    <TabsTrigger value="configuration" className="gap-2 text-sm font-medium">
                        <Sliders className="size-4" />
                        <span>Configuration</span>
                    </TabsTrigger>
                    <TabsTrigger value="evaluation" className="gap-2 text-sm font-medium">
                        <Sparkles className="size-4" />
                        <span>Evaluation</span>
                    </TabsTrigger>
                </TabsList>

                {/* Configuration Tab */}
                <TabsContent value="configuration" className="space-y-6 pt-2">
                    {/* Rollout Percentage Section */}
                    <Card className="shadow-xs">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold">
                                        Percentage Rollout
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Gradually release this flag to a deterministic percentage of your user base using Murmur3 user ID hashing.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-extrabold font-mono text-foreground">
                                        {draftRollout}%
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3 pt-2">
                                <Slider
                                    value={draftRollout}
                                    onChange={(v) => setDraftRollout(v)}
                                    min={0}
                                    max={100}
                                    step={1}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                                    <span>0% (Disabled)</span>
                                    <span>25%</span>
                                    <span>50%</span>
                                    <span>75%</span>
                                    <span>100% (All Users)</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    {rolloutChanged ? (
                                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                                            Unsaved draft change (Live in engine: {flag.rolloutPercentage}%)
                                        </span>
                                    ) : (
                                        <span>Live in runtime engine: {flag.rolloutPercentage}%</span>
                                    )}
                                </p>

                                <div className="flex items-center gap-2">
                                    {rolloutSavedSuccess && (
                                        <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                            <Check className="size-4" />
                                            Saved!
                                        </span>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={handleSaveRollout}
                                        disabled={savingRollout || !rolloutChanged}
                                        className="gap-1.5 text-xs sm:text-sm font-semibold h-8.5"
                                    >
                                        <Save className="size-4" />
                                        <span>{savingRollout ? "Saving..." : "Save Rollout"}</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Targeting Rules Section */}
                    <Card className="shadow-xs">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base font-bold">
                                        Targeting Rules
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Target specific user cohorts based on custom attributes before rollout percentage is evaluated.
                                    </CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={handleOpenAddRule}
                                    className="gap-1.5 text-xs sm:text-sm font-semibold self-start sm:self-auto h-8.5"
                                >
                                    <Plus className="size-4" />
                                    <span>Add Rule</span>
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {rules.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-muted/20 space-y-2">
                                    <Radio className="size-8 text-muted-foreground mx-auto opacity-50" />
                                    <h4 className="text-sm font-bold text-foreground">No Targeting Rules Configured</h4>
                                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                        All users will directly receive percentage rollout evaluation. Add targeting rules to restrict this flag to specific countries, user plans, or beta groups.
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleOpenAddRule}
                                        className="mt-2 gap-1.5 text-xs"
                                    >
                                        <Plus className="size-3.5" />
                                        <span>Add First Rule</span>
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-border border rounded-xl overflow-hidden bg-card shadow-2xs">
                                    {rules.map((rule, idx) => (
                                        <div
                                            key={rule.id}
                                            className="flex items-center justify-between p-3.5 sm:p-4 gap-4 hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                                    {idx + 1}
                                                </span>

                                                <div className="flex items-center gap-2 flex-wrap text-sm">
                                                    <span className="font-mono font-semibold text-foreground bg-muted px-2.5 py-0.5 rounded">
                                                        {rule.attribute}
                                                    </span>

                                                    <Badge
                                                        variant={rule.operator === "EQUALS" ? "default" : "secondary"}
                                                        className="text-[10px] font-mono uppercase"
                                                    >
                                                        {rule.operator}
                                                    </Badge>

                                                    <span className="font-mono font-medium text-foreground bg-muted/60 px-2.5 py-0.5 rounded">
                                                        "{rule.value}"
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => handleOpenEditRule(rule)}
                                                    title="Edit rule"
                                                >
                                                    <Edit2 className="size-4 text-muted-foreground" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => handleDeleteRule(rule.id)}
                                                    className="hover:text-destructive"
                                                    title="Delete rule"
                                                >
                                                    <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Evaluation Tab */}
                <TabsContent value="evaluation" className="space-y-6 pt-2">
                    <div className="grid gap-6 md:grid-cols-12">
                        {/* Evaluation Form */}
                        <Card className="md:col-span-7 shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold">
                                    Flag Evaluation Simulator
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Test deterministic bucketing and targeting rules for <code className="font-mono font-semibold text-foreground">{flag.key}</code>.
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleRunEvaluation} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="eval-user-id" className="text-sm font-medium">
                                            User ID (Required for Rollout Bucketing)
                                        </Label>
                                        <Input
                                            id="eval-user-id"
                                            value={evalUserId}
                                            onChange={(e) => setEvalUserId(e.target.value)}
                                            placeholder="e.g. user_84920, guest-session-12"
                                            className="font-mono text-sm"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            The evaluation engine computes a deterministic hash against this User ID.
                                        </p>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-border">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">
                                                Evaluation Attributes (Context)
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="xs"
                                                onClick={addAttributeRow}
                                                className="h-7 text-xs px-2.5 gap-1"
                                            >
                                                <Plus className="size-3.5" />
                                                Add Attribute
                                            </Button>
                                        </div>

                                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                            {evalAttributes.map((attr, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="Key (e.g. country)"
                                                        value={attr.key}
                                                        onChange={(e) =>
                                                            updateAttributeRow(index, e.target.value, attr.value)
                                                        }
                                                        className="font-mono text-xs sm:text-sm flex-1"
                                                    />
                                                    <Input
                                                        placeholder="Value (e.g. US)"
                                                        value={attr.value}
                                                        onChange={(e) =>
                                                            updateAttributeRow(index, attr.key, e.target.value)
                                                        }
                                                        className="font-mono text-xs sm:text-sm flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() => removeAttributeRow(index)}
                                                        className="text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {evalError && (
                                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                                            {evalError}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={evaluating || !evalUserId.trim()}
                                        className="w-full gap-2 text-sm font-semibold h-10"
                                    >
                                        <Play className="size-4" />
                                        <span>{evaluating ? "Evaluating..." : "Run Evaluation"}</span>
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Evaluation Result Output */}
                        <Card className="md:col-span-5 flex flex-col justify-between shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold">Evaluation Output</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Live verdict returned by FlagForge backend engine.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col justify-center">
                                {!evalResult ? (
                                    <div className="py-12 text-center text-muted-foreground space-y-2">
                                        <Gauge className="size-10 mx-auto opacity-40" />
                                        <p className="text-xs sm:text-sm">Click "Run Evaluation" to test this flag.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in zoom-in-95 duration-150">
                                        <div
                                            className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                                                evalResult.enabled
                                                    ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
                                                    : "bg-muted/50 border-border text-muted-foreground"
                                            }`}
                                        >
                                            {evalResult.enabled ? (
                                                <CheckCircle2 className="size-9 text-green-600 shrink-0" />
                                            ) : (
                                                <XCircle className="size-9 text-muted-foreground shrink-0" />
                                            )}
                                            <div>
                                                <p className="text-xl font-extrabold tracking-tight">
                                                    {evalResult.enabled ? "ENABLED" : "DISABLED"}
                                                </p>
                                                <p className="text-xs font-medium opacity-90">
                                                    Flag state for {evalUserId}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5 text-xs sm:text-sm">
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/60">
                                                <span className="text-muted-foreground font-medium">Evaluation Reason:</span>
                                                <Badge
                                                    variant={REASON_LABELS[evalResult.reason]?.variant || "secondary"}
                                                    className="font-mono text-xs font-semibold"
                                                >
                                                    {REASON_LABELS[evalResult.reason]?.label || evalResult.reason}
                                                </Badge>
                                            </div>

                                            <div className="p-3 rounded-lg bg-muted/20 border border-border/40 text-muted-foreground text-xs leading-relaxed">
                                                {REASON_LABELS[evalResult.reason]?.desc || "Evaluated by engine."}
                                            </div>

                                            {evalLatency !== null && (
                                                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 text-muted-foreground text-xs">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="size-3.5" />
                                                        Roundtrip Latency:
                                                    </span>
                                                    <span className="font-mono font-bold text-foreground">
                                                        {evalLatency} ms
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Rule Modal (Create / Edit) */}
            <Dialog open={ruleModalOpen} onOpenChange={setRuleModalOpen}>
                <DialogClose onClose={() => setRuleModalOpen(false)} />
                <DialogHeader>
                    <DialogTitle>{editingRule ? "Edit Targeting Rule" : "Add Targeting Rule"}</DialogTitle>
                    <DialogDescription>
                        Evaluate user attributes before percentage rollout bucketing.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSaveRule} className="space-y-4">
                    {ruleError && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                            {ruleError}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="rule-attr" className="text-sm font-medium">User Attribute</Label>
                        <Input
                            id="rule-attr"
                            placeholder="e.g. country, plan, tier, role"
                            value={ruleAttribute}
                            onChange={(e) => setRuleAttribute(e.target.value)}
                            required
                            autoFocus
                            className="text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="rule-op" className="text-sm font-medium">Operator</Label>
                        <select
                            id="rule-op"
                            value={ruleOperator}
                            onChange={(e) => setRuleOperator(e.target.value as RuleOperator)}
                            className="w-full h-10 rounded-lg border border-input bg-card px-3 text-sm font-mono shadow-xs focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
                        >
                            <option value="EQUALS">EQUALS</option>
                            <option value="NOT_EQUALS">NOT_EQUALS</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="rule-val" className="text-sm font-medium">Target Value</Label>
                        <Input
                            id="rule-val"
                            placeholder="e.g. US, enterprise, beta"
                            value={ruleValue}
                            onChange={(e) => setRuleValue(e.target.value)}
                            required
                            className="text-sm"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setRuleModalOpen(false)}
                            className="text-xs sm:text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={savingRule || !ruleAttribute.trim() || !ruleValue.trim()}
                            className="text-xs sm:text-sm font-semibold"
                        >
                            {savingRule ? "Saving..." : editingRule ? "Update Rule" : "Add Rule"}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>

            {/* Delete Flag Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogClose onClose={() => setDeleteModalOpen(false)} />
                <DialogHeader>
                    <DialogTitle>Delete Feature Flag</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to permanently delete <strong className="text-foreground">{flag.name}</strong> (<code className="font-mono">{flag.key}</code>)?
                        This action cannot be undone and will immediately affect client evaluations.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDeleteModalOpen(false)}
                        className="text-xs sm:text-sm"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDeleteFlagSubmit}
                        disabled={deletingFlag}
                        className="text-xs sm:text-sm font-semibold"
                    >
                        {deletingFlag ? "Deleting..." : "Permanently Delete Flag"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}