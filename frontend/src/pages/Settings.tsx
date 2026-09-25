import { useLayoutEffect, useRef } from "react";
import { getCurrentUser } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";
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
import {
    User,
    Mail,
    ShieldCheck,
    Sparkles,
    Settings2,
} from "lucide-react";
import { gsap } from "gsap";

export function Settings() {
    const user = getCurrentUser();
    const { theme } = useTheme();

    const pageRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!pageRef.current) return;

        const ctx = gsap.context(() => {
            const reduceMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            if (reduceMotion) {
                gsap.set(
                    [
                        "[data-settings='header']",
                        "[data-settings='profile']",
                        "[data-settings='appearance']",
                        "[data-settings='theme-card']",
                    ],
                    { opacity: 1, y: 0, scale: 1 }
                );
                return;
            }

            gsap.fromTo(
                "[data-settings='ambient']",
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1.2,
                    ease: "power2.out",
                }
            );

            gsap.fromTo(
                "[data-settings='header']",
                { opacity: 0, y: 18 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.65,
                    ease: "power3.out",
                }
            );

            gsap.fromTo(
                "[data-settings='section']",
                { opacity: 0, y: 26 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.12,
                    delay: 0.12,
                    ease: "power3.out",
                }
            );

            gsap.fromTo(
                "[data-settings='theme-card']",
                { opacity: 0, y: 14, scale: 0.98 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.55,
                    stagger: 0.1,
                    delay: 0.35,
                    ease: "power3.out",
                }
            );

            gsap.to("[data-settings='ambient']", {
                x: 18,
                y: 12,
                duration: 5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    useLocomotiveScroll();

    return (
        <div
            ref={pageRef}
            className="relative min-h-full overflow-hidden p-4 sm:p-6 md:p-8"
        >
            {/* Ambient monochrome lighting */}
            <div
                data-settings="ambient"
                className="pointer-events-none absolute -right-40 top-16 size-[32rem] rounded-full bg-white/[0.025] blur-[120px]"
            />
            <div className="pointer-events-none absolute left-1/3 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

            <div className="relative mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div data-settings="header" className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <span className="flex size-6 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025]">
                            <Settings2 className="size-3.5" />
                        </span>
                        Workspace Settings
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
                                Account & Preferences
                            </h1>
                            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">
                                Manage your developer profile and customize how the FlagForge console feels.
                            </p>
                        </div>

                        <Badge
                            variant="outline"
                            className="w-fit gap-1.5 border-white/[0.10] bg-white/[0.025] px-3 py-1.5 text-xs font-mono"
                        >
                            <Sparkles className="size-3.5" />
                            {theme === "dark" ? "Dark workspace" : "Light workspace"}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-5">
                    {/* Profile */}
                    <Card
                        data-settings="section"
                        className="group relative overflow-hidden border-white/[0.10] bg-white/[0.018] shadow-[0_24px_80px_rgba(0,0,0,0.24)] transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.025]"
                    >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.22] to-transparent" />

                        <CardHeader className="pb-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035]">
                                            <User className="size-4 text-foreground" />
                                        </div>
                                        <CardTitle className="text-lg font-semibold">
                                            Personal Information
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="mt-1 text-xs sm:text-sm">
                                        Your verified credentials on FlagForge.
                                    </CardDescription>
                                </div>

                                <Badge
                                    variant="outline"
                                    className="w-fit gap-1.5 border-emerald-500/30 bg-emerald-500/[0.07] text-xs text-emerald-400"
                                >
                                    <span className="relative flex size-2">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                                        <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                                    </span>
                                    <ShieldCheck className="size-3.5" />
                                    Active Developer
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-center">
                                <div className="group/avatar relative">
                                    <div className="absolute -inset-1 rounded-[1.15rem] bg-white/[0.08] opacity-0 blur-md transition-opacity duration-300 group-hover/avatar:opacity-100" />
                                    <div className="relative flex size-16 items-center justify-center rounded-2xl border border-white/[0.12] bg-white text-xl font-bold text-black shadow-[0_12px_40px_rgba(255,255,255,0.08)] transition-transform duration-300 group-hover/avatar:scale-[1.03]">
                                        {user?.name
                                            ? user.name.charAt(0).toUpperCase()
                                            : user?.email
                                                ? user.email.charAt(0).toUpperCase()
                                                : "U"}
                                    </div>
                                </div>

                                <div className="min-w-0">
                                    <p className="text-base font-bold text-foreground">
                                        {user?.name || "FlagForge Developer"}
                                    </p>
                                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                                        {user?.email || "developer@flagforge.dev"}
                                    </p>
                                    <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
                                        Verified account
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="profile-name"
                                        className="flex items-center gap-1.5 text-sm font-medium"
                                    >
                                        <User className="size-3.5 text-muted-foreground" />
                                        Full Name
                                    </Label>
                                    <Input
                                        id="profile-name"
                                        readOnly
                                        value={user?.name || "FlagForge Developer"}
                                        className="h-10 border-white/[0.09] bg-black/30 text-sm font-medium transition-all focus:border-white/[0.2] focus:ring-1 focus:ring-white/[0.08]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="profile-email"
                                        className="flex items-center gap-1.5 text-sm font-medium"
                                    >
                                        <Mail className="size-3.5 text-muted-foreground" />
                                        Email Address
                                    </Label>
                                    <Input
                                        id="profile-email"
                                        readOnly
                                        value={user?.email || "developer@flagforge.dev"}
                                        className="h-10 border-white/[0.09] bg-black/30 font-mono text-sm transition-all focus:border-white/[0.2] focus:ring-1 focus:ring-white/[0.08]"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
