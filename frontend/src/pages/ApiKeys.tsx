import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Check,
    ChevronDown,
    Copy,
    Info,
    KeyRound,
    Lock,
    RefreshCw,
    Shield,
    Terminal,
} from "lucide-react";
import { gsap } from "gsap";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjects, type Project } from "@/lib/projects";
import { getEnvironments, type Environment } from "@/lib/environments";
import { generateEnvironmentApiKey } from "@/lib/api-keys";

type SelectOption = {
    value: string;
    label: string;
    meta?: string;
};

function PremiumSelect({
    label,
    value,
    options,
    onChange,
    disabled = false,
}: {
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const selected = options.find((option) => option.value === value);

    useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useLayoutEffect(() => {
        if (!open || !menuRef.current) return;
        const menu = menuRef.current;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                menu,
                { opacity: 0, y: -6, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power2.out" },
            );
            gsap.fromTo(
                menu.querySelectorAll("[data-option]"),
                { opacity: 0, y: -4 },
                { opacity: 1, y: 0, duration: 0.16, stagger: 0.025, ease: "power2.out", delay: 0.03 },
            );
        }, ref);
        return () => ctx.revert();
    }, [open]);

    return (
        <div ref={ref} className="relative space-y-2">
            <Label className="text-sm font-medium text-foreground">{label}</Label>
            <button
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
                className={`group flex h-11 w-full items-center justify-between rounded-xl border px-3.5 text-left text-sm transition-all duration-200 ${open
                        ? "border-white/25 bg-white/[0.07] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_14px_40px_rgba(0,0,0,0.3)]"
                        : "border-white/[0.09] bg-white/[0.025] hover:border-white/[0.16] hover:bg-white/[0.045]"
                    } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
                <span className="min-w-0 truncate">
                    <span className="block truncate text-foreground">{selected?.label ?? "Select an option"}</span>
                    {selected?.meta && <span className="block truncate font-mono text-[10px] text-muted-foreground">{selected.meta}</span>}
                </span>
                <ChevronDown className={`ml-3 size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180 text-foreground" : ""}`} />
            </button>

            {open && !disabled && (
                <div
                    ref={menuRef}
                    role="listbox"
                    className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/[0.11] bg-[#0b0b0b]/95 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                >
                    <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                data-option
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/[0.07]"
                            >
                                <span className="min-w-0">
                                    <span className="block truncate text-sm text-foreground">{option.label}</span>
                                    {option.meta && <span className="block truncate font-mono text-[10px] text-muted-foreground">{option.meta}</span>}
                                </span>
                                {isSelected && <Check className="ml-3 size-4 shrink-0 text-foreground" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function ApiKeys() {
    const params = useParams();
    const routeProjectId = params.projectId;
    const routeEnvironmentId = params.environmentId;
    const pageRef = useRef<HTMLDivElement>(null);

    const [projects, setProjects] = useState<Project[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [selectedEnvId, setSelectedEnvId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedSnippet, setCopiedSnippet] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadInitialData() {
            try {
                setLoading(true);
                setError("");
                const projectList = await getProjects();
                setProjects(projectList);

                if (projectList.length > 0) {
                    const targetProjId =
                        routeProjectId && projectList.some((p) => p.id === routeProjectId)
                            ? routeProjectId
                            : projectList[0].id;
                    setSelectedProjectId(targetProjId);

                    const envList = await getEnvironments(targetProjId);
                    setEnvironments(envList);

                    if (envList.length > 0) {
                        const targetEnvId =
                            routeEnvironmentId && envList.some((e) => e.id === routeEnvironmentId)
                                ? routeEnvironmentId
                                : envList[0].id;
                        setSelectedEnvId(targetEnvId);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load projects and environments");
            } finally {
                setLoading(false);
            }
        }

        loadInitialData();
    }, [routeProjectId, routeEnvironmentId]);

    async function handleProjectChange(projId: string) {
        setSelectedProjectId(projId);
        setGeneratedKey(null);
        try {
            const envList = await getEnvironments(projId);
            setEnvironments(envList);
            if (envList.length > 0) {
                setSelectedEnvId(envList[0].id);
            } else {
                setSelectedEnvId("");
            }
        } catch (err) {
            console.error("Failed to load environments for project", err);
        }
    }

    async function handleGenerateKey() {
        if (!selectedEnvId) return;

        try {
            setGenerating(true);
            setError("");
            setCopiedKey(false);
            const result = await generateEnvironmentApiKey(selectedEnvId);
            setGeneratedKey(result.apiKey);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate environment API key");
        } finally {
            setGenerating(false);
        }
    }

    function handleCopyKey() {
        if (!generatedKey) return;
        navigator.clipboard.writeText(generatedKey);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    }

    const currentProject = projects.find((p) => p.id === selectedProjectId);
    const currentEnvironment = environments.find((e) => e.id === selectedEnvId);

    const codeSnippet = `import { FlagForge } from "@flagforge/sdk";

// Initialize the FlagForge SDK client with your environment runtime key
const flagforge = new FlagForge({
  apiUrl: "${window.location.origin}",
  apiKey: "${generatedKey || "ff_live_YOUR_ENVIRONMENT_KEY"}"
});

// Evaluate a flag for a user
const result = await flagforge.evaluate("new_checkout_experience", {
  userId: "user_84920",
  attributes: {
    country: "US",
    plan: "enterprise"
  }
});

if (result.enabled) {
  // Feature is enabled for this user cohort
} else {
  // Flag disabled or targeting condition failed (${"result.reason"})
}`;

    function handleCopySnippet() {
        navigator.clipboard.writeText(codeSnippet);
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2000);
    }

    useLayoutEffect(() => {
        if (!pageRef.current || loading) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                "[data-api-hero]",
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
            );
            gsap.fromTo(
                "[data-api-section]",
                { opacity: 0, y: 22 },
                { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, delay: 0.08, ease: "power3.out" },
            );
            gsap.fromTo(
                "[data-api-stat]",
                { opacity: 0, y: 10, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, delay: 0.2, ease: "back.out(1.5)" },
            );
        }, pageRef);

        return () => ctx.revert();
    }, [loading]);

    const projectOptions = projects.map((project) => ({
        value: project.id,
        label: project.name,
    }));

    const environmentOptions = environments.map((environment) => ({
        value: environment.id,
        label: environment.name,
        meta: environment.key,
    }));

    return (
        <div ref={pageRef} className="relative mx-auto w-full max-w-6xl overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute -left-32 top-0 size-[28rem] rounded-full bg-white/[0.025] blur-[110px]" />
            <div className="pointer-events-none absolute right-[-10rem] top-40 size-[30rem] rounded-full bg-white/[0.018] blur-[130px]" />

            <div data-api-hero className="relative mb-8">
                <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-foreground" />
                    Security & Runtime Access
                </div>
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                <KeyRound className="size-5 text-foreground" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">Runtime API Keys</h1>
                        </div>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                            Secure, environment-scoped credentials for SDKs and backend services to evaluate your feature flags at runtime.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.025] px-3 py-2 text-xs text-muted-foreground backdrop-blur-xl">
                        <Shield className="size-3.5 text-foreground" />
                        Read-only runtime access
                    </div>
                </div>

                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                    {[
                        ["01", "Scoped", "One key per environment"],
                        ["02", "Read-only", "No dashboard privileges"],
                        ["03", "Rotatable", "Revoke by generating again"],
                    ].map(([number, title, description]) => (
                        <div key={number} data-api-stat className="rounded-2xl border border-white/[0.08] bg-white/[0.018] px-4 py-3 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.035]">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[10px] text-muted-foreground">{number}</span>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{title}</p>
                                    <p className="text-[11px] text-muted-foreground">{description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mb-6 flex items-center justify-between rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")} className="text-xs underline underline-offset-2">Dismiss</button>
                </div>
            )}

            <div className="space-y-5">
                <section data-api-section className="group relative overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.018] shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl">
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="p-5 sm:p-7">
                        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="rounded-md border border-white/[0.09] bg-white/[0.035] px-2 py-1 font-mono text-[10px] text-muted-foreground">SECURITY MODEL</span>
                                    <span className="size-1 rounded-full bg-white/30" />
                                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Runtime only</span>
                                </div>
                                <h2 className="text-lg font-semibold text-foreground">Authentication vs. runtime credentials</h2>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                    Dashboard JWT tokens authenticate team members managing flags. Environment API keys are read-only credentials used by applications and microservices through the <code className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs text-foreground">X-FlagForge-Key</code> header.
                                </p>
                            </div>
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.035]">
                                <Shield className="size-5 text-foreground" />
                            </div>
                        </div>
                    </div>
                </section>

                <section data-api-section className="relative overflow-visible rounded-3xl border border-white/[0.09] bg-white/[0.018] shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="p-5 sm:p-7">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex size-9 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035]">
                                        <KeyRound className="size-4 text-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Environment Key Management</h2>
                                        <p className="text-xs text-muted-foreground sm:text-sm">Choose where the credential belongs, then generate or rotate it.</p>
                                    </div>
                                </div>
                            </div>
                            {currentEnvironment && (
                                <div className="rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
                                    {currentProject ? `${currentProject.name} / ${currentEnvironment.name}` : currentEnvironment.key}
                                </div>
                            )}
                        </div>

                        <div className="mt-7 grid gap-4 sm:grid-cols-2">
                            {loading ? (
                                <>
                                    <Skeleton className="h-11 w-full" />
                                    <Skeleton className="h-11 w-full" />
                                </>
                            ) : (
                                <>
                                    <PremiumSelect
                                        label="Project"
                                        value={selectedProjectId}
                                        options={projectOptions}
                                        onChange={handleProjectChange}
                                    />
                                    <PremiumSelect
                                        label="Environment"
                                        value={selectedEnvId}
                                        options={environmentOptions.length ? environmentOptions : [{ value: "", label: "No environments found" }]}
                                        onChange={(value) => {
                                            setSelectedEnvId(value);
                                            setGeneratedKey(null);
                                        }}
                                        disabled={environmentOptions.length === 0}
                                    />
                                </>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3 px-1">
                                <div className="flex size-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035]">
                                    <KeyRound className="size-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Generate a runtime credential</p>
                                    <p className="text-[11px] text-muted-foreground">Generating again rotates the environment credential.</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleGenerateKey}
                                disabled={generating || !selectedEnvId || loading}
                                className="h-10 gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_rgba(255,255,255,0.12)]"
                            >
                                {generating ? <RefreshCw className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                                {generating ? "Generating..." : "Generate / Rotate Key"}
                            </Button>
                        </div>

                        {generatedKey && (
                            <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.035] p-4 sm:p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05]">
                                        <Lock className="size-4 text-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-semibold text-foreground">New runtime key generated</p>
                                            <span className="rounded-full border border-white/[0.1] bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Save once</span>
                                        </div>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">Store this credential securely. Generating another key will invalidate the previous credential for this environment.</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <Input readOnly value={generatedKey} className="h-11 border-white/[0.09] bg-black/30 font-mono text-xs text-foreground" />
                                    <Button variant="outline" onClick={handleCopyKey} className="h-11 gap-2 border-white/[0.1] bg-white/[0.025] hover:bg-white/[0.07] sm:w-32">
                                        {copiedKey ? <Check className="size-4" /> : <Copy className="size-4" />}
                                        {copiedKey ? "Copied" : "Copy Key"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section data-api-section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.018] shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="p-5 sm:p-7">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex size-9 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035]">
                                        <Terminal className="size-4 text-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">SDK Integration</h2>
                                        <p className="text-xs text-muted-foreground sm:text-sm">Copy a ready-to-use TypeScript example for this environment.</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleCopySnippet} className="h-9 gap-2 rounded-xl border-white/[0.1] bg-white/[0.025] hover:bg-white/[0.07]">
                                {copiedSnippet ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                                {copiedSnippet ? "Copied" : "Copy Code"}
                            </Button>
                        </div>

                        <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070707]">
                            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-white/20" />
                                    <span className="size-2 rounded-full bg-white/10" />
                                    <span className="size-2 rounded-full bg-white/10" />
                                </div>
                                <span className="font-mono text-[10px] text-muted-foreground">typescript · runtime.ts</span>
                            </div>
                            <pre className="max-h-[28rem] overflow-x-auto p-5 font-mono text-[11px] leading-6 text-white/80 sm:text-xs"><code>{codeSnippet}</code></pre>
                        </div>

                        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                            <Info className="mt-0.5 size-3.5 shrink-0" />
                            <span>For detailed parameter definitions and HTTP API reference, visit the <a href="/docs" className="font-medium text-foreground underline underline-offset-2">Docs</a>.</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
