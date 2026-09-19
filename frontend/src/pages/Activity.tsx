import { useEffect, useState, useMemo } from "react";
import {
    Activity as ActivityIcon,
    Clock,
    FolderKanban,
    History,
    Layers,
    Radio,
    Search,
    Sliders,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    getActivities,
    type Activity as ActivityRecord,
} from "@/lib/activity";

function formatAction(action: string) {
    return action.charAt(0) + action.slice(1).toLowerCase();
}

function getActionBadgeVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
    const act = action.toUpperCase();
    if (act.includes("CREATE")) return "default";
    if (act.includes("DELETE")) return "destructive";
    if (act.includes("UPDATE")) return "secondary";
    return "outline";
}

function getEntityIcon(entity: string) {
    switch (entity.toUpperCase()) {
        case "FEATURE_FLAG":
            return <Radio className="size-3.5 text-primary" />;
        case "FLAG_RULE":
            return <Sliders className="size-3.5 text-blue-500" />;
        case "ENVIRONMENT":
            return <Layers className="size-3.5 text-amber-500" />;
        case "PROJECT":
            return <FolderKanban className="size-3.5 text-purple-500" />;
        default:
            return <ActivityIcon className="size-3.5 text-muted-foreground" />;
    }
}

function getActivityDescription(activity: ActivityRecord) {
    const metadata = activity.metadata;

    if (activity.entity === "FLAG_RULE" && metadata) {
        const attr = typeof metadata.attribute === "string" ? metadata.attribute : "";
        const op = typeof metadata.operator === "string" ? metadata.operator : "";
        const val = typeof metadata.value === "string" ? metadata.value : "";
        if (attr) {
            return `Rule: ${attr} ${op} "${val}"`;
        }
    }

    if (activity.entity === "FEATURE_FLAG" && metadata) {
        const name = typeof metadata.name === "string" ? metadata.name : "";
        const key = typeof metadata.key === "string" ? metadata.key : "";
        if (name) {
            return `${name} (${key || "key"})`;
        }
    }

    if (activity.entity === "ENVIRONMENT" && metadata) {
        const name = typeof metadata.name === "string" ? metadata.name : "";
        if (name) return `Environment: ${name}`;
    }

    return `ID: ${activity.entityId}`;
}

export function Activity() {
    const [activities, setActivities] = useState<ActivityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [entityFilter, setEntityFilter] = useState<string>("ALL");

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
            const q = searchQuery.toLowerCase();

            const matchesSearch =
                desc.includes(q) || actionStr.includes(q) || entityStr.includes(q);

            if (!matchesSearch) return false;

            if (entityFilter !== "ALL" && act.entity !== entityFilter) {
                return false;
            }

            return true;
        });
    }, [activities, searchQuery, entityFilter]);

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2.5">
                    <History className="size-5 text-foreground" />
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        Audit & Activity Log
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Immutable history of feature flag releases, targeting rule modifications, and environment changes.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive flex items-center justify-between">
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

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search audit trail..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 text-xs h-8.5 bg-card"
                    />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto bg-muted/40 p-1 rounded-lg border border-border/60">
                    {["ALL", "FEATURE_FLAG", "FLAG_RULE", "ENVIRONMENT", "PROJECT"].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setEntityFilter(type)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                                entityFilter === type
                                    ? "bg-card text-foreground shadow-2xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {type === "ALL"
                                ? "All"
                                : type.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity Stream */}
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : activities.length === 0 ? (
                <Card className="border-dashed border-border/80 bg-muted/20">
                    <CardContent className="py-12 text-center space-y-2">
                        <History className="size-8 text-muted-foreground mx-auto opacity-40" />
                        <h3 className="text-sm font-semibold text-foreground">No Activity Recorded Yet</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Actions like creating flags, updating rollouts, and editing targeting rules will appear here automatically.
                        </p>
                    </CardContent>
                </Card>
            ) : filteredActivities.length === 0 ? (
                <Card className="bg-muted/10">
                    <CardContent className="py-8 text-center text-xs text-muted-foreground">
                        No activity records matched your filter.
                    </CardContent>
                </Card>
            ) : (
                <Card className="shadow-2xs overflow-hidden">
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/60">
                            {filteredActivities.map((act) => (
                                <div
                                    key={act.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/80 mt-0.5">
                                            {getEntityIcon(act.entity)}
                                        </div>

                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap text-xs">
                                                <Badge
                                                    variant={getActionBadgeVariant(act.action)}
                                                    className="text-[10px] uppercase font-mono px-1.5 py-0 h-4"
                                                >
                                                    {formatAction(act.action)}
                                                </Badge>
                                                <span className="font-semibold text-foreground">
                                                    {act.entity.replace("_", " ")}
                                                </span>
                                            </div>

                                            <p className="text-xs text-muted-foreground font-mono truncate">
                                                {getActivityDescription(act)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 shrink-0 self-start sm:self-center">
                                        <Clock className="size-3" />
                                        <time dateTime={act.createdAt} title={new Date(act.createdAt).toISOString()}>
                                            {new Date(act.createdAt).toLocaleString()}
                                        </time>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}