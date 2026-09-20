import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
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
import { Skeleton } from "@/components/ui/skeleton";
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
import { getProjects, type Project } from "@/lib/projects";

export function FeatureFlags() {
    const { projectId, environmentId } = useParams();

    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [rules, setRules] = useState<Record<string, FlagRule[]>>({});
    const [environment, setEnvironment] = useState<Environment | null>(null);
    const [project, setProject] = useState<Project | null>(null);

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

    useEffect(() => {
        if (!environmentId) {
            setError("Environment ID is missing");
            setLoading(false);
            return;
        }

        async function loadEnvironmentFlags() {
            try {
                setLoading(true);
                setError("");

                const data = await getFeatureFlags(environmentId!);
                setFlags(data);

                if (projectId) {
                    const projectList = await getProjects();
                    const p = projectList.find((item) => item.id === projectId);
                    if (p) setProject(p);

                    const envList = await getEnvironments(projectId);
                    const e = envList.find((item) => item.id === environmentId);
                    if (e) setEnvironment(e);
                }

                await Promise.all(data.map((flag) => loadRulesForFlag(flag.id)));
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load feature flags"
                );
            } finally {
                setLoading(false);
            }
        }

        loadEnvironmentFlags();
    }, [environmentId, projectId]);

    async function handleCreateFlag(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!environmentId || !flagName.trim() || !flagKey.trim()) return;

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

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in duration-150">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Feature Flags
                        </h1>
                        {environment && (
                            <Badge variant="outline" className="text-xs font-mono font-normal">
                                {project ? `${project.name} / ${environment.name}` : environment.name}
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage feature flags, percentage rollouts, and targeting rules for this environment.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    {projectId && environmentId && (
                        <Link
                            to={`/projects/${projectId}/environments/${environmentId}/evaluate`}
                        >
                            <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm font-medium">
                                <Sparkles className="size-4 text-primary" />
                                <span>Evaluate</span>
                            </Button>
                        </Link>
                    )}

                    <Button
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                        className="gap-1.5 text-xs sm:text-sm font-semibold shadow-xs"
                    >
                        <Plus className="size-4" />
                        <span>Create Flag</span>
                    </Button>
                </div>
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

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search flags by name or key..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9.5 text-sm h-9.5 bg-card"
                    />
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 shrink-0">
                    <button
                        type="button"
                        onClick={() => setStatusFilter("ALL")}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                            statusFilter === "ALL"
                                ? "bg-card text-foreground shadow-2xs font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        All ({flags.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter("ENABLED")}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                            statusFilter === "ENABLED"
                                ? "bg-card text-foreground shadow-2xs font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Enabled ({flags.filter((f) => f.enabled).length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter("DISABLED")}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                            statusFilter === "DISABLED"
                                ? "bg-card text-foreground shadow-2xs font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Disabled ({flags.filter((f) => !f.enabled).length})
                    </button>
                </div>
            </div>

            {/* Feature Flag Inventory */}
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
                            <h3 className="text-lg font-semibold text-foreground">No Feature Flags Yet</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                                Create your first feature flag to start dynamically controlling features and running percentage rollouts.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setShowCreateModal(true)}
                            className="gap-2 text-xs sm:text-sm font-semibold mt-2"
                        >
                            <Plus className="size-4" />
                            <span>Create First Flag</span>
                        </Button>
                    </CardContent>
                </Card>
            ) : filteredFlags.length === 0 ? (
                <Card className="bg-muted/10">
                    <CardContent className="py-10 text-center text-muted-foreground text-sm">
                        No flags match your search query or filter.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredFlags.map((flag) => (
                        <FeatureFlagCard
                            key={flag.id}
                            flag={flag}
                            rules={rules[flag.id] ?? []}
                            projectId={projectId!}
                            environmentId={environmentId!}
                            onToggle={handleToggleFlag}
                            onDelete={handleDeleteFlag}
                        />
                    ))}
                </div>
            )}

            {/* Create Feature Flag Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogClose onClose={() => setShowCreateModal(false)} />
                <DialogHeader>
                    <DialogTitle>Create Feature Flag</DialogTitle>
                    <DialogDescription>
                        Feature flags allow you to decouple deployment from release in {environment?.name || "this environment"}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateFlag} className="space-y-4">
                    {createError && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                            {createError}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="create-flag-name" className="text-sm font-medium">Flag Name</Label>
                        <Input
                            id="create-flag-name"
                            placeholder="e.g. New Checkout Experience"
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
                            className="text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="create-flag-key" className="text-sm font-medium">Flag Key (used in code)</Label>
                        <Input
                            id="create-flag-key"
                            placeholder="e.g. new_checkout_experience"
                            value={flagKey}
                            onChange={(e) =>
                                setFlagKey(
                                    e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9_]+/g, "_")
                                )
                            }
                            className="font-mono text-xs sm:text-sm"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="create-flag-rollout" className="text-sm font-medium">Initial Rollout</Label>
                            <span className="font-mono text-sm font-bold text-foreground">{flagRollout}%</span>
                        </div>
                        <input
                            id="create-flag-rollout"
                            type="range"
                            min={0}
                            max={100}
                            value={flagRollout}
                            onChange={(e) => setFlagRollout(Number(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCreateModal(false)}
                            className="text-xs sm:text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={creating || !flagName.trim() || !flagKey.trim()}
                            className="text-xs sm:text-sm font-semibold"
                        >
                            {creating ? "Creating..." : "Create Feature Flag"}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>
        </div>
    );
}