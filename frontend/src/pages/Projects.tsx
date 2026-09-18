import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    createProject,
    getProjects,
    type Project,
} from "@/lib/projects";

export function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [creating, setCreating] = useState(false);

    async function loadProjects() {
        try {
            setError("");
            const data = await getProjects();
            setProjects(data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load projects"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProjects();
    }, []);

    async function handleCreateProject(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!projectName.trim()) {
            return;
        }

        try {
            setCreating(true);
            setError("");

            const project = await createProject(projectName.trim());

            setProjects((currentProjects) => [
                project,
                ...currentProjects,
            ]);

            setProjectName("");
            setShowForm(false);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create project"
            );
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">Projects</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your FlagForge projects.
                    </p>
                </div>

                <Button onClick={() => setShowForm((visible) => !visible)}>
                    <Plus className="size-4" />
                    New Project
                </Button>
            </div>

            {showForm && (
                <Card className="mt-6">
                    <CardContent className="p-6">
                        <form
                            onSubmit={handleCreateProject}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="project-name">
                                    Project name
                                </Label>

                                <Input
                                    id="project-name"
                                    placeholder="e.g. Checkout Platform"
                                    value={projectName}
                                    onChange={(event) =>
                                        setProjectName(event.target.value)
                                    }
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={creating || !projectName.trim()}
                                >
                                    {creating ? "Creating..." : "Create Project"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setProjectName("");
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Alert variant="destructive" className="mt-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="mt-6">
                {loading && (
                    <p className="text-sm text-muted-foreground">
                        Loading projects...
                    </p>
                )}

                {!loading && !error && projects.length === 0 && (
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-muted-foreground">
                                No projects found.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {!loading && !error && projects.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Card key={project.id}>
                                <CardContent className="p-6">
                                    <h3 className="font-medium">
                                        {project.name}
                                    </h3>

                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Created{" "}
                                        {new Date(
                                            project.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}