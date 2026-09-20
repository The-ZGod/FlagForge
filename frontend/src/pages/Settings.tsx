import { getCurrentUser } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
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
import { User, Mail, ShieldCheck, Moon, Sun } from "lucide-react";

export function Settings() {
    const user = getCurrentUser();
    const { theme, setTheme } = useTheme();

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Account & Preferences
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your developer profile and application theme settings.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Profile Card */}
                <Card className="shadow-xs">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Your verified credentials on FlagForge.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs text-green-600 border-green-500/30 bg-green-500/10 gap-1">
                                <ShieldCheck className="size-3" />
                                <span>Active Developer</span>
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="flex items-center gap-4 pb-4 border-b border-border/60">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-xs">
                                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-base font-bold text-foreground">
                                    {user?.name || "FlagForge Developer"}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                    {user?.email || "developer@flagforge.dev"}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="profile-name" className="text-sm font-medium flex items-center gap-1.5">
                                    <User className="size-3.5 text-muted-foreground" />
                                    <span>Full Name</span>
                                </Label>
                                <Input
                                    id="profile-name"
                                    readOnly
                                    value={user?.name || "FlagForge Developer"}
                                    className="text-sm bg-muted/40 font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profile-email" className="text-sm font-medium flex items-center gap-1.5">
                                    <Mail className="size-3.5 text-muted-foreground" />
                                    <span>Email Address</span>
                                </Label>
                                <Input
                                    id="profile-email"
                                    readOnly
                                    value={user?.email || "developer@flagforge.dev"}
                                    className="text-sm bg-muted/40 font-mono"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Theme & Appearance Card */}
                <Card className="shadow-xs">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">Appearance & Theme</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Customize your console display theme. Defaults to Dark Mode.
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-xs font-mono capitalize">
                                {theme} Mode Active
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* Dark Mode Option */}
                            <button
                                type="button"
                                onClick={() => setTheme("dark")}
                                className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                    theme === "dark"
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-border/80 bg-card hover:bg-muted/50"
                                }`}
                            >
                                <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-100 shrink-0 border border-zinc-700 shadow-xs">
                                    <Moon className="size-4.5" />
                                </div>
                                <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-foreground">Dark Mode</p>
                                        {theme === "dark" && (
                                            <Badge variant="default" className="text-[10px] h-4 px-1.5">
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        High contrast charcoal surfaces tailored for developer workflows. (Default)
                                    </p>
                                </div>
                            </button>

                            {/* Light Mode Option */}
                            <button
                                type="button"
                                onClick={() => setTheme("light")}
                                className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                    theme === "light"
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-border/80 bg-card hover:bg-muted/50"
                                }`}
                            >
                                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shrink-0 border border-amber-200 shadow-xs">
                                    <Sun className="size-4.5" />
                                </div>
                                <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-foreground">Light Mode</p>
                                        {theme === "light" && (
                                            <Badge variant="default" className="text-[10px] h-4 px-1.5">
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Clean bright palette for high-ambient lighting environments.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}