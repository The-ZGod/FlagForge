import { useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Play } from "lucide-react";

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

import {
    evaluateFlag,
    type EvaluationResult,
} from "@/lib/evaluation";

export function EvaluationPlayground() {
    const { environmentId } = useParams();

    const [flagKey, setFlagKey] = useState("new_checkout");
    const [userId, setUserId] = useState("user-123");

    const [country, setCountry] = useState("IN");
    const [plan, setPlan] = useState("premium");

    const [result, setResult] =
        useState<EvaluationResult | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleEvaluate(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!environmentId) {
            setError("Environment ID is missing");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setResult(null);

            const evaluation = await evaluateFlag({
                environmentId,
                flagKey,
                userId,
                attributes: {
                    country,
                    plan,
                },
            });

            setResult(evaluation);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Evaluation failed"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    Evaluation Playground
                </h1>

                <p className="text-sm text-muted-foreground">
                    Test feature flag evaluation for different users
                    and attributes.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Evaluate Feature Flag</CardTitle>

                    <CardDescription>
                        Send a real evaluation request to the FlagForge
                        evaluation engine.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleEvaluate}
                        className="space-y-6"
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="flag-key">
                                    Flag Key
                                </Label>

                                <Input
                                    id="flag-key"
                                    value={flagKey}
                                    onChange={(event) =>
                                        setFlagKey(event.target.value)
                                    }
                                    placeholder="new_checkout"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user-id">
                                    User ID
                                </Label>

                                <Input
                                    id="user-id"
                                    value={userId}
                                    onChange={(event) =>
                                        setUserId(event.target.value)
                                    }
                                    placeholder="user-123"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <p className="mb-3 text-sm font-medium">
                                User Attributes
                            </p>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="country">
                                        Country
                                    </Label>

                                    <Input
                                        id="country"
                                        value={country}
                                        onChange={(event) =>
                                            setCountry(event.target.value)
                                        }
                                        placeholder="IN"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="plan">
                                        Plan
                                    </Label>

                                    <Input
                                        id="plan"
                                        value={plan}
                                        onChange={(event) =>
                                            setPlan(event.target.value)
                                        }
                                        placeholder="premium"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading}>
                            <Play className="mr-2 h-4 w-4" />

                            {loading
                                ? "Evaluating..."
                                : "Evaluate Flag"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                    </CardContent>
                </Card>
            )}

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Evaluation Result</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="flex items-center gap-3">
                            {result.enabled ? (
                                <CheckCircle2 className="h-6 w-6" />
                            ) : (
                                <XCircle className="h-6 w-6" />
                            )}

                            <div>
                                <p className="text-lg font-semibold">
                                    {result.enabled
                                        ? "ENABLED"
                                        : "DISABLED"}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    Reason: {result.reason}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </main>
    );
}