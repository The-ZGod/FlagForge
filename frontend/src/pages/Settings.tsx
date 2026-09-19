import { useEffect, useState } from "react";
import {
    Check,
    Code2,
    Copy,
    KeyRound,
    Lock,
    Shield,
    User,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getProjects, type Project } from "@/lib/projects";
import { getEnvironments, type Environment } from "@/lib/environments";
import { generateEnvironmentApiKey } from "@/lib/api-keys";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Settings() {
    const user = getCurrentUser();

    const [projects, setProjects] = useState<Project[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [selectedEnvId, setSelectedEnvId] = useState<string>("");

    const [generating, setGenerating] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedSnippet, setCopiedSnippet] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const projectList = await getProjects();
                setProjects(projectList);
                if (projectList.length > 0) {
                    setSelectedProjectId(projectList[0].id);
                    const envList = await getEnvironments(projectList[0].id);
                    setEnvironments(envList);
                    if (envList.length > 0) {
                        setSelectedEnvId(envList[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to load settings data", err);
            }
        }
        loadData();
    }, []);

    async function handleProjectSelect(projId: string) {
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

    const selectedEnv = environments.find((e) => e.id === selectedEnvId);

    const sdkSnippet = `// TypeScript / Node.js Runtime SDK Example
import { FlagForgeClient } from "@flagforge/sdk";

const client = new FlagForgeClient({
  apiKey: "${generatedKey || "ff_live_YOUR_ENVIRONMENT_KEY"}",
  environmentKey: "${selectedEnv?.key || "production"}"
});

// Evaluate a feature flag for a user
const isEnabled = await client.evaluate("new_checkout_experience", {
  userId: "user_12345",
  attributes: {
    country: "US",
    plan: "enterprise"
  }
});

if (isEnabled) {
  // Render new checkout flow
}`;

    function handleCopySnippet() {
        navigator.clipboard.writeText(sdkSnippet);
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2000);
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Project & Environment Settings
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Manage runtime SDK API credentials, account information, and integration configurations.
                </p>
            </div>

            <Tabs defaultValue="api-keys" className="w-full">
                <TabsList className="grid w-full sm:w-96 grid-cols-3">
                    <TabsTrigger value="api-keys" className="gap-1.5 text-xs">
                        <KeyRound className="size-3.5" />
                        <span>API Keys</span>
                    </TabsTrigger>
                    <TabsTrigger value="sdk" className="gap-1.5 text-xs">
                        <Code2 className="size-3.5" />
                        <span>SDK Setup</span>
                    </TabsTrigger>
                    <TabsTrigger value="account" className="gap-1.5 text-xs">
                        <User className="size-3.5" />
                        <span>Profile</span>
                    </TabsTrigger>
                </TabsList>

                {/* API Keys Tab */}
                <TabsContent value="api-keys" className="space-y-6">
                    {/* Architecture Notice */}
                    <div className="rounded-xl border border-border/80 bg-muted/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3.5">
                        <Shield className="size-5 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <p className="font-semibold text-foreground">
                                Runtime SDK API Keys vs. Dashboard Authentication
                            </p>
                            <p>
                                <strong>Dashboard login tokens (JWT)</strong> authenticate team members managing flags in this dashboard.
                            </p>
                            <p>
                                <strong>Environment API Keys</strong> are read-only runtime credentials used by backend servers and client applications to fetch flag values securely without exposing admin permissions.
                            </p>
                        </div>
                    </div>

                    {/* API Key Generator Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">
                                Environment Runtime Keys
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Generate or rotate a runtime evaluation API key for a specific environment.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {error && (
                                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="key-proj-select" className="text-xs font-medium">
                                        Select Project
                                    </Label>
                                    <select
                                        id="key-proj-select"
                                        value={selectedProjectId}
                                        onChange={(e) => handleProjectSelect(e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
                                    >
                                        {projects.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="key-env-select" className="text-xs font-medium">
                                        Select Environment
                                    </Label>
                                    <select
                                        id="key-env-select"
                                        value={selectedEnvId}
                                        onChange={(e) => {
                                            setSelectedEnvId(e.target.value);
                                            setGeneratedKey(null);
                                        }}
                                        disabled={environments.length === 0}
                                        className="w-full h-9 rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer disabled:opacity-50"
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

                            <div className="pt-2">
                                <Button
                                    size="sm"
                                    onClick={handleGenerateKey}
                                    disabled={generating || !selectedEnvId}
                                    className="gap-1.5 text-xs font-semibold"
                                >
                                    <KeyRound className="size-3.5" />
                                    {generating
                                        ? "Generating Key..."
                                        : "Generate / Rotate API Key"}
                                </Button>
                            </div>

                            {/* Generated Key Display */}
                            {generatedKey && (
                                <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-3 animate-in fade-in duration-150">
                                    <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs">
                                        <Lock className="size-4" />
                                        <span>Save this runtime API key securely</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        This raw key will only be displayed once. If lost, you will need to generate a new key, which invalidates the old one.
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <Input
                                            readOnly
                                            value={generatedKey}
                                            className="font-mono text-xs bg-background select-all"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyKey}
                                            className="gap-1 text-xs font-semibold shrink-0"
                                        >
                                            {copiedKey ? (
                                                <>
                                                    <Check className="size-3.5 text-green-600" />
                                                    <span>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3.5" />
                                                    <span>Copy Key</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SDK Setup Tab */}
                <TabsContent value="sdk" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    TypeScript / Node.js Integration
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Initialize FlagForge SDK in your backend or API gateway.
                                </CardDescription>
                            </div>

                            <Button
                                variant="outline"
                                size="xs"
                                onClick={handleCopySnippet}
                                className="gap-1 text-xs h-7"
                            >
                                {copiedSnippet ? (
                                    <>
                                        <Check className="size-3 text-green-600" />
                                        <span>Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="size-3" />
                                        <span>Copy Code</span>
                                    </>
                                )}
                            </Button>
                        </CardHeader>

                        <CardContent>
                            <pre className="rounded-lg bg-muted/60 p-4 font-mono text-xs text-foreground overflow-x-auto border border-border/80">
                                <code>{sdkSnippet}</code>
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Profile / Account Tab */}
                <TabsContent value="account" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Account Profile</CardTitle>
                            <CardDescription className="text-xs">
                                Your account details and credentials.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 max-w-md">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Full Name</Label>
                                <Input
                                    readOnly
                                    value={user?.name || "FlagForge Developer"}
                                    className="text-xs bg-muted/40"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Email Address</Label>
                                <Input
                                    readOnly
                                    value={user?.email || "user@flagforge.dev"}
                                    className="text-xs bg-muted/40 font-mono"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">User ID</Label>
                                <Input
                                    readOnly
                                    value={user?.id || "—"}
                                    className="text-xs font-mono bg-muted/40"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}