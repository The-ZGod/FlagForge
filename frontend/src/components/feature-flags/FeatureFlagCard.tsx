import { Check, Copy, ChevronRight, Layers, Sliders } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { FeatureFlag } from "@/lib/feature-flags";
import type { FlagRule } from "@/lib/flag-rules";

interface FeatureFlagCardProps {
    flag: FeatureFlag;
    rules: FlagRule[];
    projectId: string;
    environmentId: string;
    onToggle: (flag: FeatureFlag) => void;
    onDelete?: (flagId: string) => void;
}

export function FeatureFlagCard({
    flag,
    rules,
    projectId,
    environmentId,
    onToggle,
}: FeatureFlagCardProps) {
    const [copied, setCopied] = useState(false);

    function handleCopyKey(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(flag.key);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    const flagUrl = `/projects/${projectId}/environments/${environmentId}/flags/${flag.id}`;

    return (
        <div className="group relative rounded-xl border border-border/80 bg-card p-4 sm:p-5 transition-all hover:border-border hover:shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Flag Information & Title */}
                <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <Link
                            to={flagUrl}
                            className="font-semibold text-foreground text-sm sm:text-base hover:text-primary transition-colors truncate focus:outline-hidden"
                        >
                            {flag.name}
                        </Link>

                        <Badge
                            variant={flag.enabled ? "default" : "secondary"}
                            className="text-[10px] font-semibold uppercase tracking-wider h-4 px-1.5"
                        >
                            {flag.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <button
                            type="button"
                            onClick={handleCopyKey}
                            className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title="Click to copy key"
                        >
                            <span>{flag.key}</span>
                            {copied ? (
                                <Check className="size-2.5 text-green-600" />
                            ) : (
                                <Copy className="size-2.5 text-muted-foreground" />
                            )}
                        </button>

                        <span>•</span>
                        <span className="text-[11px]">
                            Created {new Date(flag.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Right: Metrics & Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                    {/* Targeting Rules Metric */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-md border border-border/40">
                        <Layers className="size-3.5 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                            {rules.length} {rules.length === 1 ? "rule" : "rules"}
                        </span>
                    </div>

                    {/* Rollout Percentage Metric */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-md border border-border/40">
                        <Sliders className="size-3.5 text-muted-foreground" />
                        <span className="font-medium font-mono text-foreground">
                            {flag.rolloutPercentage}%
                        </span>
                    </div>

                    {/* Quick Toggle Switch */}
                    <div className="flex items-center gap-1.5">
                        <Switch
                            checked={flag.enabled}
                            onCheckedChange={() => onToggle(flag)}
                            aria-label={`Toggle ${flag.name}`}
                        />
                    </div>

                    {/* Go to workspace arrow */}
                    <Link
                        to={flagUrl}
                        className="inline-flex size-7 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Open flag workspace"
                    >
                        <ChevronRight className="size-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}