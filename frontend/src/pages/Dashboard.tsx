import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    FolderKanban,
    Layers,
    Plus,
    Radio,
    Sliders,
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

    const enabledCount = flags.filter((f) => f.enabled).length;
    const totalRules = flags.reduce((acc, f) => acc + f.rules.length, 0);

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Overview
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Live status and activity across all projects, environments, and feature flags.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link to="/projects">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <FolderKanban className="size-3.5" />
                            <span>Projects</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                    {error}
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
                        <FolderKanban className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono text-foreground">
                            {loading ? <Skeleton className="h-8 w-12" /> : projects.length}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
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
                        <Layers className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono text-foreground">
                            {loading ? <Skeleton className="h-8 w-12" /> : environments.length}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
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
                        <Radio className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono text-foreground">
                            {loading ? <Skeleton className="h-8 w-12" /> : flags.length}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                            <span className="font-semibold text-foreground">{enabledCount}</span>
                            <span>enabled</span>
                            <span>•</span>
                            <span className="font-semibold text-foreground">{flags.length - enabledCount}</span>
                            <span>disabled</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Targeting Rules */}
                <Card className="shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Targeting Rules
                        </CardTitle>
                        <Sliders className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono text-foreground">
                            {loading ? <Skeleton className="h-8 w-12" /> : totalRules}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Active targeting constraints
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Feature Flags Inventory */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-foreground">
                            Active Feature Flags
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Global view of feature flags across your environments.
                        </p>
                    </div>

                    {projects.length > 0 && environments.length > 0 && (
                        <Link
                            to={`/projects/${projects[0].id}/environments/${environments[0].id}`}
                            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                        >
                            <span>Open Inventory</span>
                            <ArrowRight className="size-3" />
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : flags.length === 0 ? (
                    <Card className="border-dashed border-border/80 bg-muted/20">
                        <CardContent className="py-12 text-center space-y-3">
                            <Radio className="size-10 text-muted-foreground mx-auto opacity-40" />
                            <div>
                                <h3 className="text-base font-semibold text-foreground">No Feature Flags Yet</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    Create a project and environment to start managing your feature flags.
                                </p>
                            </div>
                            <Link to="/projects">
                                <Button size="sm" className="gap-1.5 text-xs mt-2">
                                    <Plus className="size-3.5" />
                                    Go to Projects
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="rounded-xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60">
                        {flags.map((flag) => {
                            const flagUrl = `/projects/${flag.projectId}/environments/${flag.environmentId}/flags/${flag.id}`;

                            return (
                                <div
                                    key={flag.id}
                                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <Link
                                                to={flagUrl}
                                                className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate"
                                            >
                                                {flag.name}
                                            </Link>
                                            <Badge
                                                variant={flag.enabled ? "default" : "secondary"}
                                                className="text-[10px] h-4 px-1.5"
                                            >
                                                {flag.enabled ? "Enabled" : "Disabled"}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                            <code className="font-mono text-[11px] bg-muted/60 px-1.5 py-0.5 rounded text-foreground">
                                                {flag.key}
                                            </code>
                                            <span>•</span>
                                            <span>
                                                {flag.projectName} / {flag.environmentName}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-muted-foreground">Rollout:</span>
                                            <span className="font-mono font-semibold text-foreground">
                                                {flag.rolloutPercentage}%
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-muted-foreground">Targeting:</span>
                                            <span className="font-medium text-foreground">
                                                {flag.rules.length} {flag.rules.length === 1 ? "rule" : "rules"}
                                            </span>
                                        </div>

                                        <Switch
                                            checked={flag.enabled}
                                            onCheckedChange={() => handleToggleFlag(flag)}
                                            aria-label={`Toggle ${flag.name}`}
                                        />

                                        <Link
                                            to={flagUrl}
                                            className="inline-flex size-7 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                            title="Open flag workspace"
                                        >
                                            <ArrowRight className="size-3.5" />
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