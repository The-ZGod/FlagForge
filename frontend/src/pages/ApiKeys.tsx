import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Check,
    Copy,
    Info,
    KeyRound,
    Lock,
    RefreshCw,
    Shield,
    Terminal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjects, type Project } from "@/lib/projects";
import { getEnvironments, type Environment } from "@/lib/environments";
import { generateEnvironmentApiKey } from "@/lib/api-keys";

export function ApiKeys() {
    const params = useParams();
    const routeProjectId = params.projectId;
    const routeEnvironmentId = params.environmentId;

    const [projects, setProjects] = useState<Project[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [selectedEnvId, setSelectedEnvId] = useState<string>("");

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedSnippet, setCopiedSnippet] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadInitialData() {
            try {
                setLoading(true);
                setError("");
                const projectList = await getProjects();
                setProjects(projectList);

                if (projectList.length > 0) {
                    const targetProjId =
                        routeProjectId && projectList.some((p) => p.id === routeProjectId)
                            ? routeProjectId
                            : projectList[0].id;
                    setSelectedProjectId(targetProjId);

                    const envList = await getEnvironments(targetProjId);
                    setEnvironments(envList);

                    if (envList.length > 0) {
                        const targetEnvId =
                            routeEnvironmentId && envList.some((e) => e.id === routeEnvironmentId)
                                ? routeEnvironmentId
                                : envList[0].id;
                        setSelectedEnvId(targetEnvId);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load projects and environments");
            } finally {
                setLoading(false);
            }
        }

        loadInitialData();
    }, [routeProjectId, routeEnvironmentId]);

    async function handleProjectChange(projId: string) {
        setSelectedProjectId(projId);
        setGeneratedKey(null);
        try {
            const envList = await getEnvironments(projId);
            setEnvironments(envList);
            if (envList.length > 0) {
                setSelectedEnvId(envList[0].id);
            } else {
                setSelectedEnvId("");
            }
        } catch (err) {
            console.error("Failed to load environments for project", err);
        }
    }

    async function handleGenerateKey() {
        if (!selectedEnvId) return;

        try {
            setGenerating(true);
            setError("");
            setCopiedKey(false);

            const result = await generateEnvironmentApiKey(selectedEnvId);
            setGeneratedKey(result.apiKey);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to generate environment API key"
            );
        } finally {
            setGenerating(false);
        }
    }

    function handleCopyKey() {
        if (!generatedKey) return;
        navigator.clipboard.writeText(generatedKey);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    }

    const currentProject = projects.find((p) => p.id === selectedProjectId);
    const currentEnvironment = environments.find((e) => e.id === selectedEnvId);

    const codeSnippet = `import { FlagForge } from "@flagforge/sdk";

// Initialize the FlagForge SDK client with your environment runtime key
const flagforge = new FlagForge({
  apiUrl: "${window.location.origin}",
  apiKey: "${generatedKey || "ff_live_YOUR_ENVIRONMENT_KEY"}"
});

// Evaluate a flag for a user
const result = await flagforge.evaluate("new_checkout_experience", {
  userId: "user_84920",
  attributes: {
    country: "US",
    plan: "enterprise"
  }
});

if (result.enabled) {
  // Feature is enabled for this user cohort
} else {
  // Flag disabled or targeting condition failed (${'result.reason'})
}`;

    function handleCopySnippet() {
        navigator.clipboard.writeText(codeSnippet);
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2000);
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2.5">
                    <KeyRound className="size-6 text-foreground" />
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Runtime API Keys
                    </h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Environment-scoped runtime credentials used by TypeScript SDKs and backend services to evaluate feature flags.
                </p>
            </div>

            {/* Architecture Notice */}
            <div className="rounded-xl border border-border/80 bg-muted/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3.5">
                <Shield className="size-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">
                        Authentication vs. Runtime Evaluation Credentials
                    </p>
                    <p>
                        <strong className="text-foreground">Dashboard JWT tokens</strong> authenticate team members managing flags in the web interface.
                    </p>
                    <p>
                        <strong className="text-foreground">Environment API Keys</strong> are read-only runtime credentials used by client applications and microservices to fetch flag evaluations via <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">X-FlagForge-Key</code> header without administrative dashboard privileges.
                    </p>
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

            {/* Context & Key Generator Card */}
            <Card className="shadow-xs">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold">Environment Key Management</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Select target project and environment to generate or rotate runtime API keys.
                            </CardDescription>
                        </div>
                        {currentEnvironment && (
                            <Badge variant="outline" className="text-xs font-mono">
                                {currentProject ? `${currentProject.name} / ${currentEnvironment.name}` : currentEnvironment.key}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="key-proj" className="text-sm font-medium">
                                    Project
                                </Label>
                                <select
                                    id="key-proj"
                                    value={selectedProjectId}
                                    onChange={(e) => handleProjectChange(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-input bg-card px-3 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
                                >
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="key-env" className="text-sm font-medium">
                                    Environment
                                </Label>
                                <select
                                    id="key-env"
                                    value={selectedEnvId}
                                    onChange={(e) => {
                                        setSelectedEnvId(e.target.value);
                                        setGeneratedKey(null);
                                    }}
                                    disabled={environments.length === 0}
                                    className="w-full h-10 rounded-lg border border-input bg-card px-3 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer disabled:opacity-50"
                                >
                                    {environments.length === 0 ? (
                                        <option value="">No environments found</option>
                                    ) : (
                                        environments.map((e) => (
                                            <option key={e.id} value={e.id}>
                                                {e.name} ({e.key})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <Button
                            size="sm"
                            onClick={handleGenerateKey}
                            disabled={generating || !selectedEnvId || loading}
                            className="gap-2 text-sm font-semibold h-9"
                        >
                            {generating ? (
                                <>
                                    <RefreshCw className="size-4 animate-spin" />
                                    <span>Generating API Key...</span>
                                </>
                            ) : (
                                <>
                                    <KeyRound className="size-4" />
                                    <span>Generate / Rotate Runtime Key</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Reveal newly generated key */}
                    {generatedKey && (
                        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 sm:p-5 space-y-3 animate-in zoom-in-95 duration-150">
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                                <Lock className="size-4.5" />
                                <span>Save this raw API key securely</span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                For security reasons, this raw token will only be displayed once. If lost or compromised, generating a new key will immediately invalidate previous credentials for <strong className="text-foreground">{currentEnvironment?.name}</strong>.
                            </p>

                            <div className="flex items-center gap-2">
                                <Input
                                    readOnly
                                    value={generatedKey}
                                    className="font-mono text-sm bg-background select-all h-10"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyKey}
                                    className="gap-1.5 text-xs font-semibold shrink-0 h-10 px-3"
                                >
                                    {copiedKey ? (
                                        <>
                                            <Check className="size-4 text-green-600" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="size-4" />
                                            <span>Copy Key</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Integration Quick Start */}
            <Card className="shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Terminal className="size-4 text-primary" />
                            <CardTitle className="text-base font-semibold">SDK Integration Example</CardTitle>
                        </div>
                        <CardDescription className="text-xs mt-0.5">
                            Use this snippet to configure the FlagForge TypeScript SDK in {currentEnvironment?.name || "your environment"}.
                        </CardDescription>
                    </div>

                    <Button
                        variant="outline"
                        size="xs"
                        onClick={handleCopySnippet}
                        className="gap-1.5 text-xs h-8"
                    >
                        {copiedSnippet ? (
                            <>
                                <Check className="size-3.5 text-green-600" />
                                <span>Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="size-3.5" />
                                <span>Copy Code</span>
                            </>
                        )}
                    </Button>
                </CardHeader>

                <CardContent>
                    <pre className="rounded-xl bg-muted/60 p-4 font-mono text-xs sm:text-sm text-foreground overflow-x-auto border border-border/80">
                        <code>{codeSnippet}</code>
                    </pre>

                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Info className="size-3.5 text-muted-foreground" />
                        <span>For detailed parameter definitions and HTTP API reference, visit the <a href="/docs" className="text-primary underline font-medium">Docs</a>.</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
