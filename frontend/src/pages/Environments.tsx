import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    createEnvironment,
    getEnvironments,
    updateEnvironment,
    deleteEnvironment,
    type Environment,
} from "@/lib/environments";

export function Environments() {
    const { projectId } = useParams<{ projectId: string }>();

    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [environmentName, setEnvironmentName] = useState("");
    const [environmentKey, setEnvironmentKey] = useState("");
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editKey, setEditKey] = useState("");

    useEffect(() => {
        if (!projectId) {
            setError("Project ID is missing");
            setLoading(false);
            return;
        }

        async function loadEnvironments() {
            try {
                setError("");

                const data = await getEnvironments(projectId!);
                setEnvironments(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load environments"
                );
            } finally {
                setLoading(false);
            }
        }

        loadEnvironments();
    }, [projectId]);

    async function handleCreateEnvironment(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (
            !projectId ||
            !environmentName.trim() ||
            !environmentKey.trim()
        ) {
            return;
        }

        try {
            setCreating(true);
            setError("");

            const environment = await createEnvironment(
                projectId,
                environmentName.trim(),
                environmentKey.trim()
            );

            setEnvironments((current) => [
                ...current,
                environment,
            ]);

            setEnvironmentName("");
            setEnvironmentKey("");
            setShowForm(false);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create environment"
            );
        } finally {
            setCreating(false);
        }
    }

    async function handleUpdateEnvironment(
        environmentId: string
    ) {
        if (!editName.trim() || !editKey.trim()) {
            return;
        }

        try {
            setError("");

            const updated = await updateEnvironment(
                environmentId,
                editName.trim(),
                editKey.trim()
            );

            setEnvironments((current) =>
                current.map((environment) =>
                    environment.id === environmentId
                        ? updated
                        : environment
                )
            );

            setEditingId(null);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update environment"
            );
        }
    }

    async function handleDeleteEnvironment(
        environmentId: string
    ) {
        const confirmed = window.confirm(
            "Delete this environment?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await deleteEnvironment(environmentId);

            setEnvironments((current) =>
                current.filter(
                    (environment) =>
                        environment.id !== environmentId
                )
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete environment"
            );
        }
    }

    return (
        <div className="p-6 md:p-8">
            <Link
                to="/projects"
                className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" />
                Back to projects
            </Link>

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Environments
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage environments for this project.
                    </p>
                </div>

                <Button
                    onClick={() =>
                        setShowForm((visible) => !visible)
                    }
                >
                    <Plus className="size-4" />
                    New Environment
                </Button>
            </div>

            {showForm && (
                <Card className="mt-6">
                    <CardContent className="p-6">
                        <form
                            onSubmit={handleCreateEnvironment}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="environment-name">
                                    Environment name
                                </Label>

                                <Input
                                    id="environment-name"
                                    placeholder="e.g. Staging"
                                    value={environmentName}
                                    onChange={(event) =>
                                        setEnvironmentName(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="environment-key">
                                    Environment key
                                </Label>

                                <Input
                                    id="environment-key"
                                    placeholder="e.g. staging"
                                    value={environmentKey}
                                    onChange={(event) =>
                                        setEnvironmentKey(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={
                                        creating ||
                                        !environmentName.trim() ||
                                        !environmentKey.trim()
                                    }
                                >
                                    {creating
                                        ? "Creating..."
                                        : "Create Environment"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEnvironmentName("");
                                        setEnvironmentKey("");
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="mt-6">
                {loading && (
                    <p className="text-sm text-muted-foreground">
                        Loading environments...
                    </p>
                )}

                {error && (
                    <p className="text-sm text-destructive">
                        {error}
                    </p>
                )}

                {!loading &&
                    !error &&
                    environments.length === 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground">
                                    No environments found.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                {!loading &&
                    !error &&
                    environments.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {environments.map((environment) => (
                                <Card key={environment.id}>
                                    <CardContent className="p-6">
                                        {editingId === environment.id ? (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>
                                                        Environment name
                                                    </Label>

                                                    <Input
                                                        value={editName}
                                                        onChange={(event) =>
                                                            setEditName(
                                                                event.target.value
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>
                                                        Environment key
                                                    </Label>

                                                    <Input
                                                        value={editKey}
                                                        onChange={(event) =>
                                                            setEditKey(
                                                                event.target.value
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            handleUpdateEnvironment(
                                                                environment.id
                                                            )
                                                        }
                                                    >
                                                        Save
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setEditingId(null)
                                                        }
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start justify-between gap-4">
                                                <Link
                                                    to={`/projects/${projectId}/environments/${environment.id}`}
                                                    className="min-w-0 flex-1"
                                                >
                                                    <h3 className="font-medium hover:underline">
                                                        {environment.name}
                                                    </h3>

                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        Key:{" "}
                                                        {environment.key}
                                                    </p>
                                                </Link>

                                                <div className="flex shrink-0 gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setEditingId(
                                                                environment.id
                                                            );
                                                            setEditName(
                                                                environment.name
                                                            );
                                                            setEditKey(
                                                                environment.key
                                                            );
                                                        }}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDeleteEnvironment(
                                                                environment.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
            </div>
        </div>
    );
}