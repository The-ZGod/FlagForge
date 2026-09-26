import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";
import {
    Activity,
    ArrowRight,
    Check,
    Copy,
    Gauge,
    FolderKanban,
    Layers,
    Plus,
    Radio,
    RefreshCw,
    Sliders,
    Sparkles,
    Zap,
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

import { getProjects, openCreateProjectModal, type Project } from "@/lib/projects";
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

        const handleProjectCreated = () => {
            loadDashboardData();
        };

        window.addEventListener("flagforge:project-created", handleProjectCreated);
        return () => {
            window.removeEventListener("flagforge:project-created", handleProjectCreated);
        };
    }, []);

    useEffect(() => {
        if (loading) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".dashboard-reveal",
                { opacity: 0, y: 18 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.65,
                    stagger: 0.07,
                    ease: "power3.out",
                }
            );

            gsap.fromTo(
                ".dashboard-metric",
                { opacity: 0, y: 14, scale: 0.985 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.55,
                    stagger: 0.08,
                    ease: "power3.out",
                    delay: 0.12,
                }
            );

            gsap.fromTo(
                ".dashboard-flag-row",
                { opacity: 0, x: 12 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.5,
                    stagger: 0.06,
                    ease: "power2.out",
                    delay: 0.22,
                }
            );
        });

        return () => {
            ctx.revert();
        };
    }, [loading]);

    async function handleToggleFlag(flag: ExtendedFlag) {
        try {
            const updated = await updateFeatureFlag(flag.id, !flag.enabled);
            setFlags((prev) =>
                prev.map((item) =>
                    item.id === updated.id
                        ? { ...item, enabled: updated.enabled }
                        : item
                )
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update feature flag"
            );
        }
    }

    function handleCopyKey(key: string, event: React.MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        window.setTimeout(() => setCopiedKey(null), 1500);
    }

    const enabledCount = flags.filter((flag) => flag.enabled).length;
    const totalRules = flags.reduce((total, flag) => total + flag.rules.length, 0);

    useLocomotiveScroll();

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-[#080808] text-white">
            {/* Ambient dashboard lighting */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.08),transparent_42%),linear-gradient(180deg,#0b0b0b_0%,#070707_55%,#050505_100%)]">
                <div className="absolute left-[10%] top-[-18rem] h-[38rem] w-[38rem] rounded-full bg-white/[0.055] blur-[120px]" />
                <div className="absolute right-[-12rem] top-[24rem] h-[34rem] w-[34rem] rounded-full bg-white/[0.035] blur-[120px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>

            <div className="mx-auto w-full max-w-screen-2xl space-y-5 p-3 sm:space-y-7 sm:p-5 md:p-6 lg:p-8 xl:p-10">
                {/* Command header */}
                <section className="dashboard-reveal relative overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.035] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:rounded-3xl sm:p-6 md:p-7">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.13),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_55%)]" />
                    <div className="relative flex min-w-0 flex-col gap-5 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0 max-w-2xl space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                                Control Center
                            </div>
                            <div>
                                <h1 className="text-[1.75rem] font-bold leading-tight tracking-[-0.045em] text-white sm:text-4xl lg:text-[2.85rem]">
                                    Dashboard Overview
                                </h1>
                                <p className="mt-2 max-w-xl text-[13px] leading-5 text-white/55 sm:text-sm sm:leading-6">
                                    Monitor your release surface, environments, feature flags, and targeting rules from one place.
                                </p>
                            </div>
                        </div>

                        {projects.length > 0 && environments.length > 0 ? (
                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                <Link to={`/projects/${projects[0].id}/environments/${environments[0].id}/evaluate`}>
                                    <Button variant="outline" className="group h-10 w-full gap-2 rounded-xl border-white/[0.14] bg-white/[0.045] px-4 text-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-white/[0.24] hover:bg-white/[0.08] hover:-translate-y-0.5 sm:w-auto">
                                        <Sparkles className="size-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                                        Evaluation Playground
                                        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                                    </Button>
                                </Link>
                                <Link to={`/projects/${projects[0].id}/environments/${environments[0].id}`}>
                                    <Button className="group h-10 w-full gap-2 rounded-xl bg-white px-4 text-black shadow-[0_10px_35px_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 sm:w-auto">
                                        Manage Feature Flags
                                        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                                    </Button>
                                </Link>
                            </div>
                        ) : projects.length === 0 && !loading ? (
                            <div className="flex w-full sm:w-auto">
                                <Button
                                    onClick={openCreateProjectModal}
                                    className="group h-10 w-full gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black shadow-[0_10px_35px_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 sm:w-auto"
                                >
                                    <Plus className="size-4" />
                                    Create Project
                                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </section>

                {error && (
                    <div className="dashboard-reveal flex flex-col items-start justify-between gap-3 rounded-2xl sm:flex-row sm:items-center border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        <span>{error}</span>
                        <button type="button" onClick={() => setError("")} className="shrink-0 text-xs underline">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* System snapshot */}
                <section className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                    {[
                        {
                            label: "Projects",
                            value: projects.length,
                            sub: "Active workspaces",
                            icon: FolderKanban,
                        },
                        {
                            label: "Environments",
                            value: environments.length,
                            sub: "Across all projects",
                            icon: Layers,
                        },
                        {
                            label: "Feature Flags",
                            value: flags.length,
                            sub: `${enabledCount} enabled · ${flags.length - enabledCount} disabled`,
                            icon: Radio,
                        },
                        {
                            label: "Targeting Rules",
                            value: totalRules,
                            sub: "Active attribute constraints",
                            icon: Sliders,
                        },
                    ].map((metric) => {
                        const Icon = metric.icon;
                        return (
                            <Card
                                key={metric.label}
                                className="dashboard-metric group relative min-w-0 overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.035] shadow-[0_18px_60px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1.5 hover:border-white/[0.22] hover:bg-white/[0.055] hover:shadow-[0_24px_70px_rgba(0,0,0,0.42)]"
                            >
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(220px_circle_at_var(--mx,50%)_0%,rgba(255,255,255,0.12),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                <CardContent className="relative p-4 sm:p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                                                {metric.label}
                                            </p>
                                            <div className="pt-2 text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
                                                {loading ? <Skeleton className="h-9 w-14" /> : metric.value}
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-white/[0.12] bg-white/[0.055] p-2.5 text-white/55 transition-all duration-300 group-hover:border-foreground/15 group-hover:text-foreground group-hover:rotate-3">
                                            <Icon className="size-4" />
                                        </div>
                                    </div>
                                    <p className="mt-3 text-xs font-medium text-white/45">
                                        {metric.sub}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </section>

                {/* Operational overview */}
                <section className="grid min-w-0 items-stretch gap-4 md:gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <Card className="dashboard-reveal h-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.03] shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
                        <CardHeader className="min-h-[92px] border-b border-white/[0.09] bg-white/[0.018] px-4 py-4 sm:px-6">
                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold tracking-tight text-white">
                                        Active Feature Flags
                                    </CardTitle>
                                    <p className="mt-1 text-xs text-white/45">
                                        Global inventory across projects and deployment environments.
                                    </p>
                                </div>
                                {projects.length > 0 && environments.length > 0 && (
                                    <Link
                                        to={`/projects/${projects[0].id}/environments/${environments[0].id}`}
                                        className="group inline-flex items-center gap-1.5 text-xs font-semibold text-foreground transition-colors hover:text-primary"
                                    >
                                        Open workspace
                                        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                )}
                            </div>
                        </CardHeader>

                        {loading ? (
                            <div className="space-y-px p-2">
                                {[1, 2, 3].map((item) => (
                                    <Skeleton key={item} className="h-24 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : flags.length === 0 ? (
                            <CardContent className="py-16 text-center">
                                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.03]">
                                    {projects.length === 0 ? (
                                        <FolderKanban className="size-5 text-white/60" />
                                    ) : (
                                        <Radio className="size-5 text-muted-foreground" />
                                    )}
                                </div>
                                <h3 className="font-semibold text-white">
                                    {projects.length === 0 ? "Create your first project" : "No Feature Flags Found"}
                                </h3>
                                <p className="mx-auto mt-1 max-w-md text-sm text-white/50">
                                    {projects.length === 0
                                        ? "Projects contain your environments, feature flags, and evaluations."
                                        : "Create an environment to start managing feature flags."}
                                </p>
                                {projects.length === 0 && (
                                    <Button
                                        onClick={openCreateProjectModal}
                                        className="mt-4 gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black hover:bg-white/90 shadow-[0_8px_30px_rgba(255,255,255,0.1)]"
                                    >
                                        <Plus className="size-3.5" />
                                        Create Project
                                    </Button>
                                )}
                            </CardContent>
                        ) : (
                            <div className="space-y-4 p-4">
                                {flags.map((flag) => {
                                    const flagUrl = `/projects/${flag.projectId}/environments/${flag.environmentId}/flags/${flag.id}`;

                                    return (
                                        <div
                                            key={flag.id}
                                            className="dashboard-flag-row group relative min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.05] sm:p-5"
                                        >
                                            {/* Flag identity */}
                                            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2.5">
                                                        <Link
                                                            to={flagUrl}
                                                            className="block max-w-full truncate text-sm font-bold tracking-tight text-white transition-colors hover:text-white/75 sm:text-lg"
                                                        >
                                                            {flag.name}
                                                        </Link>

                                                        <Badge
                                                            variant={flag.enabled ? "default" : "secondary"}
                                                            className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${flag.enabled
                                                                ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                                                : "border border-white/10 bg-white/5 text-white/45"
                                                                }`}
                                                        >
                                                            {flag.enabled ? "Live" : "Off"}
                                                        </Badge>
                                                    </div>

                                                    <div className="mt-2 flex max-w-full flex-wrap items-center gap-1.5 text-[10px] text-white/40 sm:gap-2 sm:text-[11px]">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleCopyKey(flag.key, e)}
                                                            className="group/key inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/30 px-2 py-1.5 font-mono text-[10px] text-white/65 transition-all hover:border-white/20 hover:bg-black/50 hover:text-white sm:text-[11px]"
                                                            title="Copy feature flag key"
                                                        >
                                                            {flag.key}
                                                            {copiedKey === flag.key ? (
                                                                <Check className="size-2.5 text-emerald-400" />
                                                            ) : (
                                                                <Copy className="size-2.5 opacity-50 transition-opacity group-hover/key:opacity-100" />
                                                            )}
                                                        </button>
                                                        <span>/</span>
                                                        <span>{flag.projectName}</span>
                                                        <span>/</span>
                                                        <span className="font-medium text-white/60">{flag.environmentName}</span>
                                                    </div>
                                                </div>

                                                {/* Primary controls */}
                                                <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:pt-0.5">
                                                    <span className={`mr-auto text-[10px] font-semibold sm:text-[11px] lg:mr-0 ${flag.enabled ? "text-emerald-300" : "text-white/40"
                                                        }`}>
                                                        {flag.enabled ? "Serving users" : "Not serving users"}
                                                    </span>

                                                    <Switch
                                                        checked={flag.enabled}
                                                        onCheckedChange={() => handleToggleFlag(flag)}
                                                        aria-label={`Toggle ${flag.name}`}
                                                    />

                                                    <Link
                                                        to={flagUrl}
                                                        className="inline-flex size-9 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.025] text-white/45 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white hover:translate-x-0.5"
                                                        title="Open flag workspace"
                                                    >
                                                        <ArrowRight className="size-4" />
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Release configuration */}
                                            <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
                                                <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3.5">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex size-7 items-center justify-center rounded-lg bg-white/[0.06]">
                                                                <Gauge className="size-3.5 text-white/60" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                                                                    Rollout
                                                                </p>
                                                                <p className="mt-0.5 text-xs text-white/55">
                                                                    Percentage of users
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="shrink-0 font-mono text-sm font-bold text-white">
                                                            {flag.rolloutPercentage}%
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-700 ${flag.enabled ? "bg-white" : "bg-white/25"
                                                                }`}
                                                            style={{ width: `${Math.min(100, Math.max(0, flag.rolloutPercentage))}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex size-7 items-center justify-center rounded-lg bg-white/[0.06]">
                                                            <Sliders className="size-3.5 text-white/60" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                                                                Targeting
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-white/55">
                                                                User conditions before rollout
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-white">
                                                            {flag.rules.length} {flag.rules.length === 1 ? "rule" : "rules"}
                                                        </span>
                                                        <Link
                                                            to={flagUrl}
                                                            className="text-[11px] font-semibold text-white/45 transition-colors hover:text-white"
                                                        >
                                                            {flag.rules.length > 0 ? "View rules" : "Add rules"}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status rail */}
                                            <div className={`pointer-events-none absolute inset-y-4 left-0 w-0.5 rounded-full transition-all duration-300 ${flag.enabled
                                                ? "bg-emerald-400/80 opacity-100"
                                                : "bg-white/20 opacity-40 group-hover:opacity-100"
                                                }`} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    {/* Runtime Health */}
                    <Card className="dashboard-reveal group relative h-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-500 hover:border-white/[0.14] hover:bg-white/[0.035]">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(280px_circle_at_100%_0%,rgba(255,255,255,0.06),transparent_65%)] opacity-80" />

                        <CardHeader className="relative min-h-[92px] border-b border-white/[0.07] px-4 py-4 sm:px-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                                            System status
                                        </span>
                                        <span className="size-1 rounded-full bg-white/20" />
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">
                                            Live
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg font-bold tracking-tight text-white">
                                        Runtime Health
                                    </CardTitle>
                                    <p className="mt-1 text-xs leading-5 text-white/40">
                                        Current evaluation and release state.
                                    </p>
                                </div>

                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035] text-white/60 transition-transform duration-500 group-hover:scale-105">
                                    <Activity className="size-4" />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="relative flex h-auto min-h-[calc(100%-92px)] flex-col space-y-3 p-4 sm:p-5">
                            {/* Engine status */}
                            <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                                            Evaluation Engine
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
                                            <span className="text-sm font-semibold text-white">
                                                Online
                                            </span>
                                        </div>
                                    </div>

                                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                                        Healthy
                                    </span>
                                </div>

                                <p className="mt-3 text-xs leading-5 text-white/40">
                                    Ready to evaluate flags against the current environment.
                                </p>
                            </div>

                            {/* Enabled coverage */}
                            <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                                <div className="flex items-end justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                                            Enabled Coverage
                                        </p>
                                        <p className="mt-1 text-xs text-white/40">
                                            Active flags across this workspace
                                        </p>
                                    </div>
                                    <span className="font-mono text-lg font-bold text-white">
                                        {flags.length ? Math.round((enabledCount / flags.length) * 100) : 0}%
                                    </span>
                                </div>

                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                                    <div
                                        className="h-full rounded-full bg-white transition-all duration-700"
                                        style={{ width: `${flags.length ? Math.round((enabledCount / flags.length) * 100) : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Snapshot */}
                            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
                                <div className="rounded-xl border border-white/[0.08] bg-black/20 p-3.5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                                        Flags
                                    </p>
                                    <p className="mt-1 text-xl font-bold tracking-tight text-white">
                                        {flags.length}
                                    </p>
                                    <p className="mt-1 text-[10px] text-white/35">
                                        configured
                                    </p>
                                </div>

                                <div className="rounded-xl border border-white/[0.08] bg-black/20 p-3.5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                                        Rules
                                    </p>
                                    <p className="mt-1 text-xl font-bold tracking-tight text-white">
                                        {totalRules}
                                    </p>
                                    <p className="mt-1 text-[10px] text-white/35">
                                        active conditions
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-3 text-[11px] leading-5 text-white/40 sm:px-3.5 sm:text-xs">
                                <Zap className="mt-0.5 size-3.5 shrink-0 text-white/55" />
                                <span>Changes are reflected across the current workspace.</span>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Bottom command strip */}
                <section className="dashboard-reveal flex min-w-0 flex-col gap-3 rounded-2xl border border-border/60 bg-card/50 p-3 backdrop-blur-xl sm:p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background">
                            <Activity className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-foreground">Workspace is up to date</p>
                            <p className="text-[10px] leading-5 text-muted-foreground sm:text-[11px]">Live configuration loaded from your FlagForge environment.</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadDashboardData}
                        className="group gap-2 self-start rounded-lg text-xs sm:self-auto"
                    >
                        <RefreshCw className="size-3.5 transition-transform duration-500 group-hover:rotate-180" />
                        Refresh data
                    </Button>
                </section>
            </div>
        </div>
    );
}