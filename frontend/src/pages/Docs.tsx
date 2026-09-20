import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    BookOpen,
    Check,
    ChevronRight,
    Code2,
    Copy,
    Cpu,
    FileCode,
    Layers,
    Radio,
    Shield,
    Sliders,
    Sparkles,
    Terminal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function CodeBlock({ code, language = "typescript" }: { code: string; language?: string }) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="relative rounded-xl border border-border/80 bg-muted/40 my-3 overflow-hidden shadow-2xs group">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/70 border-b border-border/60 text-xs font-mono text-muted-foreground">
                <span className="uppercase font-semibold tracking-wider text-[11px]">{language}</span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-card/80 px-2 py-1 rounded-md border border-border/60 shadow-2xs"
                >
                    {copied ? (
                        <>
                            <Check className="size-3 text-green-600" />
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="size-3" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto text-foreground leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
}

export function Docs() {
    const [activeSection, setActiveSection] = useState("quick-start");

    const sections = [
        { id: "quick-start", title: "Quick Start", icon: Sparkles },
        { id: "core-concepts", title: "Core Concepts", icon: Layers },
        { id: "sdk-installation", title: "Installation & Setup", icon: Terminal },
        { id: "sdk-methods", title: "SDK Methods", icon: Code2 },
        { id: "targeting-and-rollouts", title: "Targeting & Rollouts", icon: Sliders },
        { id: "evaluation-reasons", title: "Evaluation Reasons", icon: Radio },
        { id: "runtime-api", title: "Raw HTTP API", icon: Cpu },
        { id: "code-examples", title: "Integration Examples", icon: FileCode },
    ];

    const quickStartSnippet = `import { FlagForge } from "@flagforge/sdk";

// 1. Initialize FlagForge with your environment runtime API key
const flagforge = new FlagForge({
  apiUrl: "https://your-flagforge-instance.com",
  apiKey: "ff_live_YOUR_ENVIRONMENT_API_KEY"
});

// 2. Evaluate a flag for a user
const isNewCheckoutEnabled = await flagforge.isEnabled("new_checkout_experience", {
  userId: "user_10294",
  attributes: {
    country: "US",
    plan: "enterprise"
  }
});

if (isNewCheckoutEnabled) {
  // Render high-conversion checkout
} else {
  // Fallback to legacy checkout
}`;

    const installSnippet = `# Using npm
npm install @flagforge/sdk

# Using pnpm
pnpm add @flagforge/sdk

# Using yarn
yarn add @flagforge/sdk`;

    const methodsSnippet = `// Full evaluate method returning enabled state & reason
const result = await flagforge.evaluate("dark_mode_v2", {
  userId: "usr_44912",
  attributes: {
    tier: "beta_tester",
    platform: "web"
  }
});

console.log(result.enabled); // boolean (true / false)
console.log(result.reason);  // "FULL_ROLLOUT" | "PERCENTAGE_ROLLOUT" | etc.

// Convenience boolean helper
const isEnabled: boolean = await flagforge.isEnabled("dark_mode_v2", {
  userId: "usr_44912"
});`;

    const rawHttpSnippet = `curl -X POST https://your-flagforge-instance.com/api/evaluation \\
  -H "Content-Type: application/json" \\
  -H "X-FlagForge-Key: ff_live_YOUR_ENVIRONMENT_API_KEY" \\
  -d '{
    "flagKey": "new_checkout_experience",
    "userId": "user_10294",
    "attributes": {
      "country": "US",
      "plan": "enterprise"
    }
  }'

# Response:
{
  "enabled": true,
  "reason": "FULL_ROLLOUT"
}`;

    const expressExample = `import express from "express";
import { FlagForge } from "@flagforge/sdk";

const app = express();
const flagforge = new FlagForge({
  apiUrl: process.env.FLAGFORGE_API_URL!,
  apiKey: process.env.FLAGFORGE_API_KEY!
});

app.get("/api/v1/search", async (req, res) => {
  const userId = req.headers["x-user-id"] as string || "anonymous";
  const userPlan = (req.query.plan as string) || "free";

  const useAiSearch = await flagforge.isEnabled("ai_powered_search", {
    userId,
    attributes: { plan: userPlan }
  });

  if (useAiSearch) {
    return res.json({ engine: "vector-semantic-v2", results: [...] });
  }

  return res.json({ engine: "standard-keyword", results: [...] });
});`;

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8 animate-in fade-in duration-150">
            {/* Docs Page Header */}
            <div className="border-b border-border/80 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <BookOpen className="size-6 text-primary" />
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            FlagForge Developer Documentation
                        </h1>
                        <Badge variant="secondary" className="font-mono text-xs">
                            v1.0.0
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Comprehensive guide to integrating FlagForge feature flags, deterministic percentage rollouts, targeting rules, and SDKs into your backend applications.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Link to="/api-keys">
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                            <Shield className="size-3.5" />
                            <span>Get API Keys</span>
                        </Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button size="sm" className="gap-1.5 text-xs font-semibold">
                            <span>Open Console</span>
                            <ArrowRight className="size-3.5" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Layout Grid: Sidebar + Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Docs Sidebar Navigation */}
                <aside className="lg:col-span-3 sticky top-20 bg-card border border-border/80 rounded-xl p-3 shadow-2xs space-y-1">
                    <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Documentation
                    </p>
                    {sections.map((sec) => {
                        const Icon = sec.icon;
                        const isActive = activeSection === sec.id;
                        return (
                            <button
                                key={sec.id}
                                type="button"
                                onClick={() => {
                                    setActiveSection(sec.id);
                                    document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                                    isActive
                                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Icon className="size-4 shrink-0" />
                                    <span>{sec.title}</span>
                                </div>
                                <ChevronRight className={`size-3.5 opacity-60 ${isActive ? "text-primary-foreground" : ""}`} />
                            </button>
                        );
                    })}
                </aside>

                {/* Main Docs Content Stream */}
                <main className="lg:col-span-9 space-y-12">
                    {/* Section: Quick Start */}
                    <section id="quick-start" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                            <Sparkles className="size-4" />
                            <span>Getting Started</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            Quick Start
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            FlagForge decouples deployment from feature release. Initialize the client once in your application startup lifecycle and evaluate flags dynamically with deterministic bucketing.
                        </p>

                        <CodeBlock code={quickStartSnippet} language="typescript" />
                    </section>

                    {/* Section: Core Concepts */}
                    <section id="core-concepts" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                            <Layers className="size-4" />
                            <span>Architecture</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            Core Concepts
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Card className="shadow-2xs">
                                <CardContent className="p-4 space-y-1.5">
                                    <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                                        <Radio className="size-4 text-primary" />
                                        <span>Feature Flags</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Dynamic toggles identified by unique keys (e.g. <code className="font-mono text-foreground">new_checkout</code>) with master kill-switches and release rules.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-2xs">
                                <CardContent className="p-4 space-y-1.5">
                                    <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                                        <Sliders className="size-4 text-primary" />
                                        <span>Targeting Rules</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Attribute conditions (<code className="font-mono text-foreground">EQUALS</code>, <code className="font-mono text-foreground">NOT_EQUALS</code>) evaluated against runtime user context prior to percentage bucketing.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-2xs">
                                <CardContent className="p-4 space-y-1.5">
                                    <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                                        <Sparkles className="size-4 text-primary" />
                                        <span>Percentage Rollouts</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Deterministic hash bucketing (0–100%) computed against the supplied <code className="font-mono text-foreground">userId</code>, ensuring consistent user experience across sessions.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-2xs">
                                <CardContent className="p-4 space-y-1.5">
                                    <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                                        <Shield className="size-4 text-primary" />
                                        <span>Environment API Keys</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Read-only credentials scoped to specific deployment environments (Development, Staging, Production) for runtime evaluation isolation.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Section: Installation */}
                    <section id="sdk-installation" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                            <Terminal className="size-4" />
                            <span>Package Manager</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            SDK Installation & Setup
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Install the official TypeScript/Node.js SDK into your server, API gateway, or worker process.
                        </p>

                        <CodeBlock code={installSnippet} language="bash" />
                    </section>

                    {/* Section: SDK Methods */}
                    <section id="sdk-methods" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                            <Code2 className="size-4" />
                            <span>TypeScript SDK Reference</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            SDK Methods & Signatures
                        </h2>

                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="rounded-lg border border-border/80 bg-card p-4 space-y-2">
                                <h4 className="font-mono font-semibold text-foreground text-sm">
                                    flagforge.evaluate(flagKey, user): Promise&lt;EvaluationResult&gt;
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Evaluates the given flag for a specific user and returns both the boolean verdict and the exact evaluation reason code.
                                </p>
                            </div>

                            <div className="rounded-lg border border-border/80 bg-card p-4 space-y-2">
                                <h4 className="font-mono font-semibold text-foreground text-sm">
                                    flagforge.isEnabled(flagKey, user): Promise&lt;boolean&gt;
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    A convenient boolean wrapper for condition checks in business logic.
                                </p>
                            </div>
                        </div>

                        <CodeBlock code={methodsSnippet} language="typescript" />
                    </section>

                    {/* Section: Evaluation Reasons */}
                    <section id="evaluation-reasons" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                            <Radio className="size-4" />
                            <span>Evaluation Engine</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            Evaluation Reasons Reference
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            The evaluation engine returns a deterministic decision reason for every evaluation request:
                        </p>

                        <div className="rounded-xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60">
                            {[
                                {
                                    reason: "FULL_ROLLOUT",
                                    desc: "Flag is enabled and rollout percentage is set to 100%. All users receive the feature.",
                                    result: "Enabled",
                                    variant: "default" as const,
                                },
                                {
                                    reason: "PERCENTAGE_ROLLOUT",
                                    desc: "User ID was deterministically bucketed within the configured rollout percentage range.",
                                    result: "Enabled",
                                    variant: "default" as const,
                                },
                                {
                                    reason: "PERCENTAGE_ROLLOUT_EXCLUDED",
                                    desc: "User ID bucket fell outside the current percentage rollout threshold.",
                                    result: "Disabled",
                                    variant: "secondary" as const,
                                },
                                {
                                    reason: "TARGETING_RULE_NOT_MATCHED",
                                    desc: "User attributes did not satisfy the configured targeting rules (e.g. country, plan tier).",
                                    result: "Disabled",
                                    variant: "secondary" as const,
                                },
                                {
                                    reason: "FLAG_DISABLED",
                                    desc: "Master flag kill-switch is turned off in this environment.",
                                    result: "Disabled",
                                    variant: "destructive" as const,
                                },
                                {
                                    reason: "FLAG_NOT_FOUND",
                                    desc: "No active feature flag matches the requested flag key in the environment.",
                                    result: "Disabled",
                                    variant: "destructive" as const,
                                },
                            ].map((item) => (
                                <div key={item.reason} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <code className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                                                {item.reason}
                                            </code>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                    <Badge variant={item.variant} className="text-xs shrink-0 self-start sm:self-auto font-mono">
                                        {item.result}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section: Raw HTTP API */}
                    <section id="runtime-api" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                            <Cpu className="size-4" />
                            <span>HTTP REST API</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            Raw Runtime Evaluation API
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            If you are not using Node.js/TypeScript (e.g., Python, Go, Rust, Ruby), call the runtime evaluation endpoint directly using the <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">X-FlagForge-Key</code> header:
                        </p>

                        <CodeBlock code={rawHttpSnippet} language="bash" />
                    </section>

                    {/* Section: Integration Examples */}
                    <section id="code-examples" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                            <FileCode className="size-4" />
                            <span>Practical Recipes</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            Integration Examples
                        </h2>

                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-foreground">Express.js Route Protection</h3>
                            <CodeBlock code={expressExample} language="typescript" />
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
