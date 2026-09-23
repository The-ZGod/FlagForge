import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";
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
    const blockRef = useRef<HTMLDivElement>(null);
    const reflectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const block = blockRef.current;
        const reflection = reflectionRef.current;
        if (!block || !reflection) return;

        const enter = () => {
            gsap.to(block, {
                y: -3,
                duration: 0.35,
                ease: "power3.out",
                overwrite: "auto",
            });

            gsap.to(reflection, {
                opacity: 1,
                xPercent: 120,
                duration: 0.7,
                ease: "power2.out",
                overwrite: "auto",
            });
        };

        const leave = () => {
            gsap.to(block, {
                y: 0,
                duration: 0.45,
                ease: "power3.out",
                overwrite: "auto",
            });
            gsap.to(reflection, {
                opacity: 0,
                xPercent: -120,
                duration: 0.35,
                ease: "power2.out",
                overwrite: "auto",
            });
        };

        block.addEventListener("mouseenter", enter);
        block.addEventListener("mouseleave", leave);

        return () => {
            block.removeEventListener("mouseenter", enter);
            block.removeEventListener("mouseleave", leave);
        };
    }, []);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }

    return (
        <div
            ref={blockRef}
            data-scroll
            data-scroll-speed="0.01"
            className="group relative my-4 overflow-hidden rounded-2xl border border-white/[0.10] bg-[#050505]/90 shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-[border-color,box-shadow] duration-500 hover:border-white/[0.20] hover:shadow-[0_24px_80px_rgba(0,0,0,0.40)]"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.07),transparent_30%)] opacity-70" />
            <div
                ref={reflectionRef}
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -translate-x-full skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent opacity-0"
            />

            <div className="relative flex items-center justify-between border-b border-white/[0.08] bg-white/[0.025] px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <span className="flex gap-1.5">
                        <span className="size-1.5 rounded-full bg-white/20" />
                        <span className="size-1.5 rounded-full bg-white/10" />
                        <span className="size-1.5 rounded-full bg-white/5" />
                    </span>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                        {language}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 text-[10px] font-medium text-white/45 transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white"
                >
                    {copied ? (
                        <>
                            <Check className="size-3 text-white" />
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

            <pre className="relative overflow-x-auto p-4 text-xs leading-relaxed text-white/70 sm:text-sm">
                <code>{code}</code>
            </pre>
        </div>
    );
}

export function Docs() {
    const [activeSection, setActiveSection] = useState("quick-start");
    const pageRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLElement>(null);
    const locomotiveRef = useRef<LocomotiveScroll | null>(null);

    useEffect(() => {
        const page = pageRef.current;
        if (!page) return;

        const locomotive = new LocomotiveScroll({
            lenisOptions: {
                lerp: 0.12,
                smoothWheel: true,
            },
        });

        locomotiveRef.current = locomotive;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".docs-hero",
                { opacity: 0, y: 24, filter: "blur(8px)" },
                {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    duration: 0.8,
                    ease: "power3.out",
                }
            );

            gsap.fromTo(
                ".docs-sidebar",
                { opacity: 0, x: -18 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.7,
                    delay: 0.15,
                    ease: "power3.out",
                }
            );

            gsap.fromTo(
                ".docs-section",
                { opacity: 0, y: 22 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.06,
                    delay: 0.2,
                    ease: "power3.out",
                }
            );
        }, page);

        return () => {
            ctx.revert();
            locomotive.destroy();
            locomotiveRef.current = null;
        };
    }, []);

    useEffect(() => {
        const page = pageRef.current;
        if (!page) return;

        const sections = Array.from(
            page.querySelectorAll<HTMLElement>("main section[id]")
        );

        let ticking = false;

        const updateActiveSection = () => {
            const anchor = window.innerHeight * 0.28;

            let current = sections[0]?.id ?? "quick-start";

            for (const section of sections) {
                const rect = section.getBoundingClientRect();

                if (rect.top <= anchor) {
                    current = section.id;
                } else {
                    break;
                }
            }

            setActiveSection((previous) =>
                previous === current ? previous : current
            );

            ticking = false;
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(updateActiveSection);
        };

        updateActiveSection();
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    useEffect(() => {
        const page = pageRef.current;
        if (!page) return;

        const cards = page.querySelectorAll<HTMLElement>(".docs-card");
        const navItems = page.querySelectorAll<HTMLElement>(".docs-nav-item");

        const cleanups: Array<() => void> = [];

        cards.forEach((card) => {
            const onMove = (event: MouseEvent) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
                card.style.setProperty("--my", `${event.clientY - rect.top}px`);
            };

            const onEnter = () => {
                gsap.to(card, {
                    y: -4,
                    duration: 0.3,
                    ease: "power3.out",
                    overwrite: "auto",
                });
            };

            const onLeave = () => {
                gsap.to(card, {
                    y: 0,
                    duration: 0.4,
                    ease: "power3.out",
                    overwrite: "auto",
                });
            };

            card.addEventListener("mousemove", onMove);
            card.addEventListener("mouseenter", onEnter);
            card.addEventListener("mouseleave", onLeave);

            cleanups.push(() => {
                card.removeEventListener("mousemove", onMove);
                card.removeEventListener("mouseenter", onEnter);
                card.removeEventListener("mouseleave", onLeave);
            });
        });

        navItems.forEach((item) => {
            const onEnter = () => {
                gsap.to(item, {
                    x: 3,
                    duration: 0.25,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            };

            const onLeave = () => {
                gsap.to(item, {
                    x: 0,
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            };

            item.addEventListener("mouseenter", onEnter);
            item.addEventListener("mouseleave", onLeave);

            cleanups.push(() => {
                item.removeEventListener("mouseenter", onEnter);
                item.removeEventListener("mouseleave", onLeave);
            });
        });

        return () => cleanups.forEach((cleanup) => cleanup());
    }, []);

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
        <div
            ref={pageRef}
            data-scroll-container
            className="relative min-h-screen overflow-x-clip bg-black text-white"
        >
            {/* Ambient grid + cursor-like light */}
            <div className="pointer-events-none fixed inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:72px_72px]" />
            <div className="pointer-events-none fixed left-1/2 top-[-20rem] -z-10 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[120px]" />
            <div className="pointer-events-none fixed bottom-[-20rem] right-[-10rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-white/[0.025] blur-[110px]" />

            <div className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
                {/* Docs Page Header */}
                <div
                    ref={heroRef}
                    data-scroll
                    data-scroll-speed="-0.08"
                    className="docs-hero relative mb-8 flex flex-col justify-between gap-5 overflow-hidden rounded-3xl border border-white/[0.10] bg-white/[0.025] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:flex-row sm:items-center sm:p-7"
                >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,0.08),transparent_34%)]" />
                    <div className="relative z-10 space-y-1">
                        <div className="flex items-center gap-2">
                            <BookOpen className="size-6 text-primary" />
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                FlagForge Developer Documentation
                            </h1>
                            <Badge variant="secondary" className="font-mono text-xs">
                                v1.0.0
                            </Badge>
                        </div>
                        <p className="text-sm text-white/45">
                            Comprehensive guide to integrating FlagForge feature flags, deterministic percentage rollouts, targeting rules, and SDKs into your backend applications.
                        </p>
                    </div>

                    <div className="relative z-10 flex shrink-0 items-center gap-2">
                        <Link to="/api-keys">
                            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl border-white/[0.12] bg-white/[0.03] text-xs text-white/70 hover:bg-white/[0.08] hover:text-white">
                                <Shield className="size-3.5" />
                                <span>Get API Keys</span>
                            </Button>
                        </Link>
                        <Link to="/dashboard">
                            <Button size="sm" className="gap-1.5 rounded-xl bg-white text-xs font-semibold text-black hover:bg-white">
                                <span>Open Console</span>
                                <ArrowRight className="size-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Layout Grid: Sidebar + Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
                    {/* Docs Sidebar Navigation */}
                    <aside
                        ref={sidebarRef}
                        className="docs-sidebar lg:sticky lg:top-24 lg:self-start lg:h-fit lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:col-span-3 space-y-1 rounded-2xl border border-white/[0.10] bg-white/[0.025] p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl"
                    >
                        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
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
                                        const target = document.getElementById(sec.id);
                                        if (!target) return;

                                        setActiveSection(sec.id);

                                        if (locomotiveRef.current) {
                                            locomotiveRef.current.scrollTo(target, {
                                                offset: -96,
                                                duration: 0,
                                            });
                                        } else {
                                            target.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            });
                                        }
                                    }}
                                    className={`docs-nav-item group relative flex w-full items-center justify-between overflow-hidden rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors duration-300 sm:text-sm ${isActive
                                        ? "bg-white/[0.09] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                                        : "text-white/45 hover:bg-white/[0.055] hover:text-white"
                                        }`}
                                >
                                    <span
                                        className={`absolute inset-y-2 left-0.5 w-0.5 rounded-full bg-white transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0"
                                            }`}
                                    />
                                    <div className="flex items-center gap-2.5">
                                        <Icon className={`size-4 shrink-0 transition-transform duration-300 ${isActive ? "text-white" : "text-white/35 group-hover:text-white/70 group-hover:translate-x-0.5"}`} />
                                        <span>{sec.title}</span>
                                    </div>
                                    <ChevronRight
                                        className={`size-3.5 transition-all duration-300 ${isActive
                                            ? "translate-x-0.5 text-white opacity-100"
                                            : "text-white/30 opacity-60 group-hover:text-white/70"
                                            }`}
                                    />
                                </button>
                            );
                        })}
                    </aside>

                    {/* Main Docs Content Stream */}
                    <main ref={contentRef} data-scroll-section className="lg:col-span-9 space-y-16">
                        {/* Section: Quick Start */}
                        <section id="quick-start" data-scroll
                            data-scroll-speed="0.02"
                            className="docs-section space-y-4 scroll-mt-24">
                            <div className="flex items-center gap-2 text-white/60 font-semibold text-xs uppercase tracking-wider">
                                <Sparkles className="size-4" />
                                <span>Getting Started</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
                                Quick Start
                            </h2>
                            <p className="text-sm text-white/45 leading-relaxed">
                                FlagForge decouples deployment from feature release. Initialize the client once in your application startup lifecycle and evaluate flags dynamically with deterministic bucketing.
                            </p>

                            <CodeBlock code={quickStartSnippet} language="typescript" />
                        </section>

                        {/* Section: Core Concepts */}
                        <section id="core-concepts" data-scroll
                            data-scroll-speed="0.02"
                            className="docs-section space-y-4 scroll-mt-24">
                            <div className="flex items-center gap-2 text-white/60 font-semibold text-xs uppercase tracking-wider">
                                <Layers className="size-4" />
                                <span>Architecture</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
                                Core Concepts
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Card className="docs-card relative overflow-hidden border-white/[0.10] bg-white/[0.025] shadow-[0_16px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-colors duration-500 hover:border-white/[0.18] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(220px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.08),transparent_70%)]">
                                    <CardContent className="relative z-10 space-y-1.5 p-4">
                                        <div className="flex items-center gap-2 text-white font-semibold text-sm">
                                            <Radio className="size-4 text-primary" />
                                            <span>Feature Flags</span>
                                        </div>
                                        <p className="text-xs text-white/45 leading-relaxed">
                                            Dynamic toggles identified by unique keys (e.g. <code className="font-mono text-white">new_checkout</code>) with master kill-switches and release rules.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="docs-card relative overflow-hidden border-white/[0.10] bg-white/[0.025] shadow-[0_16px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-colors duration-500 hover:border-white/[0.18] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(220px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.08),transparent_70%)]">
                                    <CardContent className="relative z-10 space-y-1.5 p-4">
                                        <div className="flex items-center gap-2 text-white font-semibold text-sm">
                                            <Sliders className="size-4 text-primary" />
                                            <span>Targeting Rules</span>
                                        </div>
                                        <p className="text-xs text-white/45 leading-relaxed">
                                            Attribute conditions (<code className="font-mono text-white">EQUALS</code>, <code className="font-mono text-white">NOT_EQUALS</code>) evaluated against runtime user context prior to percentage bucketing.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="docs-card relative overflow-hidden border-white/[0.10] bg-white/[0.025] shadow-[0_16px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-colors duration-500 hover:border-white/[0.18] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(220px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.08),transparent_70%)]">
                                    <CardContent className="relative z-10 space-y-1.5 p-4">
                                        <div className="flex items-center gap-2 text-white font-semibold text-sm">
                                            <Sparkles className="size-4 text-primary" />
                                            <span>Percentage Rollouts</span>
                                        </div>
                                        <p className="text-xs text-white/45 leading-relaxed">
                                            Deterministic hash bucketing (0–100%) computed against the supplied <code className="font-mono text-white">userId</code>, ensuring consistent user experience across sessions.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="docs-card relative overflow-hidden border-white/[0.10] bg-white/[0.025] shadow-[0_16px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-colors duration-500 hover:border-white/[0.18] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(220px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.08),transparent_70%)]">
                                    <CardContent className="relative z-10 space-y-1.5 p-4">
                                        <div className="flex items-center gap-2 text-white font-semibold text-sm">
                                            <Shield className="size-4 text-primary" />
                                            <span>Environment API Keys</span>
                                        </div>
                                        <p className="text-xs text-white/45 leading-relaxed">
                                            Read-only credentials scoped to specific deployment environments (Development, Staging, Production) for runtime evaluation isolation.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {/* Section: Installation */}
                        <section id="sdk-installation" data-scroll
                            data-scroll-speed="0.02"
                            className="docs-section space-y-4 scroll-mt-24">
                            <div className="flex items-center gap-2 text-white/60 font-semibold text-xs uppercase tracking-wider">
                                <Terminal className="size-4" />
                                <span>Package Manager</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
                                SDK Installation & Setup
                            </h2>
                            <p className="text-sm text-white/45">
                                Install the official TypeScript/Node.js SDK into your server, API gateway, or worker process.
                            </p>

                            <CodeBlock code={installSnippet} language="bash" />
                        </section>

                        {/* Section: SDK Methods */}
                        <section id="sdk-methods" data-scroll
                            data-scroll-speed="0.02"
                            className="docs-section space-y-4 scroll-mt-24">
                            <div className="flex items-center gap-2 text-white/60 font-semibold text-xs uppercase tracking-wider">
                                <Code2 className="size-4" />
                                <span>TypeScript SDK Reference</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
                                SDK Methods & Signatures
                            </h2>

                            <div className="space-y-3 text-sm text-white/45">
                                <div className="docs-card relative overflow-hidden rounded-2xl border border-white/[0.10] bg-white/[0.025] p-4 space-y-2 backdrop-blur-xl transition-all duration-500 hover:border-white/[0.18] hover:bg-white/[0.04] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(220px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.07),transparent_70%)]">
                                    <h4 className="font-mono font-semibold text-white text-sm">
                                        flagforge.evaluate(flagKey, user): Promise&lt;EvaluationResult&gt;
                                    </h4>
                                    <p className="text-xs text-white/45">
                                        Evaluates the given flag for a specific user and returns both the boolean verdict and the exact evaluation reason code.
                                    </p>
                                </div>

                                <div className="docs-card relative overflow-hidden rounded-2xl border border-white/[0.10] bg-white/[0.025] p-4 space-y-2 backdrop-blur-xl transition-all duration-500 hover:border-white/[0.18] hover:bg-white/[0.04] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(220px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.07),transparent_70%)]">
                                    <h4 className="font-mono font-semibold text-white text-sm">
                                        flagforge.isEnabled(flagKey, user): Promise&lt;boolean&gt;
                                    </h4>
                                    <p className="text-xs text-white/45">
                                        A convenient boolean wrapper for condition checks in business logic.
                                    </p>
                                </div>
                            </div>

                            <CodeBlock code={methodsSnippet} language="typescript" />
                        </section>

                        {/* Section: Targeting & Rollouts */}
                        <section
                            id="targeting-and-rollouts"
                            data-scroll
                            data-scroll-speed="0.02"
                            className="docs-section space-y-4 scroll-mt-24"
                        >
                            <div className="flex items-center gap-2 text-white/60 font-semibold text-xs uppercase tracking-wider">
                                <Sliders className="size-4" />
                                <span>Release Controls</span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
                                Targeting & Rollouts
                            </h2>

                            <p className="text-sm text-white/45 leading-relaxed">
                                Configure deterministic percentage rollouts and targeting rules to control
                                which users receive a feature without changing application code.
                            </p>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="docs-card relative overflow-hidden rounded-2xl border border-white/[0.10] bg-white/[0.025] p-4 space-y-2 backdrop-blur-xl transition-all duration-500 hover:border-white/[0.18] hover:bg-white/[0.04] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(220px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.07),transparent_70%)]">
                                    <h4 className="font-semibold text-white text-sm">
                                        Percentage Rollout
                                    </h4>
                                    <p className="text-xs text-white/45 leading-relaxed">
                                        Deterministically bucket users from 0–100% using their user ID,
                                        keeping users consistently assigned across evaluations.
                                    </p>
                                </div>

                                <div className="docs-card relative overflow-hidden rounded-2xl border border-white/[0.10] bg-white/[0.025] p-4 space-y-2 backdrop-blur-xl transition-all duration-500 hover:border-white/[0.18] hover:bg-white/[0.04] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(220px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.07),transparent_70%)]">
                                    <h4 className="font-semibold text-white text-sm">
                                        Targeting Rules
                                    </h4>
                                    <p className="text-xs text-white/45 leading-relaxed">
                                        Match runtime attributes such as country or plan before the
                                        evaluation engine applies percentage bucketing.
                                    </p>
                                </div>
                            </div>

                            <CodeBlock
                                code={`{
  "rolloutPercentage": 25,
  "targeting": {
    "country": "US",
    "plan": "enterprise"
  }
}`}
                                language="json"
                            />
                        </section>

                        {/* Section: Evaluation Reasons */}
                        <section id="evaluation-reasons" data-scroll
                            data-scroll-speed="0.02"
                            className="docs-section space-y-4 scroll-mt-24">
                            <div className="flex items-center gap-2 text-white/60 font-semibold text-xs uppercase tracking-wider">
                                <Radio className="size-4" />
                                <span>Evaluation Engine</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
                                Evaluation Reasons Reference
                            </h2>
                            <p className="text-sm text-white/45">
                                The evaluation engine returns a deterministic decision reason for every evaluation request:
                            </p>

                            <div className="docs-card overflow-hidden rounded-2xl border border-white/[0.10] bg-white/[0.025] divide-y divide-white/[0.06] backdrop-blur-xl">
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
                                    <div key={item.reason} className="group/row flex flex-col gap-3 p-4 transition-colors duration-300 hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <code className="font-mono text-xs font-bold text-white bg-white/[0.06] px-2 py-0.5 rounded">
                                                    {item.reason}
                                                </code>
                                            </div>
                                            <p className="text-xs text-white/45">{item.desc}</p>
                                        </div>
                                        <Badge variant={item.variant} className="text-xs shrink-0 self-start sm:self-auto font-mono">
                                            {item.result}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section: Raw HTTP API */}
                        <section id="runtime-api" data-scroll
                            data-scroll-speed="0.02"
                            className="docs-section space-y-4 scroll-mt-24">
                            <div className="flex items-center gap-2 text-white/60 font-semibold text-xs uppercase tracking-wider">
                                <Cpu className="size-4" />
                                <span>HTTP REST API</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
                                Raw Runtime Evaluation API
                            </h2>
                            <p className="text-sm text-white/45">
                                If you are not using Node.js/TypeScript (e.g., Python, Go, Rust, Ruby), call the runtime evaluation endpoint directly using the <code className="font-mono text-xs bg-white/[0.06] px-1.5 py-0.5 rounded text-white">X-FlagForge-Key</code> header:
                            </p>

                            <CodeBlock code={rawHttpSnippet} language="bash" />
                        </section>

                        {/* Section: Integration Examples */}
                        <section id="code-examples" data-scroll
                            data-scroll-speed="0.02"
                            className="docs-section space-y-4 scroll-mt-24">
                            <div className="flex items-center gap-2 text-white/60 font-semibold text-xs uppercase tracking-wider">
                                <FileCode className="size-4" />
                                <span>Practical Recipes</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
                                Integration Examples
                            </h2>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-white">Express.js Route Protection</h3>
                                <CodeBlock code={expressExample} language="typescript" />
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}