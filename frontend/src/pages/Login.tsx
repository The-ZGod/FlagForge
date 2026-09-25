import { useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { gsap } from "gsap";
import { login, register } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";

export function Login() {
    const navigate = useNavigate();
    const pageRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [authMode, setAuthMode] = useState<"login" | "register">("login");
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); setError(""); setSuccessMsg(""); setLoading(true);
        try { await login(loginEmail.trim(), loginPassword); navigate("/dashboard"); }
        catch (err) { setError(err instanceof Error ? err.message : "Authentication failed"); }
        finally { setLoading(false); }
    }

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); setError(""); setSuccessMsg(""); setLoading(true);
        try { await register(regEmail.trim(), regPassword, regName.trim()); await login(regEmail.trim(), regPassword); navigate("/dashboard"); }
        catch (err) { setError(err instanceof Error ? err.message : "Registration failed"); }
        finally { setLoading(false); }
    }

    useLayoutEffect(() => {
        if (!pageRef.current) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) return;
        const ctx = gsap.context(() => {
            gsap.fromTo("[data-login='back']", { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: .55, ease: "power3.out" });
            gsap.fromTo("[data-login='brand']", { opacity: 0, y: 24, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .75, delay: .08, ease: "power3.out" });
            gsap.fromTo("[data-login='card']", { opacity: 0, y: 30, scale: .985 }, { opacity: 1, y: 0, scale: 1, duration: .8, delay: .18, ease: "power3.out" });
            gsap.fromTo("[data-login='feature']", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .45, stagger: .08, delay: .45, ease: "power2.out" });
            gsap.fromTo("[data-login='orb']", { opacity: 0, scale: .72 }, { opacity: 1, scale: 1, duration: 1.25, ease: "power2.out" });
            gsap.to("[data-login='orb']", { x: 22, y: 14, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" });
        }, pageRef);
        return () => ctx.revert();
    }, []);

    useLayoutEffect(() => {
        if (!cardRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const ctx = gsap.context(() => {
            gsap.fromTo("[data-login='form']", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .35, ease: "power3.out" });
        }, cardRef);
        return () => ctx.revert();
    }, [authMode]);

    const switchMode = (mode: "login" | "register") => {
        setAuthMode(mode); setError(""); setSuccessMsg("");
    };

    useLocomotiveScroll();

    return (
        <div ref={pageRef} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4 py-8 text-white sm:px-6 sm:py-12">
            <div data-login="orb" className="pointer-events-none absolute left-1/2 top-[30%] size-[30rem] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[120px]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.055),transparent_32%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.16]" />

            <Link data-login="back" to="/" className="group absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-white/55 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white sm:left-7 sm:top-7">
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" /> Back to Home
            </Link>

            <main className="relative z-10 w-full max-w-[470px]">
                <div data-login="brand" className="mb-7 flex flex-col items-center text-center">
                    <Link to="/" className="group relative mb-5 block" aria-label="FlagForge home">
                        <div className="absolute -inset-5 rounded-[2rem] bg-white/[0.035] blur-2xl transition-opacity group-hover:opacity-100" />
                        <div className="relative flex h-14 w-[210px] items-center justify-center overflow-hidden rounded-2xl border border-white/[0.10] bg-black/65 px-4 shadow-[0_20px_70px_rgba(0,0,0,.5)] backdrop-blur-xl transition-all duration-500 group-hover:border-white/[0.18] group-hover:bg-white/[0.035]">
                            <img src="/flagforge-logo.png" alt="FlagForge — Feature Platform" className="h-auto max-h-10 w-full object-contain transition-transform duration-500 group-hover:scale-[1.025]" />
                        </div>
                    </Link>
                    <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-white/45">
                        <span className="size-1.5 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,.45)]" /> Developer Console
                    </div>
                    <h1 className="mt-3 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">{authMode === "login" ? "Welcome back." : "Build your workspace."}</h1>
                    <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/45 sm:text-sm">{authMode === "login" ? "Sign in to manage feature flags, releases, targeting and runtime evaluation." : "Create a FlagForge workspace and start shipping controlled releases."}</p>
                </div>

                <Card ref={cardRef} data-login="card" className="relative overflow-hidden border-white/[0.11] bg-white/[0.025] shadow-[0_30px_110px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    <CardHeader className="relative px-5 pb-4 pt-6 text-center sm:px-7 sm:pt-7">
                        <div className="mx-auto mb-3 flex size-9 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.04]">{authMode === "login" ? <LockKeyhole className="size-4 text-white/75" /> : <Sparkles className="size-4 text-white/75" />}</div>
                        <CardTitle className="text-lg font-bold tracking-[-0.02em]">{authMode === "login" ? "Sign In to Developer Console" : "Create Developer Account"}</CardTitle>
                        <CardDescription className="mt-1 text-xs text-white/45 sm:text-sm">{authMode === "login" ? "Enter your credentials to access your environments." : "Set up a new workspace for your team."}</CardDescription>
                    </CardHeader>

                    <CardContent className="relative px-5 pb-6 sm:px-7 sm:pb-7">
                        <Tabs value={authMode} onValueChange={(v) => switchMode(v as "login" | "register")}>
                            <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl border border-white/[0.07] bg-black/40 p-1">
                                <TabsTrigger value="login" className="h-full rounded-lg text-xs font-semibold text-white/45 transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-[0_5px_20px_rgba(255,255,255,.10)] sm:text-sm">Sign In</TabsTrigger>
                                <TabsTrigger value="register" className="h-full rounded-lg text-xs font-semibold text-white/45 transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-[0_5px_20px_rgba(255,255,255,.10)] sm:text-sm">Register</TabsTrigger>
                            </TabsList>

                            {error && <Alert variant="destructive" className="mt-4 border-red-500/25 bg-red-500/[0.07] py-2.5 text-xs"><AlertDescription>{error}</AlertDescription></Alert>}
                            {successMsg && <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] p-3 text-xs text-emerald-300"><Check className="size-3.5" />{successMsg}</div>}

                            <TabsContent value="login" className="mt-0 pt-5 focus-visible:outline-none">
                                <div data-login="form"><form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2"><Label htmlFor="login-email" className="flex items-center gap-1.5 text-xs font-semibold text-white/75"><Mail className="size-3.5 text-white/40" />Email Address</Label><Input id="login-email" type="email" placeholder="dev@company.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="h-11 border-white/[0.09] bg-black/35 text-sm text-white placeholder:text-white/25 transition-all focus:border-white/[0.22] focus:bg-white/[0.035] focus:ring-2 focus:ring-white/[0.06]" required autoFocus /></div>
                                    <div className="space-y-2"><Label htmlFor="login-password" className="flex items-center gap-1.5 text-xs font-semibold text-white/75"><LockKeyhole className="size-3.5 text-white/40" />Password</Label><div className="relative"><Input id="login-password" type={showLoginPassword ? "text" : "password"} placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="h-11 border-white/[0.09] bg-black/35 pr-11 text-sm text-white placeholder:text-white/25 transition-all focus:border-white/[0.22] focus:bg-white/[0.035] focus:ring-2 focus:ring-white/[0.06]" required /><button type="button" onClick={() => setShowLoginPassword((v) => !v)} className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.05] hover:text-white" aria-label="Toggle password visibility">{showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>
                                    <Button type="submit" className="group mt-1 h-11 w-full gap-2 bg-white text-sm font-bold text-black shadow-[0_12px_35px_rgba(255,255,255,.08)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_45px_rgba(255,255,255,.13)]" disabled={loading}>{loading ? <><span className="size-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />Signing in...</> : <>Sign In to Dashboard<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>}</Button>
                                </form></div>
                            </TabsContent>

                            <TabsContent value="register" className="mt-0 pt-5 focus-visible:outline-none">
                                <div data-login="form"><form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2"><Label htmlFor="reg-name" className="flex items-center gap-1.5 text-xs font-semibold text-white/75"><UserRound className="size-3.5 text-white/40" />Full Name</Label><Input id="reg-name" type="text" placeholder="Ada Lovelace" value={regName} onChange={(e) => setRegName(e.target.value)} className="h-11 border-white/[0.09] bg-black/35 text-sm text-white placeholder:text-white/25 transition-all focus:border-white/[0.22] focus:bg-white/[0.035] focus:ring-2 focus:ring-white/[0.06]" required autoFocus /></div>
                                    <div className="space-y-2"><Label htmlFor="reg-email" className="flex items-center gap-1.5 text-xs font-semibold text-white/75"><Mail className="size-3.5 text-white/40" />Work Email</Label><Input id="reg-email" type="email" placeholder="ada@company.dev" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="h-11 border-white/[0.09] bg-black/35 text-sm text-white placeholder:text-white/25 transition-all focus:border-white/[0.22] focus:bg-white/[0.035] focus:ring-2 focus:ring-white/[0.06]" required /></div>
                                    <div className="space-y-2"><Label htmlFor="reg-password" className="flex items-center gap-1.5 text-xs font-semibold text-white/75"><LockKeyhole className="size-3.5 text-white/40" />Password</Label><div className="relative"><Input id="reg-password" type={showRegPassword ? "text" : "password"} placeholder="At least 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="h-11 border-white/[0.09] bg-black/35 pr-11 text-sm text-white placeholder:text-white/25 transition-all focus:border-white/[0.22] focus:bg-white/[0.035] focus:ring-2 focus:ring-white/[0.06]" required /><button type="button" onClick={() => setShowRegPassword((v) => !v)} className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.05] hover:text-white" aria-label="Toggle password visibility">{showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>
                                    <Button type="submit" className="group mt-1 h-11 w-full gap-2 bg-white text-sm font-bold text-black shadow-[0_12px_35px_rgba(255,255,255,.08)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_45px_rgba(255,255,255,.13)]" disabled={loading}>{loading ? <><span className="size-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />Creating Account...</> : <>Create Free Account<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>}</Button>
                                </form></div>
                            </TabsContent>
                        </Tabs>

                        <div data-login="feature" className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-white/[0.07] pt-4 text-[10px] text-white/30"><ShieldCheck className="size-3.5" />Secure workspace access<span className="size-1 rounded-full bg-white/20" />Feature flag controls<span className="size-1 rounded-full bg-white/20" />Runtime evaluation</div>
                    </CardContent>
                </Card>

                <div data-login="feature" className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/25"><span className="size-1.5 rounded-full bg-emerald-400/70 shadow-[0_0_8px_rgba(52,211,153,.35)]" />FlagForge runtime online</div>
            </main>
        </div>
    );
}
