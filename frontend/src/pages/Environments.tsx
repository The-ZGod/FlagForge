import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    Check,
    Copy,
    Edit2,
    KeyRound,
    Layers,
    Plus,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { generateEnvironmentApiKey } from "@/lib/api-keys";
import {
    createEnvironment,
    deleteEnvironment,
    getEnvironments,
    updateEnvironment,
    type Environment,
} from "@/lib/environments";
import { getProjects, type Project } from "@/lib/projects";

export function Environments() {
    const { projectId } = useParams<{ projectId: string }>();

    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Create environment modal
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [envName, setEnvName] = useState("");
    const [envKey, setEnvKey] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    // Edit environment modal
    const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
    const [editName, setEditName] = useState("");
    const [editKey, setEditKey] = useState("");
    const [updating, setUpdating] = useState(false);
    const [editError, setEditError] = useState("");

    // Delete environment modal
    const [deletingEnv, setDeletingEnv] = useState<Environment | null>(null);
    const [deleting, setDeleting] = useState(false);

    // API Key generation
    const [generatingKeyId, setGeneratingKeyId] = useState<string | null>(null);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [generatedKeyEnvId, setGeneratedKeyEnvId] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState(false);

    useEffect(() => {
        if (!projectId) {
            setError("Project ID is missing");
            setLoading(false);
            return;
        }

        async function loadProjectData() {
            try {
                setLoading(true);
                setError("");

                const [envs, projects] = await Promise.all([
                    getEnvironments(projectId!),
                    getProjects(),
                ]);

                setEnvironments(envs);
                const current = projects.find((p) => p.id === projectId);
                if (current) setProject(current);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load environments"
                );
            } finally {
                setLoading(false);
            }
        }

        loadProjectData();
    }, [projectId]);

    async function handleCreateEnvironment(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!projectId || !envName.trim() || !envKey.trim()) return;

        try {
            setCreating(true);
            setCreateError("");

            const env = await createEnvironment(
                projectId,
                envName.trim(),
                envKey.trim().toLowerCase().replace(/\s+/g, "-")
            );

            setEnvironments((current) => [...current, env]);
            setEnvName("");
            setEnvKey("");
            setCreateModalOpen(false);
        } catch (err) {
            setCreateError(
                err instanceof Error ? err.message : "Failed to create environment"
            );
        } finally {
            setCreating(false);
        }
    }

    function handleOpenEdit(env: Environment) {
        setEditingEnv(env);
        setEditName(env.name);
        setEditKey(env.key);
        setEditError("");
    }

    async function handleUpdateEnvironment(e: React.FormEvent) {
        e.preventDefault();
        if (!editingEnv || !editName.trim() || !editKey.trim()) return;

        try {
            setUpdating(true);
            setEditError("");

            const updated = await updateEnvironment(
                editingEnv.id,
                editName.trim(),
                editKey.trim().toLowerCase().replace(/\s+/g, "-")
            );

            setEnvironments((current) =>
                current.map((e) => (e.id === updated.id ? updated : e))
            );
            setEditingEnv(null);
        } catch (err) {
            setEditError(
                err instanceof Error ? err.message : "Failed to update environment"
            );
        } finally {
            setUpdating(false);
        }
    }

    async function handleDeleteEnvironment() {
        if (!deletingEnv) return;

        try {
            setDeleting(true);
            await deleteEnvironment(deletingEnv.id);
            setEnvironments((current) =>
                current.filter((e) => e.id !== deletingEnv.id)
            );
            setDeletingEnv(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete environment"
            );
            setDeletingEnv(null);
        } finally {
            setDeleting(false);
        }
    }

    async function handleGenerateApiKey(envId: string) {
        try {
            setError("");
            setGeneratingKeyId(envId);
            setCopiedKey(false);

            const res = await generateEnvironmentApiKey(envId);
            setGeneratedKey(res.apiKey);
            setGeneratedKeyEnvId(envId);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to generate SDK API key"
            );
        } finally {
            setGeneratingKeyId(null);
        }
    }

    function handleCopyGeneratedKey() {
        if (!generatedKey) return;
        navigator.clipboard.writeText(generatedKey);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in duration-150">
            {/* Header */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {project?.name || "Project Environments"}
                            </h1>
                            <Badge variant="outline" className="text-xs">
                                Environments
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Deploy and evaluate flags across isolated environments for this project.
                        </p>
                    </div>

                    <Button
                        size="sm"
                        onClick={() => setCreateModalOpen(true)}
                        className="gap-1.5 text-xs sm:text-sm font-semibold self-start sm:self-auto shadow-xs"
                    >
                        <Plus className="size-4" />
                        <span>New Environment</span>
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

            {/* Environments Grid */}
            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-44 w-full" />
                    <Skeleton className="h-44 w-full" />
                </div>
            ) : environments.length === 0 ? (
                <Card className="border-dashed border-border/80 bg-muted/20">
                    <CardContent className="py-14 text-center space-y-3">
                        <Layers className="size-12 text-muted-foreground mx-auto opacity-40" />
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">No Environments Configured</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                                Create environments (like Development, Staging, or Production) to begin configuring feature flags.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setCreateModalOpen(true)}
                            className="gap-2 text-xs sm:text-sm font-semibold mt-2"
                        >
                            <Plus className="size-4" />
                            <span>Create First Environment</span>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {environments.map((env) => (
                        <Card
                            key={env.id}
                            className="border-border/80 hover:border-border transition-all flex flex-col justify-between shadow-2xs"
                        >
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1 min-w-0">
                                        <Link
                                            to={`/projects/${projectId}/environments/${env.id}`}
                                            className="font-bold text-foreground hover:text-primary transition-colors text-base sm:text-lg truncate block"
                                        >
                                            {env.name}
                                        </Link>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <span>Key:</span>
                                            <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs text-foreground font-semibold">
                                                {env.key}
                                            </code>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => handleOpenEdit(env)}
                                            title="Edit environment"
                                        >
                                            <Edit2 className="size-4 text-muted-foreground" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => setDeletingEnv(env)}
                                            className="hover:text-destructive"
                                            title="Delete environment"
                                        >
                                            <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    </div>
                                </div>

                                {/* SDK API Key Section */}
                                <div className="rounded-xl bg-muted/40 p-3.5 border border-border/60 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                            <KeyRound className="size-3.5 text-primary" />
                                            <span>Runtime SDK Key</span>
                                        </div>

                                        <Button
                                            size="xs"
                                            variant="outline"
                                            onClick={() => handleGenerateApiKey(env.id)}
                                            disabled={generatingKeyId === env.id}
                                            className="h-7 text-xs gap-1"
                                        >
                                            <KeyRound className="size-3" />
                                            <span>{generatingKeyId === env.id ? "Generating..." : "Generate Key"}</span>
                                        </Button>
                                    </div>

                                    <p className="text-[11px] text-muted-foreground">
                                        Scoped runtime credential for TypeScript/Node SDKs.
                                    </p>

                                    {generatedKeyEnvId === env.id && generatedKey && (
                                        <div className="mt-2 rounded-lg bg-background p-2.5 border border-border space-y-1.5 animate-in fade-in-50 duration-150">
                                            <div className="flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                                                <span>Save raw key now (shown once)</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    readOnly
                                                    value={generatedKey}
                                                    className="w-full bg-muted/60 px-2 py-1 rounded font-mono text-xs text-foreground border border-input focus:outline-hidden"
                                                />
                                                <Button
                                                    size="icon-xs"
                                                    variant="outline"
                                                    onClick={handleCopyGeneratedKey}
                                                    title="Copy key"
                                                >
                                                    {copiedKey ? (
                                                        <Check className="size-3 text-green-600" />
                                                    ) : (
                                                        <Copy className="size-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Navigate to flags button */}
                                <Link
                                    to={`/projects/${projectId}/environments/${env.id}`}
                                    className="block"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs sm:text-sm font-semibold"
                                    >
                                        Open Feature Flags →
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Environment Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogClose onClose={() => setCreateModalOpen(false)} />
                <DialogHeader>
                    <DialogTitle>Create Environment</DialogTitle>
                    <DialogDescription>
                        Create an isolated deployment environment in {project?.name}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateEnvironment} className="space-y-4">
                    {createError && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                            {createError}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="env-name-input" className="text-sm font-medium">Environment Name</Label>
                        <Input
                            id="env-name-input"
                            placeholder="e.g. Staging, Production, Beta"
                            value={envName}
                            onChange={(e) => {
                                setEnvName(e.target.value);
                                if (
                                    !envKey ||
                                    envKey ===
                                        envName
                                            .toLowerCase()
                                            .replace(/[^a-z0-9]+/g, "-")
                                ) {
                                    setEnvKey(
                                        e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9-]+/g, "-")
                                    );
                                }
                            }}
                            required
                            autoFocus
                            className="text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="env-key-input" className="text-sm font-medium">Environment Key</Label>
                        <Input
                            id="env-key-input"
                            placeholder="e.g. staging, production, beta"
                            value={envKey}
                            onChange={(e) =>
                                setEnvKey(
                                    e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9-]+/g, "-")
                                )
                            }
                            className="font-mono text-sm"
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateModalOpen(false)}
                            className="text-xs sm:text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={creating || !envName.trim() || !envKey.trim()}
                            className="text-xs sm:text-sm font-semibold"
                        >
                            {creating ? "Creating..." : "Create Environment"}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>

            {/* Edit Environment Modal */}
            <Dialog open={Boolean(editingEnv)} onOpenChange={(open) => !open && setEditingEnv(null)}>
                <DialogClose onClose={() => setEditingEnv(null)} />
                <DialogHeader>
                    <DialogTitle>Edit Environment</DialogTitle>
                    <DialogDescription>
                        Update environment name or key identifier.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUpdateEnvironment} className="space-y-4">
                    {editError && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                            {editError}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="edit-env-name" className="text-sm font-medium">Environment Name</Label>
                        <Input
                            id="edit-env-name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                            className="text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="edit-env-key" className="text-sm font-medium">Environment Key</Label>
                        <Input
                            id="edit-env-key"
                            value={editKey}
                            onChange={(e) => setEditKey(e.target.value)}
                            className="font-mono text-sm"
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingEnv(null)}
                            className="text-xs sm:text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updating || !editName.trim() || !editKey.trim()}
                            className="text-xs sm:text-sm font-semibold"
                        >
                            {updating ? "Saving..." : "Update Environment"}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>

            {/* Delete Environment Confirmation Modal */}
            <Dialog open={Boolean(deletingEnv)} onOpenChange={(open) => !open && setDeletingEnv(null)}>
                <DialogClose onClose={() => setDeletingEnv(null)} />
                <DialogHeader>
                    <DialogTitle>Delete Environment</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong className="text-foreground">{deletingEnv?.name}</strong>?
                        All feature flags and targeting rules within this environment will be deleted.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDeletingEnv(null)}
                        className="text-xs sm:text-sm"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDeleteEnvironment}
                        disabled={deleting}
                        className="text-xs sm:text-sm font-semibold"
                    >
                        {deleting ? "Deleting..." : "Delete Environment"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}