import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio } from "lucide-react";

import { login, register } from "@/lib/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function Login() {
    const navigate = useNavigate();

    // Mode: login or register
    const [authMode, setAuthMode] = useState<"login" | "register">("login");

    // Login state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register state
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");

    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setLoading(true);

        try {
            await login(loginEmail.trim(), loginPassword);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Authentication failed"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setLoading(true);

        try {
            await register(regEmail.trim(), regPassword, regName.trim());
            // After register, automatically log in
            await login(regEmail.trim(), regPassword);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 bg-radial from-muted/50 to-transparent pointer-events-none -z-10" />

            {/* Brand Header */}
            <div className="mb-6 flex flex-col items-center text-center space-y-2">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <Radio className="size-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    FlagForge
                </h1>
                <p className="text-xs text-muted-foreground max-w-xs">
                    Feature flags, percentage rollouts & targeting experimentation platform.
                </p>
            </div>

            <Card className="w-full max-w-md shadow-xl border-border/80">
                <CardHeader className="pb-3 text-center">
                    <CardTitle className="text-lg font-semibold">
                        {authMode === "login" ? "Sign In to FlagForge" : "Create Developer Account"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {authMode === "login"
                            ? "Enter your credentials to access the console"
                            : "Set up a new developer workspace"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Tabs
                        value={authMode}
                        onValueChange={(v) => {
                            setAuthMode(v as "login" | "register");
                            setError("");
                            setSuccessMsg("");
                        }}
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login" className="text-xs">
                                Sign In
                            </TabsTrigger>
                            <TabsTrigger value="register" className="text-xs">
                                Register
                            </TabsTrigger>
                        </TabsList>

                        {error && (
                            <Alert variant="destructive" className="mt-4 py-2.5 text-xs">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {successMsg && (
                            <div className="mt-4 rounded-md border border-green-500/30 bg-green-500/10 p-2.5 text-xs text-green-700 dark:text-green-400">
                                {successMsg}
                            </div>
                        )}

                        {/* Sign In Form */}
                        <TabsContent value="login" className="space-y-4 pt-2">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="login-email" className="text-xs font-medium">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="dev@example.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className="text-xs"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="login-password" className="text-xs font-medium">
                                        Password
                                    </Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="text-xs"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full text-xs font-semibold h-9"
                                    disabled={loading}
                                >
                                    {loading ? "Signing in..." : "Sign In to Dashboard"}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Register Form */}
                        <TabsContent value="register" className="space-y-4 pt-2">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="reg-name" className="text-xs font-medium">
                                        Full Name
                                    </Label>
                                    <Input
                                        id="reg-name"
                                        type="text"
                                        placeholder="Ada Lovelace"
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        className="text-xs"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="reg-email" className="text-xs font-medium">
                                        Work Email
                                    </Label>
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        placeholder="ada@company.dev"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        className="text-xs"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="reg-password" className="text-xs font-medium">
                                        Password
                                    </Label>
                                    <Input
                                        id="reg-password"
                                        type="password"
                                        placeholder="At least 6 characters"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        className="text-xs"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full text-xs font-semibold h-9"
                                    disabled={loading}
                                >
                                    {loading ? "Creating Account..." : "Create Free Account"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}