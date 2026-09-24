import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import gsap from "gsap";
import {
    Activity,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Gauge,
    ChevronDown,
    Play,
    Plus,
    Sparkles,
    Trash2,
    XCircle,
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

import {
    evaluateFlag,
    getEvaluationMetrics,
    type EvaluationMetrics,
    type EvaluationResult,
    type UserAttributes,
} from "@/lib/evaluation";
import { getFeatureFlags, type FeatureFlag } from "@/lib/feature-flags";
import { getEnvironments, type Environment } from "@/lib/environments";
import { getProjects, type Project } from "@/lib/projects";

const REASON_MAP: Record<string, { label: string; desc: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    FULL_ROLLOUT: {
        label: "100% Full Rollout",
        desc: "Flag is fully enabled without restrictions.",
        variant: "default",
    },
    PERCENTAGE_ROLLOUT: {
        label: "Percentage Rollout Match",
        desc: "User ID was deterministically bucketed within percentage threshold.",
        variant: "default",
    },
    PERCENTAGE_ROLLOUT_EXCLUDED: {
        label: "Percentage Rollout Excluded",
        desc: "User ID fell outside of the active percentage rollout threshold.",
        variant: "secondary",
    },
    TARGETING_RULE_NOT_MATCHED: {
        label: "Targeting Rules Failed",
        desc: "User attributes did not satisfy required targeting conditions.",
        variant: "secondary",
    },
    FLAG_DISABLED: {
        label: "Flag Disabled",
        desc: "Master flag kill-switch is set to Disabled in this environment.",
        variant: "destructive",
    },
    FLAG_NOT_FOUND: {
        label: "Flag Not Found",
        desc: "No active flag matching this key exists in the environment.",
        variant: "destructive",
    },
};

type ThemeSelectOption = {
    value: string;
    label: string;
};

function ThemeSelect({
    id,
    value,
    onChange,
    options,
    disabled = false,
    mono = false,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    options: ThemeSelectOption[];
    disabled?: boolean;
    mono?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const selected = options.find((option) => option.value === value);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    // Small, fast motion keeps the custom dropdown feeling responsive without
    // turning the control into a distracting animation.
    useEffect(() => {
        if (!open || !menuRef.current) return;
        const menu = menuRef.current;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                menu,
                { opacity: 0, y: -6, scale: 0.985, filter: "blur(4px)" },
                { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.22, ease: "power3.out" }
            );

            gsap.fromTo(
                menu.querySelectorAll(".theme-select-option"),
                { opacity: 0, y: -3 },
                { opacity: 1, y: 0, duration: 0.18, stagger: 0.025, ease: "power2.out", delay: 0.035 }
            );
        }, menuRef);

        return () => ctx.revert();
    }, [open]);

    return (
        <div ref={rootRef} className="relative" id={id}>
            <button
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
                className={[
                    "group flex h-11 w-full items-center justify-between gap-3 rounded-xl",
                    "border border-white/[0.08] bg-black/35 px-3.5 text-left text-sm text-foreground",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] outline-none",
                    "transition-all duration-200",
                    "hover:-translate-y-px hover:border-white/[0.15] hover:bg-white/[0.035] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
                    "active:translate-y-0 active:scale-[0.995]",
                    "focus-visible:border-white/[0.22] focus-visible:ring-2 focus-visible:ring-white/[0.08]",
                    open ? "border-white/[0.18] bg-white/[0.045] shadow-[0_10px_30px_rgba(0,0,0,0.22)]" : "",
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                ].join(" ")}
            >
                <span className={`min-w-0 truncate ${mono ? "font-mono" : ""}`}>
                    {selected?.label ?? "Select an option"}
                </span>

                <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180 text-white" : ""
                        }`}
                />
            </button>

            {open && !disabled && (
                <div
                    ref={menuRef}
                    role="listbox"
                    aria-labelledby={id}
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-xl border border-white/[0.11] bg-[#0b0b0b]/[0.98] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.025)] backdrop-blur-2xl"
                >
                    <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                    {options.map((option) => {
                        const isSelected = option.value === value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className={[
                                    "theme-select-option relative flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm",
                                    "transition-all duration-150 hover:translate-x-0.5",
                                    isSelected
                                        ? "bg-white text-black shadow-[0_4px_18px_rgba(255,255,255,0.08)]"
                                        : "text-muted-foreground hover:bg-white/[0.07] hover:text-white",
                                ].join(" ")}
                            >
                                <span className={`truncate ${mono ? "font-mono" : ""}`}>
                                    {option.label}
                                </span>

                                {isSelected && (
                                    <span className="ml-3 size-1.5 shrink-0 rounded-full bg-black animate-pulse" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


export function EvaluationPlayground() {
    const params = useParams();
    const routeProjectId = params.projectId;
    const routeEnvironmentId = params.environmentId;

    const [projects, setProjects] = useState<Project[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [selectedEnvId, setSelectedEnvId] = useState<string>("");

    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [flagKey, setFlagKey] = useState("");
    const [userId, setUserId] = useState("user-tester-42");
    const [attributes, setAttributes] = useState<Array<{ key: string; value: string }>>([
        { key: "country", value: "US" },
        { key: "plan", value: "pro" },
    ]);

    const [result, setResult] = useState<EvaluationResult | null>(null);
    const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);

    const [loading, setLoading] = useState(false);
    const [metricsLoading, setMetricsLoading] = useState(true);
    const [error, setError] = useState("");
    const [latency, setLatency] = useState<number | null>(null);

    // Initial load of projects and environments
    useEffect(() => {
        async function loadContext() {
            try {
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
                console.error("Failed to load evaluation context", err);
            }
        }

        loadContext();
    }, [routeProjectId, routeEnvironmentId]);

    // Load flags and metrics when selected environment changes
    useEffect(() => {
        if (!selectedEnvId) {
            setFlags([]);
            setMetrics(null);
            return;
        }

        async function loadEnvData() {
            try {
                const [flagList, metricsData] = await Promise.all([
                    getFeatureFlags(selectedEnvId),
                    getEvaluationMetrics(selectedEnvId).catch(() => null),
                ]);

                setFlags(flagList);
                if (flagList.length > 0) {
                    setFlagKey((prev) => (flagList.some((f) => f.key === prev) ? prev : flagList[0].key));
                } else {
                    setFlagKey("");
                }

                setMetrics(metricsData);
            } catch (err) {
                console.error("Failed to load environment flags or metrics", err);
            } finally {
                setMetricsLoading(false);
            }
        }

        setMetricsLoading(true);
        loadEnvData();
    }, [selectedEnvId]);

    async function handleProjectChange(projId: string) {
        setSelectedProjectId(projId);
        setResult(null);
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

    async function handleEvaluate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selectedEnvId || !flagKey.trim() || !userId.trim()) return;

        try {
            setLoading(true);
            setError("");
            setResult(null);

            const attrsObj: UserAttributes = {};
            attributes.forEach((attr) => {
                if (attr.key.trim() && attr.value.trim()) {
                    attrsObj[attr.key.trim()] = attr.value.trim();
                }
            });

            const start = performance.now();
            const evaluation = await evaluateFlag({
                environmentId: selectedEnvId,
                flagKey: flagKey.trim(),
                userId: userId.trim(),
                attributes: attrsObj,
            });
            const end = performance.now();
            setLatency(Math.round(end - start));
            setResult(evaluation);

            // Refresh metrics in background
            getEvaluationMetrics(selectedEnvId).then(setMetrics).catch(() => { });
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Evaluation request failed"
            );
        } finally {
            setLoading(false);
        }
    }

    function addAttributeRow() {
        setAttributes((prev) => [...prev, { key: "", value: "" }]);
    }

    function removeAttributeRow(index: number) {
        setAttributes((prev) => prev.filter((_, i) => i !== index));
    }

    function updateAttributeRow(index: number, key: string, value: string) {
        setAttributes((prev) =>
            prev.map((item, i) => (i === index ? { key, value } : item))
        );
    }

    const currentProject = projects.find((p) => p.id === selectedProjectId);
    const currentEnvironment = environments.find((e) => e.id === selectedEnvId);


    const pageRef = useRef<HTMLDivElement>(null);
    const formCardRef = useRef<HTMLDivElement>(null);
    const resultCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pageRef.current) return;

        const ctx = gsap.context(() => {
            const intro = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            intro
                .fromTo(
                    ".eval-back",
                    { y: 10, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.45 }
                )
                .fromTo(
                    ".eval-hero",
                    { y: 22, opacity: 0, filter: "blur(8px)" },
                    { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.7 },
                    "-=0.25"
                )
                .fromTo(
                    ".eval-main-card",
                    { y: 28, opacity: 0, scale: 0.985 },
                    { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1 },
                    "-=0.35"
                )
                .fromTo(
                    ".eval-metric",
                    { y: 18, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
                    "-=0.35"
                )
                .fromTo(
                    ".eval-breakdown",
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.55 },
                    "-=0.25"
                );

            gsap.to(".hero-orb", {
                y: -12,
                x: 8,
                duration: 4.5,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
            });

            gsap.to(".hero-sweep", {
                xPercent: 120,
                duration: 5,
                ease: "none",
                repeat: -1,
                repeatDelay: 3,
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (!result || !resultCardRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                resultCardRef.current,
                { scale: 0.97, opacity: 0.5, y: 12 },
                {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    duration: 0.55,
                    ease: "back.out(1.5)",
                }
            );

            gsap.fromTo(
                ".decision-icon",
                { scale: 0.5, rotate: -12, opacity: 0 },
                {
                    scale: 1,
                    rotate: 0,
                    opacity: 1,
                    duration: 0.65,
                    ease: "back.out(2)",
                }
            );
        }, resultCardRef);

        return () => ctx.revert();
    }, [result]);

    return (
        <div
            ref={pageRef}
            className="relative min-h-full overflow-hidden bg-[#050505] text-foreground"
        >
            {/* Ambient cinematic background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="hero-orb absolute -left-32 top-24 size-[30rem] rounded-full bg-white/[0.025] blur-[110px]" />
                <div className="absolute right-[-14rem] top-[22rem] size-[34rem] rounded-full bg-white/[0.018] blur-[130px]" />
                <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.07),transparent_62%)]" />
                <div className="hero-sweep absolute -left-1/3 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-60" />
                <div className="absolute inset-x-0 top-0 h-px bg-white/[0.09]" />
            </div>

            <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                {/* Navigation */}
                {selectedProjectId && selectedEnvId && (
                    <Link
                        to={`/projects/${selectedProjectId}/environments/${selectedEnvId}`}
                        className="eval-back group mb-5 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <span className="flex size-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] transition-transform duration-300 group-hover:-translate-x-1">
                            <ArrowLeft className="size-3.5" />
                        </span>
                        Back to feature flags
                    </Link>
                )}

                {/* Hero */}
                <section className="eval-hero relative mb-7 overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.025] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-7">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.035),transparent_35%,transparent_70%,rgba(255,255,255,0.02))]" />
                    <div className="pointer-events-none absolute right-8 top-[-7rem] size-56 rounded-full border border-white/[0.05] bg-white/[0.025] blur-2xl" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    <span className="size-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                                    Runtime evaluation
                                </span>
                                {currentEnvironment && (
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-white/[0.1] bg-black/25 px-3 py-1.5 font-mono text-[10px] text-foreground"
                                    >
                                        {currentProject?.name} / {currentEnvironment.name}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                    <Sparkles className="size-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                                        Evaluation Playground
                                    </h1>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        Test exactly how FlagForge decides whether a user receives a feature.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-2 sm:grid-cols-3">
                                {[
                                    ["01", "Choose", "Flag + environment"],
                                    ["02", "Identify", "User + attributes"],
                                    ["03", "Evaluate", "See the decision"],
                                ].map(([number, title, desc]) => (
                                    <div
                                        key={number}
                                        className="group rounded-xl border border-white/[0.07] bg-black/20 px-3.5 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.13] hover:bg-white/[0.025] hover:shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[10px] text-muted-foreground">{number}</span>
                                            <span className="text-xs font-semibold text-foreground">{title}</span>
                                        </div>
                                        <p className="mt-1 text-[11px] text-muted-foreground">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="mb-5 flex items-center justify-between rounded-2xl border border-destructive/25 bg-destructive/[0.08] px-4 py-3 text-sm text-destructive">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="cursor-pointer text-xs underline underline-offset-4"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Main workspace */}
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
                    {/* Configuration */}
                    <div ref={formCardRef} className="eval-main-card">
                        <Card className="h-full overflow-hidden rounded-3xl border-white/[0.09] bg-white/[0.025] shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                            <CardHeader className="border-b border-white/[0.07] bg-white/[0.015] px-5 py-5 sm:px-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                                                <Gauge className="size-4 text-white" />
                                            </div>
                                            <CardTitle className="text-base font-semibold">Evaluation inputs</CardTitle>
                                        </div>
                                        <CardDescription className="mt-2 text-xs leading-5">
                                            Configure the request you want to send to the evaluation engine.
                                        </CardDescription>
                                    </div>
                                    <span className="hidden rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-muted-foreground sm:inline-flex">
                                        LIVE ENGINE
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="px-5 py-5 sm:px-6">
                                <form onSubmit={handleEvaluate} className="space-y-6">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="eval-proj-select" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                01 · Project
                                            </Label>
                                            <ThemeSelect
                                                id="eval-proj-select"
                                                value={selectedProjectId}
                                                onChange={handleProjectChange}
                                                options={projects.map((p) => ({
                                                    value: p.id,
                                                    label: p.name,
                                                }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="eval-env-select" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                02 · Environment
                                            </Label>
                                            <ThemeSelect
                                                id="eval-env-select"
                                                value={selectedEnvId}
                                                onChange={setSelectedEnvId}
                                                disabled={environments.length === 0}
                                                options={
                                                    environments.length === 0
                                                        ? [{ value: "", label: "No environments found" }]
                                                        : environments.map((e) => ({
                                                            value: e.id,
                                                            label: `${e.name} (${e.key})`,
                                                        }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="flag-key-select" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                            03 · Feature flag
                                        </Label>
                                        {flags.length > 0 ? (
                                            <ThemeSelect
                                                id="flag-key-select"
                                                value={flagKey}
                                                onChange={setFlagKey}
                                                mono
                                                options={flags.map((f) => ({
                                                    value: f.key,
                                                    label: `${f.name} (${f.key})`,
                                                }))}
                                            />
                                        ) : (
                                            <Input
                                                id="flag-key-select"
                                                value={flagKey}
                                                onChange={(e) => setFlagKey(e.target.value)}
                                                placeholder="e.g. new_checkout_experience"
                                                className="h-11 rounded-xl border-white/[0.08] bg-black/30 font-mono text-sm"
                                                required
                                            />
                                        )}
                                    </div>

                                    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <div>
                                                <Label htmlFor="playground-user-id" className="text-sm font-semibold">
                                                    04 · User identity
                                                </Label>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    This ID is used for deterministic percentage bucketing.
                                                </p>
                                            </div>
                                            <span className="hidden rounded-md border border-white/[0.08] px-2 py-1 font-mono text-[10px] text-muted-foreground sm:inline-flex">
                                                MURMUR3
                                            </span>
                                        </div>
                                        <Input
                                            id="playground-user-id"
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            placeholder="e.g. user_84920"
                                            className="h-11 rounded-xl border-white/[0.08] bg-white/[0.025] font-mono text-sm"
                                            required
                                        />
                                        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                                            The evaluation engine computes a deterministic Murmur3 hash against this User ID.
                                        </p>
                                    </div>

                                    <div className="border-t border-white/[0.07] pt-5">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <div>
                                                <Label className="text-sm font-semibold">05 · User attributes</Label>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Add context used by targeting rules.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="xs"
                                                onClick={addAttributeRow}
                                                className="h-8 gap-1.5 rounded-lg border-white/[0.08] bg-white/[0.025] px-2.5 text-xs hover:bg-white/[0.06]"
                                            >
                                                <Plus className="size-3.5" />
                                                Add
                                            </Button>
                                        </div>

                                        <div className="space-y-2.5">
                                            {attributes.map((attr, index) => (
                                                <div key={index} className="group flex items-center gap-2 rounded-xl border border-transparent p-1 transition-all duration-200 hover:border-white/[0.06] hover:bg-white/[0.015]">
                                                    <Input
                                                        placeholder="Key · country"
                                                        value={attr.key}
                                                        onChange={(e) => updateAttributeRow(index, e.target.value, attr.value)}
                                                        className="h-10 flex-1 rounded-lg border-white/[0.08] bg-black/30 font-mono text-xs sm:text-sm"
                                                    />
                                                    <Input
                                                        placeholder="Value · US"
                                                        value={attr.value}
                                                        onChange={(e) => updateAttributeRow(index, attr.key, e.target.value)}
                                                        className="h-10 flex-1 rounded-lg border-white/[0.08] bg-black/30 font-mono text-xs sm:text-sm"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() => removeAttributeRow(index)}
                                                        className="text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-destructive"
                                                        aria-label={`Remove attribute ${index + 1}`}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading || !flagKey.trim() || !userId.trim() || !selectedEnvId}
                                        className="group relative h-12 w-full overflow-hidden rounded-xl bg-white text-sm font-semibold text-black shadow-[0_10px_35px_rgba(255,255,255,0.1)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_45px_rgba(255,255,255,0.17)] disabled:opacity-50"
                                    >
                                        <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-black/10 transition-transform duration-700 group-hover:translate-x-[430%]" />
                                        <span className="relative flex items-center justify-center gap-2">
                                            <Play className={`size-4 fill-current transition-transform duration-200 ${loading ? "animate-pulse scale-90" : "group-hover:translate-x-0.5"}`} />
                                            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                                                {loading ? "Evaluating..." : "Evaluate Flag"}
                                            </span>
                                        </span>
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Decision */}
                    <div ref={resultCardRef} className="eval-main-card">
                        <Card className="h-full min-h-[560px] overflow-hidden rounded-3xl border-white/[0.09] bg-white/[0.025] shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                            <CardHeader className="border-b border-white/[0.07] bg-white/[0.015] px-5 py-5 sm:px-6">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                                                <Sparkles className="size-4 text-white" />
                                            </div>
                                            <CardTitle className="text-base font-semibold">Evaluation result</CardTitle>
                                        </div>
                                        <CardDescription className="mt-2 text-xs">
                                            {result ? `Decision computed for ${userId}.` : "Run an evaluation to see the decision."}
                                        </CardDescription>
                                    </div>
                                    <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] ${result ? "border-white/[0.1] bg-white/[0.04] text-foreground" : "border-white/[0.07] text-muted-foreground"}`}>
                                        {result ? "COMPLETED" : "READY"}
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="flex min-h-[470px] flex-col justify-center px-5 py-8 sm:px-7">
                                {!result ? (
                                    <div className="text-center">
                                        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.025] shadow-[0_0_50px_rgba(255,255,255,0.035)]">
                                            <Gauge className="size-9 text-muted-foreground/70" />
                                        </div>
                                        <p className="mt-6 text-lg font-semibold text-foreground">Ready to evaluate</p>
                                        <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-muted-foreground">
                                            Configure the inputs on the left, then run the evaluation to see exactly why the flag was enabled or disabled.
                                        </p>
                                        <div className="mx-auto mt-6 max-w-xs rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3 text-left">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Flow</p>
                                            <p className="mt-1 font-mono text-xs text-foreground">
                                                inputs → rules → rollout → decision
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <div
                                            className={`relative overflow-hidden rounded-2xl border p-5 ${result.enabled
                                                ? "border-white/[0.16] bg-white/[0.055]"
                                                : "border-white/[0.08] bg-black/20"
                                                }`}
                                        >
                                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                                            <div className="flex items-center gap-4">
                                                <div className="decision-icon flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.045] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
                                                    {result.enabled ? (
                                                        <CheckCircle2 className="size-7 text-white" />
                                                    ) : (
                                                        <XCircle className="size-7 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Decision</p>
                                                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                                                        {result.enabled ? "ENABLED" : "DISABLED"}
                                                    </p>
                                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                                        Flag: <code className="font-mono text-foreground">{flagKey}</code>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3.5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.025]">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-xs font-medium text-muted-foreground">Why this decision?</span>
                                                    <Badge
                                                        variant={REASON_MAP[result.reason]?.variant || "secondary"}
                                                        className="font-mono text-[10px] font-semibold"
                                                    >
                                                        {REASON_MAP[result.reason]?.label || result.reason}
                                                    </Badge>
                                                </div>
                                                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                                                    {REASON_MAP[result.reason]?.desc || "Evaluated by engine."}
                                                </p>
                                            </div>

                                            {latency !== null && (
                                                <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-black/20 p-3.5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.025]">
                                                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Clock className="size-3.5" />
                                                        Engine latency
                                                    </span>
                                                    <span className="font-mono text-sm font-semibold text-foreground">
                                                        {latency} ms
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Metrics */}
                <section className="mt-10 border-t border-white/[0.07] pt-8">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Activity className="size-5 text-white" />
                                <h2 className="text-lg font-semibold tracking-tight">Environment health</h2>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Runtime statistics from evaluations in this environment.
                            </p>
                        </div>
                        {metrics && (
                            <span className="hidden rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
                                LIVE METRICS
                            </span>
                        )}
                    </div>

                    {metricsLoading && !metrics ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <Skeleton key={item} className="h-28 rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
                            ))}
                        </div>
                    ) : metrics ? (
                        <div className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { label: "Total evaluations", value: metrics.totalEvaluations, icon: Activity },
                                    { label: "Enabled results", value: metrics.enabledEvaluations, icon: CheckCircle2 },
                                    { label: "Disabled results", value: metrics.disabledEvaluations, icon: XCircle },
                                    { label: "Average latency", value: metrics.averageLatencyMs, icon: Clock, suffix: " ms" },
                                ].map((metric) => {
                                    const Icon = metric.icon;
                                    return (
                                        <Card
                                            key={metric.label}
                                            className="eval-metric group relative overflow-hidden rounded-2xl border-white/[0.08] bg-white/[0.025] shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.04]"
                                        >
                                            <div className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-white/[0.035] blur-2xl transition-transform duration-500 group-hover:scale-150" />
                                            <CardContent className="relative p-5">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                                                        {metric.label}
                                                    </p>
                                                    <Icon className="size-4 text-muted-foreground/60" />
                                                </div>
                                                <p className="mt-4 font-mono text-3xl font-semibold tracking-[-0.04em] text-foreground">
                                                    {metric.value}
                                                    {metric.suffix ?? ""}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <Card className="eval-breakdown overflow-hidden rounded-3xl border-white/[0.08] bg-white/[0.025] shadow-none">
                                <CardHeader className="border-b border-white/[0.07] bg-white/[0.015] px-5 py-5">
                                    <CardTitle className="text-sm font-semibold">Why evaluations resolve the way they do</CardTitle>
                                    <CardDescription className="text-xs">
                                        A cumulative breakdown of evaluation outcomes in this environment.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-5">
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {Object.entries(metrics.reasons).map(([key, count]) => (
                                            <div
                                                key={key}
                                                className="group flex min-h-[82px] items-center justify-between rounded-2xl border border-white/[0.07] bg-black/20 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.13] hover:bg-white/[0.025]"
                                            >
                                                <div className="min-w-0 pr-3">
                                                    <p className="truncate text-xs font-semibold text-foreground">
                                                        {REASON_MAP[key]?.label || key}
                                                    </p>
                                                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                                                        {key}
                                                    </p>
                                                </div>
                                                <span className="font-mono text-xl font-semibold text-foreground">
                                                    {count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Card className="rounded-2xl border-white/[0.08] bg-white/[0.025] shadow-none">
                            <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                No evaluation metrics recorded yet in this environment.
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        </div>
    );
}
