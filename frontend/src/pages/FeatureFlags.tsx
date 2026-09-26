import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";
import {
    ArrowRight,
    FolderKanban,
    Plus,
    Radio,
    Search,
    Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FeatureFlagCard } from "@/components/feature-flags/FeatureFlagCard";

import {
    createFeatureFlag,
    deleteFeatureFlag,
    getFeatureFlags,
    updateFeatureFlag,
    type FeatureFlag,
} from "@/lib/feature-flags";
import { getFlagRules, type FlagRule } from "@/lib/flag-rules";
import { getEnvironments, type Environment } from "@/lib/environments";
import { getProjects, openCreateProjectModal, type Project } from "@/lib/projects";

export function FeatureFlags() {
    const navigate = useNavigate();
    const { projectId, environmentId } = useParams();

    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [rules, setRules] = useState<Record<string, FlagRule[]>>({});
    const [environment, setEnvironment] = useState<Environment | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [hasNoProjects, setHasNoProjects] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ENABLED" | "DISABLED">("ALL");

    // Create flag modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [flagName, setFlagName] = useState("");
    const [flagKey, setFlagKey] = useState("");
    const [flagRollout, setFlagRollout] = useState(100);
    const [flagEnabled, setFlagEnabled] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    async function loadRulesForFlag(flagId: string) {
        try {
            const data = await getFlagRules(flagId);
            setRules((current) => ({
                ...current,
                [flagId]: data,
            }));
        } catch {
            setRules((current) => ({
                ...current,
                [flagId]: [],
            }));
        }
    }

    async function loadEnvironmentFlags() {
        try {
            setLoading(true);
            setError("");

            // Verify that the project belongs to the logged-in user.
            const projectList = await getProjects();

            if (projectList.length === 0) {
                setHasNoProjects(true);
                setProject(null);
                setEnvironment(null);
                setFlags([]);
                setShowCreateModal(false);
                setLoading(false);
                return;
            }

            setHasNoProjects(false);

            if (!projectId || !environmentId) {
                const targetProj = projectList[0];
                const envList = await getEnvironments(targetProj.id);
                if (envList.length > 0) {
                    navigate(`/projects/${targetProj.id}/environments/${envList[0].id}`, { replace: true });
                    return;
                } else {
                    navigate(`/projects/${targetProj.id}`, { replace: true });
                    return;
                }
            }

            const currentProject = projectList.find(
                (item) => item.id === projectId
            );

            if (!currentProject) {
                setProject(null);
                setEnvironment(null);
                setFlags([]);
                setShowCreateModal(false);
                navigate("/projects", { replace: true });
                return;
            }

            setProject(currentProject);

            // Load only environments belonging to this project.
            const envList = await getEnvironments(projectId!);
            const currentEnvironment = envList.find(
                (item) => item.id === environmentId
            );

            if (!currentEnvironment) {
                setEnvironment(null);
                setFlags([]);
                setShowCreateModal(false);
                navigate(`/projects/${projectId}`, { replace: true });
                return;
            }

            setEnvironment(currentEnvironment);

            // Only load flags after project + environment validation.
            const data = await getFeatureFlags(environmentId!);
            setFlags(data);

            await Promise.all(
                data.map((flag) => loadRulesForFlag(flag.id))
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load feature flags"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadEnvironmentFlags();

        const handleProjectCreated = () => {
            void loadEnvironmentFlags();
        };

        window.addEventListener("flagforge:project-created", handleProjectCreated);
        return () => {
            window.removeEventListener("flagforge:project-created", handleProjectCreated);
        };
    }, [environmentId, projectId, navigate]);

    async function handleCreateFlag(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (
            !environmentId ||
            !environment ||
            !flagName.trim() ||
            !flagKey.trim()
        ) {
            return;
        }

        try {
            setCreating(true);
            setCreateError("");

            const flag = await createFeatureFlag(
                environmentId,
                flagName.trim(),
                flagKey.trim().toLowerCase().replace(/\s+/g, "_"),
                flagEnabled,
                flagRollout
            );

            setFlags((current) => [flag, ...current]);
            setRules((current) => ({
                ...current,
                [flag.id]: [],
            }));

            setFlagName("");
            setFlagKey("");
            setFlagRollout(100);
            setFlagEnabled(false);
            setShowCreateModal(false);
        } catch (err) {
            setCreateError(
                err instanceof Error ? err.message : "Failed to create feature flag"
            );
        } finally {
            setCreating(false);
        }
    }

    async function handleToggleFlag(flag: FeatureFlag) {
        try {
            setError("");
            const updatedFlag = await updateFeatureFlag(flag.id, !flag.enabled);
            setFlags((current) =>
                current.map((item) => (item.id === updatedFlag.id ? updatedFlag : item))
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to toggle feature flag"
            );
        }
    }

    async function handleDeleteFlag(flagId: string) {
        try {
            setError("");
            await deleteFeatureFlag(flagId);
            setFlags((current) => current.filter((flag) => flag.id !== flagId));
            setRules((current) => {
                const updated = { ...current };
                delete updated[flagId];
                return updated;
            });
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete feature flag"
            );
        }
    }

    // Filtered Flags
    const filteredFlags = useMemo(() => {
        return flags.filter((flag) => {
            const matchesSearch =
                flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                flag.key.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (statusFilter === "ENABLED") return flag.enabled;
            if (statusFilter === "DISABLED") return !flag.enabled;
            return true;
        });
    }, [flags, searchQuery, statusFilter]);

    useLocomotiveScroll();

    if (hasNoProjects) {
        return (
            <div className="relative min-h-full overflow-hidden bg-background">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.055),transparent_62%)]" />
                <div className="relative mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.035] shadow-[inset_0_1px_rgba(255,255,255,0.08)]">
                        <FolderKanban className="size-6 text-white/70" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Create your first project
                    </h2>
                    <p className="mt-2.5 max-w-sm text-sm leading-6 text-white/50">
                        Projects contain your environments, feature flags, and evaluations.
                    </p>
                    <Button
                        onClick={openCreateProjectModal}
                        className="group mt-6 h-11 gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black shadow-[0_10px_35px_rgba(255,255,255,0.12)] transition-all hover:-translate-y-0.5 hover:bg-white/90"
                    >
                        <Plus className="size-4" />
                        Create Project
                        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-full overflow-hidden bg-background">
            {/* Ambient page treatment */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.055),transparent_62%)]" />
            <div className="pointer-events-none absolute right-[-12rem] top-24 h-72 w-72 rounded-full bg-white/[0.025] blur-3xl" />

            <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
                {/* Premium header */}
                <div className="mb-7 rounded-2xl border border-white/[0.08] bg-white/[0.018] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    <span className="size-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                                    Feature Management
                                </span>
                                {environment && (
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-white/[0.1] bg-black/20 px-2.5 py-1 text-[10px] font-mono font-medium text-foreground"
                                    >
                                        {project ? `${project.name} / ${environment.name}` : environment.name}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">
                                    Feature Flags
                                </h1>
                                <span className="hidden h-7 w-px bg-white/[0.09] sm:block" />
                                <span className="font-mono text-xs text-muted-foreground">
                                    {environment?.name || "environment"}
                                </span>
                            </div>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Control releases, percentage rollouts, and targeting rules without coupling deployment to release.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            {projectId && environmentId && (
                                <Link to={`/projects/${projectId}/environments/${environmentId}/evaluate`}>
                                    <Button
                                        variant="outline"
                                        className="h-10 gap-2 rounded-xl border-white/[0.1] bg-white/[0.025] px-4 text-sm font-medium shadow-none transition-all hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-white/[0.06]"
                                    >
                                        <Sparkles className="size-4" />
                                        Evaluate
                                    </Button>
                                </Link>
                            )}

                            <Button
                                onClick={() => setShowCreateModal(true)}
                                disabled={!environment}
                                className="h-10 gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black shadow-[0_8px_30px_rgba(255,255,255,0.12)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_36px_rgba(255,255,255,0.18)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                            >
                                <Plus className="size-4" />
                                Create Flag
                            </Button>
                        </div>
                    </div>

                    {/* Overview metrics */}
                    <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-xl border border-white/[0.07] bg-black/20">
                        {[
                            { label: "Total flags", value: flags.length },
                            { label: "Enabled", value: flags.filter((f) => f.enabled).length },
                            { label: "Disabled", value: flags.filter((f) => !f.enabled).length },
                        ].map((metric, index) => (
                            <div
                                key={metric.label}
                                className={`relative px-4 py-3.5 sm:px-5 ${index !== 0 ? "border-l border-white/[0.07]" : ""}`}
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    {metric.label}
                                </p>
                                <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-foreground">
                                    {metric.value.toString().padStart(2, "0")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-5 flex items-center justify-between rounded-xl border border-destructive/25 bg-destructive/[0.08] px-4 py-3 text-sm text-destructive shadow-sm">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="cursor-pointer text-xs underline underline-offset-4"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Search + filters */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="group relative w-full sm:max-w-xl">
                        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                        <Input
                            placeholder="Search by flag name or key..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-11 rounded-xl border-white/[0.08] bg-white/[0.025] pl-10 text-sm shadow-none transition-all placeholder:text-muted-foreground/70 focus-visible:border-white/[0.2] focus-visible:bg-white/[0.04] focus-visible:ring-1 focus-visible:ring-white/[0.08]"
                        />
                    </div>

                    <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
                        {[
                            { key: "ALL" as const, label: "All", count: flags.length },
                            { key: "ENABLED" as const, label: "Enabled", count: flags.filter((f) => f.enabled).length },
                            { key: "DISABLED" as const, label: "Disabled", count: flags.filter((f) => !f.enabled).length },
                        ].map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                onClick={() => setStatusFilter(filter.key)}
                                className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-medium transition-all ${statusFilter === filter.key
                                    ? "bg-white text-black shadow-[0_3px_14px_rgba(0,0,0,0.3)]"
                                    : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                                    }`}
                            >
                                {filter.label}
                                <span className={`ml-1.5 font-mono ${statusFilter === filter.key ? "text-black/55" : "text-muted-foreground/60"}`}>
                                    {filter.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feature Flag Inventory */}
                <div className="mb-3 flex items-center justify-between px-1">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Flag inventory
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/70">
                            {filteredFlags.length} {filteredFlags.length === 1 ? "flag" : "flags"} visible
                        </p>
                    </div>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Clear search
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        <div className="h-24 w-full animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
                        <div className="h-24 w-full animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
                        <div className="h-24 w-full animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
                    </div>
                ) : flags.length === 0 ? (
                    <Card className="overflow-hidden rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.018] shadow-none">
                        <CardContent className="relative py-16 text-center">
                            <div className="pointer-events-none absolute inset-x-1/3 top-0 h-32 bg-white/[0.035] blur-3xl" />
                            <div className="relative mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] shadow-inner">
                                <Radio className="size-6 text-muted-foreground" />
                            </div>
                            <h3 className="relative mt-5 text-lg font-semibold text-foreground">No feature flags yet</h3>
                            <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                Create your first flag to control a release, test an experiment, or safely roll out a feature.
                            </p>
                            <Button
                                size="sm"
                                onClick={() => setShowCreateModal(true)}
                                disabled={!environment}
                                className="relative mt-5 h-9 gap-2 rounded-lg bg-white px-4 text-xs font-semibold text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Plus className="size-4" />
                                Create First Flag
                            </Button>
                        </CardContent>
                    </Card>
                ) : filteredFlags.length === 0 ? (
                    <Card className="rounded-2xl border border-white/[0.08] bg-white/[0.018] shadow-none">
                        <CardContent className="py-12 text-center">
                            <p className="text-sm font-medium text-foreground">No matching flags</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Try another search term or switch the status filter.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredFlags.map((flag) => (
                            <div
                                key={flag.id}
                                className="group relative rounded-2xl transition-transform duration-300 hover:-translate-y-0.5"
                            >
                                <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-white/[0.12] via-transparent to-white/[0.06] opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.018] shadow-[0_10px_40px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:border-white/[0.13] group-hover:bg-white/[0.026] group-hover:shadow-[0_16px_50px_rgba(0,0,0,0.2)]">
                                    <FeatureFlagCard
                                        flag={flag}
                                        rules={rules[flag.id] ?? []}
                                        projectId={projectId!}
                                        environmentId={environmentId!}
                                        onToggle={handleToggleFlag}
                                        onDelete={handleDeleteFlag}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Feature Flag Modal */}
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogClose onClose={() => setShowCreateModal(false)} />

                    <DialogHeader className="mb-6">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                <span className="size-1.5 rounded-full bg-white shadow-[0_0_9px_rgba(255,255,255,0.8)]" />
                                Runtime control
                            </span>
                        </div>
                        <DialogTitle className="text-2xl font-semibold tracking-[-0.03em]">
                            Create Feature Flag
                        </DialogTitle>
                        <DialogDescription className="mt-2 max-w-lg text-sm leading-6">
                            Define a release control for{" "}
                            <span className="font-medium text-foreground">{environment?.name || "this environment"}</span>.
                            You can change rollout and targeting rules after creation.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateFlag} className="space-y-5">
                        {createError && (
                            <div className="rounded-xl border border-destructive/25 bg-destructive/[0.08] p-3 text-xs text-destructive">
                                {createError}
                            </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="create-flag-name" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                                    Flag name
                                </Label>
                                <Input
                                    id="create-flag-name"
                                    placeholder="New Checkout Experience"
                                    value={flagName}
                                    onChange={(e) => {
                                        setFlagName(e.target.value);
                                        if (
                                            !flagKey ||
                                            flagKey ===
                                            flagName
                                                .toLowerCase()
                                                .replace(/[^a-z0-9]+/g, "_")
                                        ) {
                                            setFlagKey(
                                                e.target.value
                                                    .toLowerCase()
                                                    .replace(/[^a-z0-9]+/g, "_")
                                            );
                                        }
                                    }}
                                    required
                                    autoFocus
                                    className="h-11 rounded-xl border-white/[0.08] bg-white/[0.025] text-sm shadow-none focus-visible:border-white/[0.18] focus-visible:ring-1 focus-visible:ring-white/[0.08]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="create-flag-key" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                                    Flag key
                                </Label>
                                <Input
                                    id="create-flag-key"
                                    placeholder="new_checkout_experience"
                                    value={flagKey}
                                    onChange={(e) =>
                                        setFlagKey(
                                            e.target.value
                                                .toLowerCase()
                                                .replace(/[^a-z0-9_]+/g, "_")
                                        )
                                    }
                                    className="h-11 rounded-xl border-white/[0.08] bg-white/[0.025] font-mono text-xs sm:text-sm shadow-none focus-visible:border-white/[0.18] focus-visible:ring-1 focus-visible:ring-white/[0.08]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="create-flag-rollout" className="text-sm font-medium">
                                        Initial rollout
                                    </Label>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Percentage of eligible traffic that receives the flag.
                                    </p>
                                </div>
                                <span className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-sm font-semibold text-foreground">
                                    {flagRollout}%
                                </span>
                            </div>

                            <input
                                id="create-flag-rollout"
                                type="range"
                                min={0}
                                max={100}
                                value={flagRollout}
                                onChange={(e) => setFlagRollout(Number(e.target.value))}
                                className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.1] accent-white"
                            />

                            <div className="mt-2 flex justify-between text-[10px] font-mono text-muted-foreground/60">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setFlagEnabled((current) => !current)}
                            className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4 text-left transition-colors hover:border-white/[0.13] hover:bg-white/[0.03]"
                        >
                            <div>
                                <p className="text-sm font-medium text-foreground">Enable immediately</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {flagEnabled ? "The flag will be active as soon as it is created." : "Create it safely disabled and activate it later."}
                                </p>
                            </div>
                            <span
                                className={`relative h-6 w-11 rounded-full border transition-colors ${flagEnabled
                                    ? "border-white bg-white"
                                    : "border-white/[0.12] bg-white/[0.06]"
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 size-4 rounded-full transition-all ${flagEnabled
                                        ? "left-6 bg-black"
                                        : "left-1 bg-white/60"
                                        }`}
                                />
                            </span>
                        </button>

                        <DialogFooter className="border-t border-white/[0.07] pt-5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreateModal(false)}
                                className="h-10 rounded-xl border-white/[0.08] bg-white/[0.025] text-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    creating ||
                                    !environment ||
                                    !flagName.trim() ||
                                    !flagKey.trim()
                                }
                                className="h-10 rounded-xl bg-white px-5 text-sm font-semibold text-black shadow-[0_8px_28px_rgba(255,255,255,0.1)] hover:bg-white"
                            >
                                {creating ? "Creating..." : "Create Feature Flag"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Dialog>
            </div>
        </div>
    );
}
