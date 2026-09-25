import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";
import {
    Activity as ActivityIcon,
    CheckCircle2,
    Clock,
    FolderKanban,
    History,
    Layers,
    Radio,
    Search,
    Sliders,
    Sparkles,
    XCircle,
} from "lucide-react";
import { gsap } from "gsap";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
import {
    getActivities,
    type Activity as ActivityRecord,
} from "@/lib/activity";

function formatAction(action: string) {
    return action.charAt(0) + action.slice(1).toLowerCase();
}

function getActionBadgeVariant(
    action: string
): "default" | "secondary" | "destructive" | "outline" {
    const act = action.toUpperCase();
    if (act.includes("CREATE")) return "default";
    if (act.includes("DELETE")) return "destructive";
    if (act.includes("UPDATE")) return "secondary";
    return "outline";
}

function getEntityIcon(entity: string) {
    switch (entity.toUpperCase()) {
        case "FEATURE_FLAG":
            return <Radio className="size-4 text-foreground" />;
        case "FLAG_RULE":
            return <Sliders className="size-4 text-foreground" />;
        case "ENVIRONMENT":
            return <Layers className="size-4 text-foreground" />;
        case "PROJECT":
            return <FolderKanban className="size-4 text-foreground" />;
        default:
            return <ActivityIcon className="size-4 text-muted-foreground" />;
    }
}

function getActivityDescription(activity: ActivityRecord) {
    const metadata = activity.metadata;

    if (activity.entity === "FLAG_RULE" && metadata) {
        const attr = typeof metadata.attribute === "string" ? metadata.attribute : "";
        const op = typeof metadata.operator === "string" ? metadata.operator : "";
        const val = typeof metadata.value === "string" ? metadata.value : "";
        if (attr) return `Rule: ${attr} ${op} "${val}"`;
    }

    if (activity.entity === "FEATURE_FLAG" && metadata) {
        const name = typeof metadata.name === "string" ? metadata.name : "";
        const key = typeof metadata.key === "string" ? metadata.key : "";
        if (name) return `${name} (${key || "key"})`;
    }

    if (activity.entity === "ENVIRONMENT" && metadata) {
        const name = typeof metadata.name === "string" ? metadata.name : "";
        if (name) return `Environment: ${name}`;
    }

    return `Resource ID: ${activity.entityId}`;
}

function getEntityLabel(entity: string) {
    return entity
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getActionTone(action: string) {
    const value = action.toUpperCase();
    if (value.includes("DELETE")) return "destructive";
    if (value.includes("CREATE")) return "create";
    if (value.includes("UPDATE")) return "update";
    return "neutral";
}

export function Activity() {
    const [activities, setActivities] = useState<ActivityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [entityFilter, setEntityFilter] = useState<string>("ALL");

    const pageRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadActivities() {
            try {
                setLoading(true);
                setError("");
                const data = await getActivities();
                setActivities(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load audit activity log"
                );
            } finally {
                setLoading(false);
            }
        }

        loadActivities();
    }, []);

    const filteredActivities = useMemo(() => {
        return activities.filter((act) => {
            const desc = getActivityDescription(act).toLowerCase();
            const actionStr = act.action.toLowerCase();
            const entityStr = act.entity.toLowerCase();
            const q = searchQuery.toLowerCase().trim();

            const matchesSearch =
                !q || desc.includes(q) || actionStr.includes(q) || entityStr.includes(q);

            if (!matchesSearch) return false;
            if (entityFilter !== "ALL" && act.entity !== entityFilter) return false;

            return true;
        });
    }, [activities, searchQuery, entityFilter]);

    const counts = useMemo(() => {
        const result: Record<string, number> = {
            ALL: activities.length,
            FEATURE_FLAG: 0,
            FLAG_RULE: 0,
            ENVIRONMENT: 0,
            PROJECT: 0,
        };

        activities.forEach((activity) => {
            if (result[activity.entity] !== undefined) {
                result[activity.entity] += 1;
            }
        });

        return result;
    }, [activities]);

    useLayoutEffect(() => {
        if (loading || !pageRef.current) return;

        const ctx = gsap.context(() => {
            const reduceMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            if (reduceMotion) {
                gsap.set("[data-activity-animate]", { opacity: 1, y: 0, x: 0 });
                return;
            }

            gsap.fromTo(
                "[data-activity-hero]",
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" }
            );

            gsap.fromTo(
                "[data-activity-toolbar]",
                { opacity: 0, y: 12 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.55,
                    delay: 0.12,
                    ease: "power3.out",
                }
            );

            gsap.fromTo(
                "[data-activity-list]",
                { opacity: 0, y: 18 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    delay: 0.2,
                    ease: "power3.out",
                }
            );

            gsap.fromTo(
                "[data-activity-row]",
                { opacity: 0, y: 12 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.45,
                    stagger: 0.055,
                    delay: 0.28,
                    ease: "power2.out",
                }
            );
        }, pageRef);

        return () => ctx.revert();
    }, [loading, filteredActivities.length]);

    useEffect(() => {
        if (!listRef.current || loading) return;

        const rows = Array.from(
            listRef.current.querySelectorAll<HTMLElement>("[data-activity-row]")
        );

        const cleanups = rows.map((row) => {
            const enter = () => {
                gsap.to(row, {
                    y: -2,
                    duration: 0.22,
                    ease: "power2.out",
                });
                gsap.to(row.querySelector("[data-activity-icon]"), {
                    scale: 1.08,
                    rotate: 2,
                    duration: 0.22,
                    ease: "power2.out",
                });
            };

            const leave = () => {
                gsap.to(row, {
                    y: 0,
                    duration: 0.28,
                    ease: "power2.out",
                });
                gsap.to(row.querySelector("[data-activity-icon]"), {
                    scale: 1,
                    rotate: 0,
                    duration: 0.28,
                    ease: "power2.out",
                });
            };

            row.addEventListener("mouseenter", enter);
            row.addEventListener("mouseleave", leave);

            return () => {
                row.removeEventListener("mouseenter", enter);
                row.removeEventListener("mouseleave", leave);
            };
        });

        return () => cleanups.forEach((cleanup) => cleanup());
    }, [loading, filteredActivities.length]);

    const filters = ["ALL", "FEATURE_FLAG", "FLAG_RULE", "ENVIRONMENT", "PROJECT"];

    useLocomotiveScroll();

    return (
        <div
            ref={pageRef}
            className="relative mx-auto w-full max-w-6xl overflow-hidden px-4 py-6 sm:px-6 md:px-8 md:py-8"
        >
            {/* Ambient page lighting */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-40 top-0 size-[28rem] rounded-full bg-white/[0.025] blur-[120px]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-40 top-40 size-[24rem] rounded-full bg-white/[0.018] blur-[110px]"
            />

            {/* Header */}
            <section data-activity-hero className="relative mb-7 opacity-0">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.025] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-foreground shadow-[0_0_12px_rgba(255,255,255,0.45)]" />
                        System history
                    </div>
                    <div className="rounded-full border border-white/[0.07] bg-white/[0.015] px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
                        {activities.length} records
                    </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                                <History className="size-5 text-foreground" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
                                Audit & Activity Log
                            </h1>
                        </div>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                            A chronological record of feature releases, targeting changes,
                            environment updates, and project activity.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5">
                            <ActivityIcon className="size-3.5" />
                            Live audit trail
                        </span>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.018] sm:grid-cols-4">
                    {[
                        ["Total events", counts.ALL],
                        ["Feature flags", counts.FEATURE_FLAG],
                        ["Rules", counts.FLAG_RULE],
                        ["Environments", counts.ENVIRONMENT],
                    ].map(([label, value], index) => (
                        <div
                            key={String(label)}
                            className={`group relative px-4 py-4 sm:px-5 ${index > 0 ? "border-l border-white/[0.07]" : ""
                                }`}
                        >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                {label}
                            </p>
                            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-foreground">
                                {String(value).padStart(2, "0")}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {error && (
                <div className="mb-5 flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="cursor-pointer text-xs underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Search + filters */}
            <section
                data-activity-toolbar
                className="relative mb-5 flex flex-col gap-3 opacity-0 lg:flex-row lg:items-center lg:justify-between"
            >
                <div className="group relative w-full lg:max-w-md">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                    <Input
                        placeholder="Search audit trail..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-xl border-white/[0.09] bg-white/[0.025] pl-10 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-all placeholder:text-muted-foreground/70 focus:border-white/[0.18] focus:bg-white/[0.035]"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.018] p-1.5">
                    {filters.map((type) => {
                        const active = entityFilter === type;
                        const count = counts[type] ?? 0;

                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setEntityFilter(type)}
                                className={`relative inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${active
                                        ? "bg-white text-black shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
                                        : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                                    }`}
                            >
                                <span>
                                    {type === "ALL"
                                        ? "All"
                                        : type
                                            .replace("_", " ")
                                            .toLowerCase()
                                            .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                                </span>
                                <span
                                    className={`font-mono text-[10px] ${active ? "text-black/55" : "text-muted-foreground/60"
                                        }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Activity stream */}
            <section data-activity-list ref={listRef} className="relative opacity-0">
                {loading ? (
                    <div className="space-y-3">
                        {[0, 1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-[88px] animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.018]"
                            />
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <Card className="border-dashed border-white/[0.1] bg-white/[0.018]">
                        <CardContent className="space-y-3 py-16 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                                <History className="size-5 text-muted-foreground" />
                            </div>
                            <h3 className="text-base font-semibold text-foreground">
                                No activity recorded yet
                            </h3>
                            <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
                                Creating flags, updating rollouts, and editing targeting rules
                                will automatically appear here.
                            </p>
                        </CardContent>
                    </Card>
                ) : filteredActivities.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.018] px-6 py-14 text-center">
                        <Search className="mx-auto size-7 text-muted-foreground/60" />
                        <p className="mt-3 text-sm font-medium text-foreground">
                            No matching activity
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Try a different search term or entity filter.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.018] shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
                        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 sm:px-5">
                            <div className="flex items-center gap-2">
                                <Sparkles className="size-3.5 text-muted-foreground" />
                                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Activity stream
                                </span>
                            </div>
                            <span className="font-mono text-[10px] text-muted-foreground">
                                {filteredActivities.length} shown
                            </span>
                        </div>

                        <div className="divide-y divide-white/[0.07]">
                            {filteredActivities.map((act) => {
                                const tone = getActionTone(act.action);
                                const isDelete = tone === "destructive";
                                const isCreate = tone === "create";

                                return (
                                    <div
                                        key={act.id}
                                        data-activity-row
                                        className="group relative flex flex-col gap-4 px-4 py-5 transition-colors duration-200 hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-5"
                                    >
                                        {/* hover sweep */}
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/0 transition-colors duration-200 group-hover:bg-white/50"
                                        />

                                        <div className="flex min-w-0 items-start gap-4">
                                            <div
                                                data-activity-icon
                                                className={`relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${isDelete
                                                        ? "border-red-500/20 bg-red-500/[0.06]"
                                                        : "border-white/[0.08] bg-white/[0.025] group-hover:border-white/[0.16] group-hover:bg-white/[0.05]"
                                                    }`}
                                            >
                                                {getEntityIcon(act.entity)}
                                                <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-white/60 opacity-0 shadow-[0_0_8px_rgba(255,255,255,0.7)] transition-opacity duration-200 group-hover:opacity-100" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant={getActionBadgeVariant(act.action)}
                                                        className={`border text-[10px] uppercase tracking-[0.08em] ${isDelete
                                                                ? "border-red-500/20"
                                                                : "border-white/[0.08]"
                                                            }`}
                                                    >
                                                        {formatAction(act.action)}
                                                    </Badge>
                                                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
                                                        {getEntityLabel(act.entity)}
                                                    </span>
                                                    {isCreate && (
                                                        <CheckCircle2 className="size-3 text-muted-foreground/70" />
                                                    )}
                                                    {isDelete && (
                                                        <XCircle className="size-3 text-red-400/80" />
                                                    )}
                                                </div>

                                                <p className="mt-2 truncate font-mono text-sm font-medium text-foreground/90">
                                                    {getActivityDescription(act)}
                                                </p>

                                                <p className="mt-1 text-[11px] text-muted-foreground">
                                                    {act.entityId}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2 pl-14 text-xs text-muted-foreground sm:pl-0">
                                            <Clock className="size-3.5" />
                                            <time
                                                dateTime={act.createdAt}
                                                title={new Date(act.createdAt).toISOString()}
                                            >
                                                {new Date(act.createdAt).toLocaleString()}
                                            </time>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
