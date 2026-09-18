import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import {
    createFeatureFlag,
    getFeatureFlags,
    updateFeatureFlag,
    deleteFeatureFlag,
    type FeatureFlag,
} from "@/lib/feature-flags";

export function FeatureFlags() {
    const { projectId, environmentId } = useParams<{
        projectId: string;
        environmentId: string;
    }>();

    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [flagName, setFlagName] = useState("");
    const [flagKey, setFlagKey] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!environmentId) {
            setError("Environment ID is missing");
            setLoading(false);
            return;
        }

        async function loadFeatureFlags() {
            try {
                setError("");

                const data = await getFeatureFlags(environmentId!);
                setFlags(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load feature flags"
                );
            } finally {
                setLoading(false);
            }
        }

        loadFeatureFlags();
    }, [environmentId]);

    async function handleCreateFeatureFlag(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (
            !environmentId ||
            !flagName.trim() ||
            !flagKey.trim()
        ) {
            return;
        }

        try {
            setCreating(true);
            setError("");

            const flag = await createFeatureFlag(
                environmentId,
                flagName.trim(),
                flagKey.trim()
            );

            setFlags((current) => [
                ...current,
                flag,
            ]);

            setFlagName("");
            setFlagKey("");
            setShowForm(false);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create feature flag"
            );
        } finally {
            setCreating(false);
        }
    }

    async function handleUpdateFeatureFlag(
        flag: FeatureFlag,
        updates: {
            enabled?: boolean;
            rolloutPercentage?: number;
        }
    ) {
        try {
            setError("");

            const updated = await updateFeatureFlag(
                flag.id,
                updates.enabled ?? flag.enabled,
                updates.rolloutPercentage ?? flag.rolloutPercentage
            );

            setFlags((current) =>
                current.map((currentFlag) =>
                    currentFlag.id === flag.id
                        ? updated
                        : currentFlag
                )
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update feature flag"
            );
        }
    }

    async function handleDeleteFeatureFlag(flagId: string) {
        const confirmed = window.confirm(
            "Delete this feature flag?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await deleteFeatureFlag(flagId);

            setFlags((current) =>
                current.filter((flag) => flag.id !== flagId)
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete feature flag"
            );
        }
    }

    return (
        <div className="p-6 md:p-8">
            <Link
                to={`/projects/${projectId}`}
                className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" />
                Back to environments
            </Link>

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Feature Flags
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage feature flags for this environment.
                    </p>
                </div>

                <Button
                    onClick={() =>
                        setShowForm((visible) => !visible)
                    }
                >
                    <Plus className="size-4" />
                    New Feature Flag
                </Button>
            </div>

            {showForm && (
                <Card className="mt-6">
                    <CardContent className="p-6">
                        <form
                            onSubmit={handleCreateFeatureFlag}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="flag-name">
                                    Feature flag name
                                </Label>

                                <Input
                                    id="flag-name"
                                    placeholder="e.g. New Checkout"
                                    value={flagName}
                                    onChange={(event) =>
                                        setFlagName(event.target.value)
                                    }
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="flag-key">
                                    Feature flag key
                                </Label>

                                <Input
                                    id="flag-key"
                                    placeholder="e.g. new_checkout"
                                    value={flagKey}
                                    onChange={(event) =>
                                        setFlagKey(event.target.value)
                                    }
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={
                                        creating ||
                                        !flagName.trim() ||
                                        !flagKey.trim()
                                    }
                                >
                                    {creating
                                        ? "Creating..."
                                        : "Create Feature Flag"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFlagName("");
                                        setFlagKey("");
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
                        Loading feature flags...
                    </p>
                )}

                {error && (
                    <p className="text-sm text-destructive">
                        {error}
                    </p>
                )}

                {!loading && !error && flags.length === 0 && (
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-muted-foreground">
                                No feature flags found.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {!loading && !error && flags.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {flags.map((flag) => (
                            <Card key={flag.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-medium">
                                                {flag.name}
                                            </h3>

                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Key: {flag.key}
                                            </p>
                                        </div>

                                        <Button
                                            variant={flag.enabled ? "default" : "outline"}
                                            size="sm"
                                            onClick={() =>
                                                handleUpdateFeatureFlag(flag, {
                                                    enabled: !flag.enabled,
                                                })
                                            }
                                        >
                                            {flag.enabled ? "Enabled" : "Disabled"}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDeleteFeatureFlag(flag.id)
                                            }
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>

                                    <div className="mt-5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor={`rollout-${flag.id}`}>
                                                Rollout percentage
                                            </Label>

                                            <span className="text-sm font-medium">
                                                {flag.rolloutPercentage}%
                                            </span>
                                        </div>

                                        <Input
                                            id={`rollout-${flag.id}`}
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={flag.rolloutPercentage}
                                            onChange={(event) => {
                                                const value = Number(event.target.value);

                                                if (value >= 0 && value <= 100) {
                                                    handleUpdateFeatureFlag(flag, {
                                                        rolloutPercentage: value,
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}