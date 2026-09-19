import { useEffect, useState } from "react";
import { Activity as ActivityIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
    getActivities,
    type Activity as ActivityRecord,
} from "@/lib/activity";

function formatAction(action: string) {
    return action.charAt(0) + action.slice(1).toLowerCase();
}

function formatEntity(entity: string) {
    return entity
        .toLowerCase()
        .split("_")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
}

function getActivityDescription(activity: ActivityRecord) {
    const metadata = activity.metadata;

    if (
        activity.entity === "FLAG_RULE" &&
        metadata &&
        typeof metadata.attribute === "string" &&
        typeof metadata.operator === "string" &&
        typeof metadata.value === "string"
    ) {
        return `${metadata.attribute} ${metadata.operator} ${metadata.value}`;
    }

    if (
        activity.entity === "FEATURE_FLAG" &&
        metadata &&
        typeof metadata.name === "string"
    ) {
        return metadata.name;
    }

    return `${formatEntity(activity.entity)} ${activity.entityId}`;
}

export function Activity() {
    const [activities, setActivities] = useState<
        ActivityRecord[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadActivities() {
            try {
                setLoading(true);
                setError("");

                const data = await getActivities();
                setActivities(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load activity"
                );
            } finally {
                setLoading(false);
            }
        }

        loadActivities();
    }, []);

    return (
        <main className="space-y-6 p-6">
            <div>
                <div className="flex items-center gap-3">
                    <ActivityIcon className="h-6 w-6" />

                    <h1 className="text-2xl font-semibold">
                        Activity
                    </h1>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                    Recent changes made in your FlagForge account.
                </p>
            </div>

            {error && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">
                            Loading activity...
                        </p>
                    </CardContent>
                </Card>
            ) : activities.length === 0 ? (
                <Card>
                    <CardContent className="flex min-h-40 items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            No activity yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center justify-between gap-4 px-6 py-4"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">
                                            {formatAction(activity.action)}{" "}
                                            {formatEntity(activity.entity)}
                                        </p>

                                        <p className="mt-1 truncate text-sm text-muted-foreground">
                                            {getActivityDescription(activity)}
                                        </p>
                                    </div>

                                    <time
                                        className="shrink-0 text-xs text-muted-foreground"
                                        dateTime={activity.createdAt}
                                    >
                                        {new Date(
                                            activity.createdAt
                                        ).toLocaleString()}
                                    </time>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </main>
    );
}