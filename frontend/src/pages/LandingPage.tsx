import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Check,
    CheckCircle2,
    Code2,
    Copy,
    Cpu,
    KeyRound,
    Radio,
    Sliders,
    Sparkles,
    Terminal,
    Zap,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
    );
}

import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function LandingPage() {
    const currentUser = getCurrentUser();
    const [copiedCode, setCopiedCode] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "flags" | "evaluation">("overview");

    const sdkSnippet = `import { FlagForge } from "@flagforge/sdk";

// 1. Initialize client with environment runtime key
const flagforge = new FlagForge({
  apiUrl: "${typeof window !== "undefined" ? window.location.origin : "https://api.flagforge.dev"}",
  apiKey: "ff_live_prod_99f482a17b"
});

// 2. Evaluate feature flag for user
const result = await flagforge.evaluate("new_checkout_flow", {
  userId: "user_89104",
  attributes: {
    country: "US",
    plan: "enterprise"
  }
});

if (result.enabled) {
  // Serve modern checkout experience
} else {
  // Fallback to legacy workflow (Reason: \${result.reason})
}`;

    function handleCopyCode() {
        navigator.clipboard.writeText(sdkSnippet);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2.5 group focus:outline-hidden">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
                            <Radio className="size-5" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-base font-bold tracking-tight text-foreground leading-none">
                                FlagForge
                            </span>
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                                Feature Platform
                            </span>
                        </div>
                    </Link>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-foreground transition-colors">
                            Features
                        </a>
                        <a href="#how-it-works" className="hover:text-foreground transition-colors">
                            How It Works
                        </a>
                        <a href="#developer" className="hover:text-foreground transition-colors">
                            SDK & API
                        </a>
                        <Link to="/docs" className="hover:text-foreground transition-colors">
                            Docs
                        </Link>
                        <a
                            href="https://github.com/The-ZGod/FlagForge"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                        >
                            <GithubIcon className="size-4" />
                            <span>GitHub</span>
                        </a>
                    </nav>

                    {/* Auth CTA & Theme Toggle */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        {currentUser ? (
                            <Link to="/dashboard">
                                <Button className="gap-2 text-xs sm:text-sm font-semibold shadow-xs">
                                    <span>Go to Dashboard</span>
                                    <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm font-medium">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button size="sm" className="gap-1.5 text-xs sm:text-sm font-semibold shadow-xs">
                                        <span>Get Started</span>
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3.5 py-1 text-xs font-medium text-foreground shadow-2xs">
                        <Sparkles className="size-3.5 text-primary" />
                        <span>Deterministic Rollouts & Targeting Engine</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-mono text-muted-foreground">v1.0.0</span>
                    </div>

                    {/* Headline */}
                    <div className="max-w-3xl mx-auto space-y-4">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                            Feature flags without the deployment bottleneck.
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Control releases, target users by attributes, and gradually roll out features deterministically without shipping new code or restarting servers.
                        </p>
                    </div>

                    {/* Hero Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Link to={currentUser ? "/dashboard" : "/login"}>
                            <Button size="lg" className="h-11 px-6 text-sm sm:text-base font-semibold gap-2 shadow-md w-full sm:w-auto">
                                <span>{currentUser ? "Open Console Dashboard" : "Open Dashboard"}</span>
                                <ArrowRight className="size-4" />
                            </Button>
                        </Link>

                        <Link to="/docs">
                            <Button size="lg" variant="outline" className="h-11 px-6 text-sm sm:text-base font-medium gap-2 w-full sm:w-auto">
                                <Code2 className="size-4.5" />
                                <span>Read Documentation</span>
                            </Button>
                        </Link>
                    </div>

                    {/* Interactive Product Showcase Mockup */}
                    <div className="pt-8 max-w-5xl mx-auto">
                        <div className="rounded-2xl border border-border/80 bg-card p-2 sm:p-4 shadow-2xl">
                            {/* Showcase Sub-tabs */}
                            <div className="flex items-center justify-between border-b border-border/60 pb-3 px-2">
                                <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("overview")}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                            activeTab === "overview"
                                                ? "bg-card text-foreground shadow-2xs"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Console Overview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("flags")}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                            activeTab === "flags"
                                                ? "bg-card text-foreground shadow-2xs"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Flag Workspace
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("evaluation")}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                            activeTab === "evaluation"
                                                ? "bg-card text-foreground shadow-2xs"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Runtime Evaluation
                                    </button>
                                </div>

                                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                    <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                                    <span>Engine Online</span>
                                </div>
                            </div>

                            {/* Showcase Screen Content */}
                            <div className="p-4 sm:p-6 text-left">
                                {activeTab === "overview" && (
                                    <div className="space-y-4 animate-in fade-in duration-150">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                                                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Projects</p>
                                                <p className="text-xl font-bold font-mono text-foreground mt-1">4 Active</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                                                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Environments</p>
                                                <p className="text-xl font-bold font-mono text-foreground mt-1">12 Scoped</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                                                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Feature Flags</p>
                                                <p className="text-xl font-bold font-mono text-foreground mt-1">28 Deployed</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                                                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Targeting Rules</p>
                                                <p className="text-xl font-bold font-mono text-foreground mt-1">54 Rules</p>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-border/60 p-4 bg-muted/10 space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm text-foreground">new_checkout_experience</span>
                                                <Badge variant="default" className="text-[10px]">ENABLED (50% Rollout)</Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>Targeting:</span>
                                                <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono text-foreground">country EQUALS US</code>
                                                <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono text-foreground">plan NOT_EQUALS free</code>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "flags" && (
                                    <div className="space-y-4 animate-in fade-in duration-150">
                                        <div className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-sm text-foreground">Percentage Rollout Configuration</h4>
                                                    <p className="text-xs text-muted-foreground">Gradually shift traffic using deterministic Murmur3 user ID hashing.</p>
                                                </div>
                                                <span className="text-2xl font-bold font-mono text-foreground">65%</span>
                                            </div>
                                            <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full rounded-full w-[65%]" />
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-2">
                                            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                <span>Active Targeting Constraints</span>
                                                <span>2 rules configured</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-mono bg-card p-2 rounded border border-border/60">
                                                <span className="text-primary font-bold">1</span>
                                                <span>user.role EQUALS "admin"</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-mono bg-card p-2 rounded border border-border/60">
                                                <span className="text-primary font-bold">2</span>
                                                <span>user.tier NOT_EQUALS "legacy"</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "evaluation" && (
                                    <div className="space-y-4 animate-in fade-in duration-150">
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
                                                <p className="text-xs font-semibold text-muted-foreground">Simulated User Context</p>
                                                <div className="font-mono text-xs space-y-1 text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                                                    <p><span className="text-foreground font-semibold">userId:</span> "usr_prod_9021"</p>
                                                    <p><span className="text-foreground font-semibold">country:</span> "US"</p>
                                                    <p><span className="text-foreground font-semibold">plan:</span> "enterprise"</p>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 flex flex-col justify-between">
                                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-base">
                                                    <CheckCircle2 className="size-5" />
                                                    <span>ENABLED (Matched)</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground space-y-0.5 mt-3">
                                                    <p><strong className="text-foreground">Reason:</strong> PERCENTAGE_ROLLOUT</p>
                                                    <p><strong className="text-foreground">Roundtrip Latency:</strong> 4 ms</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features Section */}
            <section id="features" className="py-20 bg-muted/20 border-y border-border/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-3">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                            <Zap className="size-4" />
                            <span>Developer Capabilities</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            Built for modern engineering teams.
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Everything required to manage complex releases, conduct experiments, and safeguard production environments.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Feature 1 */}
                        <Card className="border-border/80 shadow-2xs hover:shadow-xs transition-shadow">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Radio className="size-5" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Feature Flags</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Toggle flags on or off in milliseconds without redeploying code, managing rollout percentages, or changing configurations.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="border-border/80 shadow-2xs hover:shadow-xs transition-shadow">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                    <Sliders className="size-5" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Targeting Rules</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Target cohorts by user attributes with EQUALS and NOT_EQUALS operators before rollout percentages are evaluated.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="border-border/80 shadow-2xs hover:shadow-xs transition-shadow">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                                    <Sparkles className="size-5" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Percentage Rollouts</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Gradually ramp releases from 0% to 100% using deterministic Murmur3 hashing so users stay in consistent cohorts.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 4 */}
                        <Card className="border-border/80 shadow-2xs hover:shadow-xs transition-shadow">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                                    <KeyRound className="size-5" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Environment API Keys</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Environment-scoped credentials isolate Development, Staging, and Production flag states with fast runtime evaluation.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 5 */}
                        <Card className="border-border/80 shadow-2xs hover:shadow-xs transition-shadow">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                                    <Cpu className="size-5" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Evaluation Metrics</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Track evaluation throughput, enabled vs. disabled distributions, decision reasons, and sub-millisecond latencies in real time.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 6 */}
                        <Card className="border-border/80 shadow-2xs hover:shadow-xs transition-shadow">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                                    <Terminal className="size-5" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">TypeScript SDK</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Lightweight, zero-overhead TypeScript SDK with robust fail-safes, type definitions, and direct HTTP REST API compatibility.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* How It Works Flow */}
            <section id="how-it-works" className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            How FlagForge Works
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Go from flag creation to production evaluation in five straightforward steps.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                        {[
                            {
                                step: "01",
                                title: "Configure Flag",
                                desc: "Create your flag and specify percentage rollout or targeting rules.",
                            },
                            {
                                step: "02",
                                title: "Generate Key",
                                desc: "Generate an environment-scoped runtime SDK key in the console.",
                            },
                            {
                                step: "03",
                                title: "Integrate SDK",
                                desc: "Initialize the SDK in your backend server or API gateway.",
                            },
                            {
                                step: "04",
                                title: "Evaluate Flags",
                                desc: "Query flags at runtime passing userId and request context attributes.",
                            },
                            {
                                step: "05",
                                title: "Control Behavior",
                                desc: "Dynamically alter features and roll back immediately if issues arise.",
                            },
                        ].map((s) => (
                            <div
                                key={s.step}
                                className="relative rounded-xl border border-border/80 bg-card p-5 space-y-2 shadow-2xs"
                            >
                                <span className="font-mono text-2xl font-extrabold text-primary/40">
                                    {s.step}
                                </span>
                                <h4 className="font-bold text-base text-foreground">{s.title}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Developer Integration Code Section */}
            <section id="developer" className="py-20 bg-muted/20 border-t border-border/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="grid lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-5 space-y-5">
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                                <Code2 className="size-4" />
                                <span>Developer First</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                Seamless Integration in TypeScript & Node.js
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Install <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">@flagforge/sdk</code> and query flags asynchronously with typed user context attributes.
                            </p>

                            <div className="space-y-2.5 pt-2">
                                <div className="flex items-center gap-2 text-sm text-foreground">
                                    <Check className="size-4 text-green-600" />
                                    <span>Sub-millisecond local hash determination</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-foreground">
                                    <Check className="size-4 text-green-600" />
                                    <span>Fail-safe fallback on network disconnect</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-foreground">
                                    <Check className="size-4 text-green-600" />
                                    <span>Environment key isolation</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Link to="/docs">
                                    <Button className="gap-2 text-xs sm:text-sm font-semibold">
                                        <span>Explore Full SDK Reference</span>
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xl">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/70 border-b border-border/60 text-xs font-mono text-muted-foreground">
                                    <span className="font-semibold text-foreground">server.ts</span>
                                    <button
                                        type="button"
                                        onClick={handleCopyCode}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-card px-2 py-1 rounded border border-border/60 shadow-2xs"
                                    >
                                        {copiedCode ? (
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
                                    </button>
                                </div>
                                <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto text-foreground leading-relaxed">
                                    <code>{sdkSnippet}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Architecture Section */}
            <section className="py-16 border-t border-border/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="rounded-2xl border border-border/80 bg-muted/30 p-8 sm:p-10 space-y-6">
                        <div className="max-w-2xl space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight text-foreground">
                                Built with a resilient architecture
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Designed for high-concurrency evaluation and zero runtime downtime.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
                            <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                                <p className="font-bold text-sm text-foreground">Node & Express API</p>
                                <p className="text-xs text-muted-foreground">Optimized REST routing with rate-limits and JWT dashboard auth.</p>
                            </div>
                            <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                                <p className="font-bold text-sm text-foreground">PostgreSQL & Prisma</p>
                                <p className="text-xs text-muted-foreground">ACID-compliant relational persistence with immutable audit trails.</p>
                            </div>
                            <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                                <p className="font-bold text-sm text-foreground">Murmur3 Bucketing</p>
                                <p className="text-xs text-muted-foreground">Deterministic 0–100 integer hashing for percentage rollouts.</p>
                            </div>
                            <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                                <p className="font-bold text-sm text-foreground">React & Tailwind v4</p>
                                <p className="text-xs text-muted-foreground">Fluid, accessible developer interface with Geist typography.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 border-t border-border/80 text-center">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        Build safer releases with FlagForge.
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                        Get started in minutes with our developer console and TypeScript SDK.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <Link to={currentUser ? "/dashboard" : "/login"}>
                            <Button size="lg" className="h-11 px-6 text-sm sm:text-base font-semibold gap-2 shadow-md">
                                <span>{currentUser ? "Open Dashboard" : "Get Started Free"}</span>
                                <ArrowRight className="size-4" />
                            </Button>
                        </Link>
                        <Link to="/docs">
                            <Button size="lg" variant="outline" className="h-11 px-6 text-sm sm:text-base font-medium">
                                Read Docs
                            </Button>
                        </Link>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button size="lg" variant="ghost" className="h-11 px-6 text-sm sm:text-base font-medium gap-2">
                                <GithubIcon className="size-4.5" />
                                <span>View GitHub</span>
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/80 py-8 bg-muted/10 text-xs text-muted-foreground">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Radio className="size-4 text-primary" />
                        <span className="font-semibold text-foreground">FlagForge</span>
                        <span>© {new Date().getFullYear()} FlagForge Platform. All rights reserved.</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/docs" className="hover:text-foreground transition-colors">
                            Documentation
                        </Link>
                        <Link to="/login" className="hover:text-foreground transition-colors">
                            Console Sign In
                        </Link>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
