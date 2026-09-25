import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";
import {
    ArrowRight,
    Calendar,
    FolderKanban,
    Layers,
    Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    createProject,
    getProjects,
    type Project,
} from "@/lib/projects";
import { getEnvironments, type Environment } from "@/lib/environments";

interface ProjectWithEnvs extends Project {
    environments: Environment[];
}

export function Projects() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState<ProjectWithEnvs[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    async function loadProjects() {
        try {
            setLoading(true);
            setError("");
            const data = await getProjects();

            const projectsWithEnvs = await Promise.all(
                data.map(async (project) => {
                    try {
                        const envs = await getEnvironments(project.id);
                        return { ...project, environments: envs };
                    } catch {
                        return { ...project, environments: [] };
                    }
                })
            );

            setProjects(projectsWithEnvs);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load projects"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProjects();
    }, []);

    async function handleCreateProject(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!projectName.trim()) return;

        try {
            setCreating(true);
            setCreateError("");

            const project = await createProject(projectName.trim());
            const projectWithEnvs: ProjectWithEnvs = {
                ...project,
                environments: [],
            };

            setProjects((current) => [projectWithEnvs, ...current]);
            setProjectName("");
            setCreateModalOpen(false);
            navigate(`/projects/${project.id}`);
        } catch (err) {
            setCreateError(
                err instanceof Error ? err.message : "Failed to create project"
            );
        } finally {
            setCreating(false);
        }
    }

    useLocomotiveScroll();

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        Projects
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Manage your projects and their associated environments and feature flags.
                    </p>
                </div>

                <Button
                    size="sm"
                    onClick={() => setCreateModalOpen(true)}
                    className="gap-1.5 text-xs font-semibold self-start sm:self-auto"
                >
                    <Plus className="size-3.5" />
                    <span>New Project</span>
                </Button>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive flex items-center justify-between">
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

            {/* Projects Grid */}
            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            ) : projects.length === 0 ? (
                <Card className="border-dashed border-border/80 bg-muted/20">
                    <CardContent className="py-12 text-center space-y-3">
                        <FolderKanban className="size-10 text-muted-foreground mx-auto opacity-40" />
                        <div>
                            <h3 className="text-base font-semibold text-foreground">No Projects Found</h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                Create your first project to start organizing environments and feature flags.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setCreateModalOpen(true)}
                            className="gap-1.5 text-xs mt-2"
                        >
                            <Plus className="size-3.5" />
                            Create First Project
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="group block focus:outline-hidden"
                        >
                            <Card className="h-full border-border/80 hover:border-border hover:shadow-xs transition-all flex flex-col justify-between">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <FolderKanban className="size-4" />
                                            </div>
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                {project.name}
                                            </h3>
                                        </div>

                                        <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground transition-all shrink-0" />
                                    </div>

                                    {/* Environments pill summary */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Layers className="size-3" />
                                            <span>
                                                {project.environments.length}{" "}
                                                {project.environments.length === 1
                                                    ? "environment"
                                                    : "environments"}
                                            </span>
                                        </div>

                                        {project.environments.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {project.environments.map((env) => (
                                                    <span
                                                        key={env.id}
                                                        className="inline-flex items-center text-[10px] font-medium bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full"
                                                    >
                                                        {env.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
                                        <Calendar className="size-3" />
                                        <span>
                                            Created {new Date(project.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogClose onClose={() => setCreateModalOpen(false)} />
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        A project groups environments (e.g. Development, Production) and flags together.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateProject} className="space-y-4">
                    {createError && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                            {createError}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="proj-name-input">Project Name</Label>
                        <Input
                            id="proj-name-input"
                            placeholder="e.g. Core Checkout, Mobile App"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={creating || !projectName.trim()}
                        >
                            {creating ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>
        </div>
    );
}