import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Play, Plus, Trash2 } from "lucide-react";

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
    updateFlagRule,
    type FlagRule,
    type RuleOperator,
} from "@/lib/flag-rules";

export function FeatureFlags() {
    const { projectId, environmentId } = useParams();

    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [rules, setRules] = useState<Record<string, FlagRule[]>>({});

    const [rolloutDrafts, setRolloutDrafts] = useState<
        Record<string, string>
    >({});
    const [savingRolloutId, setSavingRolloutId] = useState<string | null>(
        null
    );

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

    const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
    const [updatingRule, setUpdatingRule] = useState(false);

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

    function handleRolloutChange(
        flagId: string,
        value: string
    ) {
        setRolloutDrafts((current) => ({
            ...current,
            [flagId]: value,
        }));
    }

    async function handleSaveRollout(flag: FeatureFlag) {
        const draftValue = rolloutDrafts[flag.id];

        if (draftValue === undefined) {
            return;
        }

        const rolloutPercentage = Number(draftValue);

        if (
            Number.isNaN(rolloutPercentage) ||
            rolloutPercentage < 0 ||
            rolloutPercentage > 100
        ) {
            setError("Rollout percentage must be between 0 and 100");
            return;
        }

        if (rolloutPercentage === flag.rolloutPercentage) {
            setRolloutDrafts((current) => {
                const updated = { ...current };
                delete updated[flag.id];
                return updated;
            });
            return;
        }

        try {
            setSavingRolloutId(flag.id);
            setError("");

            const updatedFlag = await updateFeatureFlag(
                flag.id,
                undefined,
                rolloutPercentage
            );

            setFlags((current) =>
                current.map((item) =>
                    item.id === updatedFlag.id
                        ? updatedFlag
                        : item
                )
            );

            setRolloutDrafts((current) => {
                const updated = { ...current };
                delete updated[flag.id];
                return updated;
            });
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update rollout"
            );
        } finally {
            setSavingRolloutId(null);
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

    function openEditRule(rule: FlagRule) {
        setEditingRuleId(rule.id);
        setRuleFlagId(rule.featureFlagId);
        setRuleAttribute(rule.attribute);
        setRuleOperator(rule.operator);
        setRuleValue(rule.value);
        setError("");
    }

    function closeEditRule() {
        setEditingRuleId(null);
        setRuleFlagId(null);
        setRuleAttribute("");
        setRuleOperator("EQUALS");
        setRuleValue("");
    }

    async function handleUpdateRule(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!editingRuleId || !ruleFlagId) return;

        try {
            setUpdatingRule(true);
            setError("");

            const updatedRule = await updateFlagRule(
                editingRuleId,
                ruleAttribute,
                ruleOperator,
                ruleValue
            );

            setRules((current) => ({
                ...current,
                [ruleFlagId]: (current[ruleFlagId] ?? []).map((rule) =>
                    rule.id === updatedRule.id ? updatedRule : rule
                ),
            }));

            closeEditRule();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update targeting rule"
            );
        } finally {
            setUpdatingRule(false);
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

                <div className="flex items-center gap-2">
                    {projectId && environmentId && (
                        <Link
                            to={`/projects/${projectId}/environments/${environmentId}/evaluate`}
                        >
                            <Button variant="outline">
                                <Play className="mr-2 h-4 w-4" />
                                Evaluate
                            </Button>
                        </Link>
                    )}

                    <Button
                        onClick={() =>
                            setShowForm((current) => !current)
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Flag
                    </Button>
                </div>
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

                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={
                                                rolloutDrafts[flag.id] ??
                                                flag.rolloutPercentage
                                            }
                                            onChange={(event) =>
                                                handleRolloutChange(
                                                    flag.id,
                                                    event.target.value
                                                )
                                            }
                                            className="w-24"
                                        />

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={
                                                savingRolloutId === flag.id ||
                                                rolloutDrafts[flag.id] === undefined ||
                                                rolloutDrafts[flag.id] ===
                                                String(flag.rolloutPercentage)
                                            }
                                            onClick={() =>
                                                handleSaveRollout(flag)
                                            }
                                        >
                                            {savingRolloutId === flag.id
                                                ? "Saving..."
                                                : "Save"}
                                        </Button>
                                    </div>
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

                                        {ruleFlagId !== flag.id && editingRuleId === null && (
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
                                    {ruleFlagId === flag.id && editingRuleId === null && (
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

                                    {editingRuleId && ruleFlagId === flag.id && (
                                        <form
                                            onSubmit={handleUpdateRule}
                                            className="mt-4 rounded-lg border bg-muted/20 p-4"
                                        >
                                            <div className="mb-4">
                                                <p className="text-sm font-medium">
                                                    Edit Targeting Rule
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    Update the attribute, operator, or value.
                                                </p>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`edit-attribute-${flag.id}`}>
                                                        Attribute
                                                    </Label>

                                                    <Input
                                                        id={`edit-attribute-${flag.id}`}
                                                        value={ruleAttribute}
                                                        onChange={(event) =>
                                                            setRuleAttribute(event.target.value)
                                                        }
                                                        placeholder="country"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`edit-operator-${flag.id}`}>
                                                        Operator
                                                    </Label>

                                                    <select
                                                        id={`edit-operator-${flag.id}`}
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
                                                    <Label htmlFor={`edit-value-${flag.id}`}>
                                                        Value
                                                    </Label>

                                                    <Input
                                                        id={`edit-value-${flag.id}`}
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
                                                    disabled={updatingRule}
                                                >
                                                    {updatingRule ? "Saving..." : "Save Changes"}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={closeEditRule}
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

                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditRule(rule)}
                                                            aria-label="Edit rule"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>

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