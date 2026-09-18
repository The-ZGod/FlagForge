import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    createFeatureFlag,
    deleteFeatureFlag,
    getFeatureFlags,
    updateFeatureFlag,
    type FeatureFlag,
} from "@/lib/feature-flags";

import {
    createFlagRule,
    deleteFlagRule,
    getFlagRules,
    type FlagRule,
    type RuleOperator,
} from "@/lib/flag-rules";

export function FeatureFlags() {
    const { projectId, environmentId } = useParams();

    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [rules, setRules] = useState<Record<string, FlagRule[]>>({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [flagName, setFlagName] = useState("");
    const [flagKey, setFlagKey] = useState("");
    const [creating, setCreating] = useState(false);

    // Rule form state
    const [ruleFlagId, setRuleFlagId] = useState<string | null>(null);
    const [ruleAttribute, setRuleAttribute] = useState("");
    const [ruleOperator, setRuleOperator] =
        useState<RuleOperator>("EQUALS");
    const [ruleValue, setRuleValue] = useState("");
    const [creatingRule, setCreatingRule] = useState(false);

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

        async function loadFlags() {
            try {
                setLoading(true);
                setError("");

                const data = await getFeatureFlags(environmentId!);

                setFlags(data);

                await Promise.all(
                    data.map((flag) => loadRulesForFlag(flag.id))
                );
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

        loadFlags();
    }, [environmentId]);

    async function handleCreateFlag(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!environmentId) return;

        try {
            setCreating(true);
            setError("");

            const flag = await createFeatureFlag(
                environmentId,
                flagName,
                flagKey
            );

            setFlags((current) => [...current, flag]);

            setRules((current) => ({
                ...current,
                [flag.id]: [],
            }));

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

    async function handleToggleFlag(flag: FeatureFlag) {
        try {
            setError("");

            const updatedFlag = await updateFeatureFlag(
                flag.id,
                !flag.enabled
            );

            setFlags((current) =>
                current.map((item) =>
                    item.id === updatedFlag.id ? updatedFlag : item
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

    async function handleRolloutChange(
        flag: FeatureFlag,
        value: string
    ) {
        const rolloutPercentage = Number(value);

        if (
            Number.isNaN(rolloutPercentage) ||
            rolloutPercentage < 0 ||
            rolloutPercentage > 100
        ) {
            return;
        }

        try {
            setError("");

            const updatedFlag = await updateFeatureFlag(
                flag.id,
                undefined,
                rolloutPercentage
            );

            setFlags((current) =>
                current.map((item) =>
                    item.id === updatedFlag.id ? updatedFlag : item
                )
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update rollout"
            );
        }
    }

    async function handleDeleteFlag(flagId: string) {
        try {
            setError("");

            await deleteFeatureFlag(flagId);

            setFlags((current) =>
                current.filter((flag) => flag.id !== flagId)
            );

            setRules((current) => {
                const updated = { ...current };
                delete updated[flagId];
                return updated;
            });
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete feature flag"
            );
        }
    }

    function openRuleForm(flagId: string) {
        setRuleFlagId(flagId);
        setRuleAttribute("");
        setRuleOperator("EQUALS");
        setRuleValue("");
        setError("");
    }

    function closeRuleForm() {
        setRuleFlagId(null);
        setRuleAttribute("");
        setRuleOperator("EQUALS");
        setRuleValue("");
    }

    async function handleCreateRule(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!ruleFlagId) return;

        try {
            setCreatingRule(true);
            setError("");

            const rule = await createFlagRule(
                ruleFlagId,
                ruleAttribute,
                ruleOperator,
                ruleValue
            );

            setRules((current) => ({
                ...current,
                [ruleFlagId]: [
                    ...(current[ruleFlagId] ?? []),
                    rule,
                ],
            }));

            closeRuleForm();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create targeting rule"
            );
        } finally {
            setCreatingRule(false);
        }
    }

    async function handleDeleteRule(
        flagId: string,
        ruleId: string
    ) {
        try {
            setError("");

            await deleteFlagRule(ruleId);

            setRules((current) => ({
                ...current,
                [flagId]: (current[flagId] ?? []).filter(
                    (rule) => rule.id !== ruleId
                ),
            }));
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete targeting rule"
            );
        }
    }

    if (loading) {
        return (
            <main className="p-6">
                <p className="text-sm text-muted-foreground">
                    Loading feature flags...
                </p>
            </main>
        );
    }

    return (
        <main className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    {projectId && (
                        <Link
                            to={`/projects/${projectId}`}
                            className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to environments
                        </Link>
                    )}

                    <h1 className="text-2xl font-semibold">
                        Feature Flags
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage feature flags and targeting rules.
                    </p>
                </div>

                <Button onClick={() => setShowForm((current) => !current)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Flag
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Create flag form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create Feature Flag</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleCreateFlag}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="flag-name">
                                    Name
                                </Label>

                                <Input
                                    id="flag-name"
                                    value={flagName}
                                    onChange={(event) =>
                                        setFlagName(event.target.value)
                                    }
                                    placeholder="New Checkout"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="flag-key">
                                    Key
                                </Label>

                                <Input
                                    id="flag-key"
                                    value={flagKey}
                                    onChange={(event) =>
                                        setFlagKey(event.target.value)
                                    }
                                    placeholder="new_checkout"
                                    required
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={creating}
                                >
                                    {creating ? "Creating..." : "Create Flag"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {flags.length === 0 ? (
                <Card>
                    <CardContent className="flex min-h-40 items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            No feature flags yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {flags.map((flag) => (
                        <Card key={flag.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <CardTitle>{flag.name}</CardTitle>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {flag.key}
                                        </p>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleFlag(flag)}
                                    >
                                        {flag.enabled ? "Enabled" : "Disabled"}
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {/* Rollout */}
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Rollout Percentage
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            Percentage of users included in rollout.
                                        </p>
                                    </div>

                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={flag.rolloutPercentage}
                                        onChange={(event) =>
                                            handleRolloutChange(
                                                flag,
                                                event.target.value
                                            )
                                        }
                                        className="w-24"
                                    />
                                </div>

                                {/* Targeting rules */}
                                <div className="border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Targeting Rules
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Control which users receive this flag.
                                            </p>
                                        </div>

                                        {ruleFlagId !== flag.id && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openRuleForm(flag.id)}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Rule
                                            </Button>
                                        )}
                                    </div>

                                    {/* Create rule form */}
                                    {ruleFlagId === flag.id && (
                                        <form
                                            onSubmit={handleCreateRule}
                                            className="mt-4 rounded-lg border bg-muted/20 p-4"
                                        >
                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`attribute-${flag.id}`}>
                                                        Attribute
                                                    </Label>

                                                    <Input
                                                        id={`attribute-${flag.id}`}
                                                        value={ruleAttribute}
                                                        onChange={(event) =>
                                                            setRuleAttribute(
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="country"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`operator-${flag.id}`}>
                                                        Operator
                                                    </Label>

                                                    <select
                                                        id={`operator-${flag.id}`}
                                                        value={ruleOperator}
                                                        onChange={(event) =>
                                                            setRuleOperator(
                                                                event.target.value as RuleOperator
                                                            )
                                                        }
                                                        className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-xs outline-none"
                                                    >
                                                        <option value="EQUALS">
                                                            EQUALS
                                                        </option>

                                                        <option value="NOT_EQUALS">
                                                            NOT_EQUALS
                                                        </option>
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`value-${flag.id}`}>
                                                        Value
                                                    </Label>

                                                    <Input
                                                        id={`value-${flag.id}`}
                                                        value={ruleValue}
                                                        onChange={(event) =>
                                                            setRuleValue(event.target.value)
                                                        }
                                                        placeholder="IN"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    disabled={creatingRule}
                                                >
                                                    {creatingRule
                                                        ? "Adding..."
                                                        : "Add Rule"}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={closeRuleForm}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Existing rules */}
                                    <div className="mt-3 space-y-2">
                                        {(rules[flag.id] ?? []).length === 0 ? (
                                            <p className="text-xs text-muted-foreground">
                                                No targeting rules.
                                            </p>
                                        ) : (
                                            (rules[flag.id] ?? []).map((rule) => (
                                                <div
                                                    key={rule.id}
                                                    className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                                                >
                                                    <p className="text-xs">
                                                        <span className="font-medium">
                                                            {rule.attribute}
                                                        </span>{" "}
                                                        <span className="text-muted-foreground">
                                                            {rule.operator}
                                                        </span>{" "}
                                                        <span className="font-medium">
                                                            {rule.value}
                                                        </span>
                                                    </p>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDeleteRule(
                                                                flag.id,
                                                                rule.id
                                                            )
                                                        }
                                                        aria-label="Delete rule"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Delete flag */}
                                <div className="flex justify-end border-t pt-4">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            handleDeleteFlag(flag.id)
                                        }
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Flag
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}