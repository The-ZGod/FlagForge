import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Check,
    Copy,
    FolderKanban,
    Layers,
    Radio,
    Sliders,
    Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import { getProjects, type Project } from "@/lib/projects";
import { getEnvironments, type Environment } from "@/lib/environments";
import {
    getFeatureFlags,
    updateFeatureFlag,
    type FeatureFlag,
} from "@/lib/feature-flags";
import { getFlagRules, type FlagRule } from "@/lib/flag-rules";

interface ExtendedFlag extends FeatureFlag {
    projectName: string;
    projectId: string;
    environmentName: string;
    rules: FlagRule[];
}

export function Dashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [flags, setFlags] = useState<ExtendedFlag[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    async function loadDashboardData() {
        try {
            setLoading(true);
            setError("");

            const projectList = await getProjects();
            setProjects(projectList);

            const envNested = await Promise.all(
                projectList.map((p) => getEnvironments(p.id))
            );
            const allEnvironments = envNested.flat();
            setEnvironments(allEnvironments);

            const flagResults = await Promise.all(
                allEnvironments.map(async (env) => {
                    const parentProj = projectList.find(
                        (p) => p.id === env.projectId
                    );
                    const envFlags = await getFeatureFlags(env.id);

                    const flagsWithRules = await Promise.all(
                        envFlags.map(async (flag) => {
                            const rules = await getFlagRules(flag.id);
                            return {
                                ...flag,
                                projectId: env.projectId,
                                projectName: parentProj?.name || "Project",
                                environmentName: env.name,
                                rules,
                            };
                        })
                    );
                    return flagsWithRules;
                })
            );

            const allFlags = flagResults.flat();
            setFlags(allFlags);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load dashboard data"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function handleToggleFlag(flag: ExtendedFlag) {
        try {
            const updated = await updateFeatureFlag(flag.id, !flag.enabled);
            setFlags((prev) =>
                prev.map((f) =>
                    f.id === updated.id
                        ? { ...f, enabled: updated.enabled }
                        : f
                )
            );
        } catch (err) {
            console.error("Failed to toggle flag", err);
        }
    }

    function handleCopyKey(key: string, e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    }

    const enabledCount = flags.filter((f) => f.enabled).length;
    const totalRules = flags.reduce((acc, f) => acc + f.rules.length, 0);

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Real-time status across projects, deployment environments, and targeting rules.
                    </p>
                </div>

                {projects.length > 0 && environments.length > 0 && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Link to={`/projects/${projects[0].id}/environments/${environments[0].id}/evaluate`}>
                            <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm font-medium">
                                <Sparkles className="size-4 text-primary" />
                                <span>Evaluation Playground</span>
                            </Button>
                        </Link>
                        <Link to={`/projects/${projects[0].id}/environments/${environments[0].id}`}>
                            <Button size="sm" className="gap-1.5 text-xs sm:text-sm font-semibold shadow-xs">
                                <span>Manage Feature Flags</span>
                                <ArrowRight className="size-4" />
                            </Button>
                        </Link>
                    </div>
                )}
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

            {/* Metrics Overview Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Projects */}
                <Card className="shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Projects
                        </CardTitle>
                        <FolderKanban className="size-4.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold font-mono text-foreground">
                            {loading ? <Skeleton className="h-9 w-14" /> : projects.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                            Active workspaces
                        </p>
                    </CardContent>
                </Card>

                {/* Total Environments */}
                <Card className="shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Environments
                        </CardTitle>
                        <Layers className="size-4.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold font-mono text-foreground">
                            {loading ? <Skeleton className="h-9 w-14" /> : environments.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                            Across all projects
                        </p>
                    </CardContent>
                </Card>

                {/* Total Feature Flags */}
                <Card className="shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Feature Flags
                        </CardTitle>
                        <Radio className="size-4.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold font-mono text-foreground">
                            {loading ? <Skeleton className="h-9 w-14" /> : flags.length}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="font-semibold text-green-600 dark:text-green-400">{enabledCount} enabled</span>
                            <span>•</span>
                            <span className="font-semibold text-muted-foreground">{flags.length - enabledCount} disabled</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Targeting Rules */}
                <Card className="shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Targeting Rules
                        </CardTitle>
                        <Sliders className="size-4.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold font-mono text-foreground">
                            {loading ? <Skeleton className="h-9 w-14" /> : totalRules}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                            Active attribute constraints
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Feature Flags Inventory Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                            Active Feature Flags
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Global inventory across all configured projects and deployment environments.
                        </p>
                    </div>

                    {projects.length > 0 && environments.length > 0 && (
                        <Link
                            to={`/projects/${projects[0].id}/environments/${environments[0].id}`}
                            className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
                        >
                            <span>Open Environment Workspace</span>
                            <ArrowRight className="size-3.5" />
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : flags.length === 0 ? (
                    <Card className="border-dashed border-border/80 bg-muted/20">
                        <CardContent className="py-14 text-center space-y-3">
                            <Radio className="size-12 text-muted-foreground mx-auto opacity-40" />
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">No Feature Flags Found</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                                    Use the top Project Selector to create a project and environment to start managing feature flags.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="rounded-xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-2xs">
                        {flags.map((flag) => {
                            const flagUrl = `/projects/${flag.projectId}/environments/${flag.environmentId}/flags/${flag.id}`;

                            return (
                                <div
                                    key={flag.id}
                                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <Link
                                                to={flagUrl}
                                                className="font-semibold text-sm sm:text-base text-foreground hover:text-primary transition-colors truncate"
                                            >
                                                {flag.name}
                                            </Link>
                                            <Badge
                                                variant={flag.enabled ? "default" : "secondary"}
                                                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5"
                                            >
                                                {flag.enabled ? "Enabled" : "Disabled"}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                            <button
                                                type="button"
                                                onClick={(e) => handleCopyKey(flag.key, e)}
                                                className="inline-flex items-center gap-1 font-mono text-[11px] bg-muted/80 hover:bg-muted px-2 py-0.5 rounded text-foreground transition-colors cursor-pointer"
                                                title="Click to copy key"
                                            >
                                                <span>{flag.key}</span>
                                                {copiedKey === flag.key ? (
                                                    <Check className="size-2.5 text-green-600" />
                                                ) : (
                                                    <Copy className="size-2.5 text-muted-foreground" />
                                                )}
                                            </button>
                                            <span>•</span>
                                            <span className="font-medium text-foreground/80">
                                                {flag.projectName}
                                            </span>
                                            <span>/</span>
                                            <span className="font-medium text-foreground">
                                                {flag.environmentName}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                                        <div className="flex items-center gap-1.5 text-xs sm:text-sm bg-muted/40 px-2.5 py-1 rounded-md border border-border/40">
                                            <span className="text-muted-foreground">Rollout:</span>
                                            <span className="font-mono font-bold text-foreground">
                                                {flag.rolloutPercentage}%
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs sm:text-sm bg-muted/40 px-2.5 py-1 rounded-md border border-border/40">
                                            <span className="text-muted-foreground">Targeting:</span>
                                            <span className="font-medium text-foreground">
                                                {flag.rules.length} {flag.rules.length === 1 ? "rule" : "rules"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={flag.enabled}
                                                onCheckedChange={() => handleToggleFlag(flag)}
                                                aria-label={`Toggle ${flag.name}`}
                                            />
                                        </div>

                                        <Link
                                            to={flagUrl}
                                            className="inline-flex size-8 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                            title="Open flag workspace"
                                        >
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}