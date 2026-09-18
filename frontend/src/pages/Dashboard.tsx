import {
    Badge,
} from "@/components/ui/badge";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

export function Dashboard() {
    return (
        <div className="space-y-8 p-6 md:p-8">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                    Dashboard
                </h2>

                <p className="text-sm text-muted-foreground">
                    Manage your feature flags and environments.
                </p>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">
                            Projects
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-3xl font-semibold">1</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">
                            Environments
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-3xl font-semibold">1</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">
                            Feature Flags
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-3xl font-semibold">1</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>New Checkout</CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                new_checkout
                            </p>
                        </div>

                        <Badge>Enabled</Badge>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Rollout
                            </p>

                            <p className="mt-1 text-2xl font-semibold">
                                100%
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Targeting
                            </p>

                            <p className="mt-1 text-sm font-medium">
                                country EQUALS IN
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}