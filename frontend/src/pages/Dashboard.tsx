import { useEffect, useState } from "react";
import { getFlagRules, type FlagRule } from "@/lib/flag-rules";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { getProjects, type Project } from "@/lib/projects";
import {
    getEnvironments,
    type Environment,
} from "@/lib/environments";
import {
    getFeatureFlags,
    type FeatureFlag,
} from "@/lib/feature-flags";

interface DashboardFlag extends FeatureFlag {
    environmentName: string;
    projectName: string;
    rules: FlagRule[];
}

export function Dashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [flags, setFlags] = useState<DashboardFlag[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                setError("");

                const projectList = await getProjects();

                const environmentResults = await Promise.all(
                    projectList.map((project) =>
                        getEnvironments(project.id)
                    )
                );

                const allEnvironments = environmentResults.flat();

                const flagResults = await Promise.all(
                    allEnvironments.map(async (environment) => {
                        const project = projectList.find(
                            (item) => item.id === environment.projectId
                        );

                        const environmentFlags = await getFeatureFlags(
                            environment.id
                        );

                        return Promise.all(
                            environmentFlags.map(async (flag) => {
                                const rules = await getFlagRules(flag.id);

                                return {
                                    ...flag,
                                    environmentName: environment.name,
                                    projectName: project?.name ?? "Unknown project",
                                    rules,
                                };
                            })
                        );
                    })
                );

                setFlags(flagResults.flat());

                setProjects(projectList);
                setEnvironments(allEnvironments);
                setFlags(flagResults.flat());
            } catch {
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        }

        void loadDashboard();
    }, []);

    return (
        <div className="space-y-8 p-6 md:p-8">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                    Dashboard
                </h2>

                <p className="text-sm text-muted-foreground">
                    Manage your feature flags and environments.
                </p>
            </div>

            <Separator />

            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">
                            Projects
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-3xl font-semibold">
                            {loading ? "—" : projects.length}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">
                            Environments
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-3xl font-semibold">
                            {loading ? "—" : environments.length}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">
                            Feature Flags
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-3xl font-semibold">
                            {loading ? "—" : flags.length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {!loading && flags.length === 0 && (
                <Card>
                    <CardContent className="py-10 text-center">
                        <p className="font-medium">
                            No feature flags yet
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Create a feature flag inside an environment to
                            see it here.
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {flags.map((flag) => (
                    <Card key={flag.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{flag.name}</CardTitle>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {flag.key}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {flag.projectName} ·{" "}
                                        {flag.environmentName}
                                    </p>
                                </div>

                                <Badge>
                                    {flag.enabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Rollout
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold">
                                        {flag.rolloutPercentage}%
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Targeting
                                    </p>

                                    {flag.rules.length === 0 ? (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            No targeting rules
                                        </p>
                                    ) : (
                                        <div className="mt-1 space-y-1">
                                            {flag.rules.map((rule) => (
                                                <p
                                                    key={rule.id}
                                                    className="text-sm font-medium"
                                                >
                                                    {rule.attribute}{" "}
                                                    {rule.operator}{" "}
                                                    {rule.value}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}