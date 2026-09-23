import { useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useNavigate, useParams, Link } from "react-router-dom";
import {
    Check,
    ChevronDown,
    ExternalLink,
    FolderKanban,
    History,
    Layers,
    LayoutDashboard,
    LogOut,
    Menu,
    Moon,
    Plus,
    Settings as SettingsIcon,
    Sliders,
    Sparkles,
    Sun,
    X,
} from "lucide-react";

import { getCurrentUser, logout } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { createProject, getProjects, type Project } from "@/lib/projects";
import {
    createEnvironment,
    getEnvironments,
    type Environment,
} from "@/lib/environments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TopNavigation() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    const routeProjectId = params.projectId;
    const routeEnvironmentId = params.environmentId;

    const [projects, setProjects] = useState<Project[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingEnvironments, setLoadingEnvironments] = useState(false);

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        routeProjectId || localStorage.getItem("flagforge_active_project_id") || null
    );
    const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(
        routeEnvironmentId || localStorage.getItem("flagforge_active_env_id") || null
    );

    const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Create Project modal state
    const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [creatingProject, setCreatingProject] = useState(false);

    // Create Environment modal state
    const [createEnvModalOpen, setCreateEnvModalOpen] = useState(false);
    const [newEnvName, setNewEnvName] = useState("");
    const [newEnvKey, setNewEnvKey] = useState("");
    const [creatingEnv, setCreatingEnv] = useState(false);

    const projectDropdownRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const currentUser = getCurrentUser();

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                projectDropdownRef.current &&
                !projectDropdownRef.current.contains(event.target as Node)
            ) {
                setProjectDropdownOpen(false);
            }
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(event.target as Node)
            ) {
                setUserDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load projects on mount
    useEffect(() => {
        async function loadAllProjects() {
            try {
                setLoadingProjects(true);
                const data = await getProjects();
                setProjects(data);

                if (data.length > 0 && !selectedProjectId && !routeProjectId) {
                    setSelectedProjectId(data[0].id);
                    localStorage.setItem("flagforge_active_project_id", data[0].id);
                }
            } catch (err) {
                console.error("Failed to load projects", err);
            } finally {
                setLoadingProjects(false);
            }
        }
        loadAllProjects();
    }, []);

    // Sync route projectId
    useEffect(() => {
        if (routeProjectId && routeProjectId !== selectedProjectId) {
            setSelectedProjectId(routeProjectId);
            localStorage.setItem("flagforge_active_project_id", routeProjectId);
        }
    }, [routeProjectId]);

    // Sync route environmentId
    useEffect(() => {
        if (routeEnvironmentId && routeEnvironmentId !== selectedEnvironmentId) {
            setSelectedEnvironmentId(routeEnvironmentId);
            localStorage.setItem("flagforge_active_env_id", routeEnvironmentId);
        }
    }, [routeEnvironmentId]);

    // Load environments when active project changes
    useEffect(() => {
        const activeProjId = routeProjectId || selectedProjectId;
        if (!activeProjId) {
            setEnvironments([]);
            return;
        }

        async function loadProjectEnvironments() {
            try {
                setLoadingEnvironments(true);
                const data = await getEnvironments(activeProjId!);
                setEnvironments(data);

                // If currently selected environment is not in this project, set to first one
                if (data.length > 0) {
                    const match = data.find((e) => e.id === selectedEnvironmentId);
                    if (!match && !routeEnvironmentId) {
                        setSelectedEnvironmentId(data[0].id);
                        localStorage.setItem("flagforge_active_env_id", data[0].id);
                    }
                } else {
                    setSelectedEnvironmentId(null);
                    localStorage.removeItem("flagforge_active_env_id");
                }
            } catch (err) {
                console.error("Failed to load environments", err);
                setEnvironments([]);
            } finally {
                setLoadingEnvironments(false);
            }
        }

        loadProjectEnvironments();
    }, [selectedProjectId, routeProjectId]);

    const activeProject = projects.find(
        (p) => p.id === (routeProjectId || selectedProjectId)
    );
    const activeEnvironment = environments.find(
        (e) => e.id === (routeEnvironmentId || selectedEnvironmentId)
    );

    const effectiveProjectId = activeProject?.id || selectedProjectId;
    const effectiveEnvId = activeEnvironment?.id || selectedEnvironmentId;

    function handleSelectProject(project: Project) {
        setSelectedProjectId(project.id);
        localStorage.setItem("flagforge_active_project_id", project.id);
        setProjectDropdownOpen(false);

        // Fetch environments for this project and navigate
        getEnvironments(project.id).then((envs) => {
            if (envs.length > 0) {
                setSelectedEnvironmentId(envs[0].id);
                localStorage.setItem("flagforge_active_env_id", envs[0].id);
                // If on feature flags or evaluate, navigate to the new project/environment
                if (
                    location.pathname.includes("/flags") ||
                    location.pathname.includes("/evaluate") ||
                    location.pathname.includes("/environments/")
                ) {
                    navigate(`/projects/${project.id}/environments/${envs[0].id}`);
                } else if (location.pathname.startsWith("/projects")) {
                    navigate(`/projects/${project.id}`);
                }
            } else {
                setSelectedEnvironmentId(null);
                localStorage.removeItem("flagforge_active_env_id");
                navigate(`/projects/${project.id}`);
            }
        });
    }

    function handleSelectEnvironment(env: Environment) {
        setSelectedEnvironmentId(env.id);
        localStorage.setItem("flagforge_active_env_id", env.id);

        if (location.pathname.includes("/evaluate")) {
            navigate(`/projects/${effectiveProjectId}/environments/${env.id}/evaluate`);
        } else {
            navigate(`/projects/${effectiveProjectId}/environments/${env.id}`);
        }
    }

    async function handleCreateProjectSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newProjectName.trim()) return;
        try {
            setCreatingProject(true);
            const project = await createProject(newProjectName.trim());
            setProjects((prev) => [project, ...prev]);
            setSelectedProjectId(project.id);
            localStorage.setItem("flagforge_active_project_id", project.id);
            setNewProjectName("");
            setCreateProjectModalOpen(false);
            navigate(`/projects/${project.id}`);
        } catch (err) {
            console.error("Failed to create project", err);
        } finally {
            setCreatingProject(false);
        }
    }

    async function handleCreateEnvSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!effectiveProjectId || !newEnvName.trim() || !newEnvKey.trim()) return;
        try {
            setCreatingEnv(true);
            const env = await createEnvironment(
                effectiveProjectId,
                newEnvName.trim(),
                newEnvKey.trim().toLowerCase().replace(/\s+/g, "-")
            );
            setEnvironments((prev) => [...prev, env]);
            setSelectedEnvironmentId(env.id);
            localStorage.setItem("flagforge_active_env_id", env.id);
            setNewEnvName("");
            setNewEnvKey("");
            setCreateEnvModalOpen(false);
            navigate(`/projects/${effectiveProjectId}/environments/${env.id}`);
        } catch (err) {
            console.error("Failed to create environment", err);
        } finally {
            setCreatingEnv(false);
        }
    }

    // Dynamic destination for feature flags link
    const featureFlagsPath =
        effectiveProjectId && effectiveEnvId
            ? `/projects/${effectiveProjectId}/environments/${effectiveEnvId}`
            : effectiveProjectId
                ? `/projects/${effectiveProjectId}`
                : "/dashboard";

    // Dynamic destination for evaluation link
    const evaluationPath =
        effectiveProjectId && effectiveEnvId
            ? `/projects/${effectiveProjectId}/environments/${effectiveEnvId}/evaluate`
            : effectiveProjectId
                ? `/projects/${effectiveProjectId}`
                : "/dashboard";

    // Dynamic destination for api-keys link
    const apiKeysPath =
        effectiveProjectId && effectiveEnvId
            ? `/projects/${effectiveProjectId}/environments/${effectiveEnvId}/api-keys`
            : "/api-keys";

    const isFeatureFlagsActive =
        (location.pathname.includes("/flags") ||
            (location.pathname.includes("/environments/") &&
                !location.pathname.includes("/evaluate") &&
                !location.pathname.includes("/api-keys"))) &&
        !location.pathname.includes("/docs");

    const isEvaluationActive = location.pathname.includes("/evaluate");
    const isApiKeysActive = location.pathname.includes("/api-keys");
    const isDocsActive = location.pathname.startsWith("/docs");
    const isActivityActive = location.pathname.startsWith("/activity");

    return (
        <header
            ref={navRef}
            className="sticky top-0 z-50 w-full bg-[#050505]/90 text-white backdrop-blur-2xl"
        >
            {/* Main navigation shell */}
            <div
                data-nav-shell
                className="mx-auto flex h-[68px] max-w-[1800px] items-center border-x border-white/[0.04] bg-[#080808]/70 px-4 sm:px-6 lg:px-8 transition-[background-color,border-color,box-shadow] duration-300"
            >
                <div className="flex w-full items-center gap-4">
                    {/* Premium FlagForge Brand */}
                    <Link
                        to="/"
                        aria-label="FlagForge home"
                        className="group relative flex h-[54px] w-[190px] shrink-0 items-center overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018] px-2.5 shadow-[inset_0_1px_rgba(255,255,255,0.06),0_8px_30px_rgba(0,0,0,0.18)] transition-all duration-500 hover:-translate-y-px hover:border-white/[0.14] hover:bg-white/[0.035] hover:shadow-[inset_0_1px_rgba(255,255,255,0.09),0_12px_36px_rgba(0,0,0,0.28)]"
                    >
                        {/* Soft ambient glow */}
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -left-8 top-1/2 size-20 -translate-y-1/2 rounded-full bg-white/[0.045] blur-2xl transition-all duration-700 group-hover:bg-white/[0.09] group-hover:scale-125"
                        />

                        {/* Logo */}
                        <img
                            src="/flagforge-logo.png"
                            alt="FlagForge Feature Platform"
                            className="relative z-10 h-[50px] w-full object-contain object-left transition-all duration-500 group-hover:scale-[1.025] group-hover:brightness-[1.08] group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.14)]"
                        />

                        {/* Premium reflection sweep */}
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 -left-1/2 z-20 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.16] to-transparent opacity-0 transition-all duration-700 group-hover:left-[125%] group-hover:opacity-100"
                        />

                        {/* Tiny brand status light */}
                        <span
                            aria-hidden="true"
                            className="absolute bottom-2 right-2 z-20 size-1.5 rounded-full bg-white/25 shadow-[0_0_8px_rgba(255,255,255,0.18)] transition-all duration-500 group-hover:bg-white/70 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.45)]"
                        />
                    </Link>

                    {/* Project selector */}
                    <div className="relative shrink-0" ref={projectDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                            aria-label={`Current project: ${loadingProjects
                                ? "Loading"
                                : activeProject?.name || "Select project"
                                }. Click to change project.`}
                            className="group flex h-11 min-w-[205px] items-center gap-2.5 rounded-xl border border-white/[0.09] bg-white/[0.035] px-2.5 text-left shadow-[inset_0_1px_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-px hover:border-white/[0.16] hover:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-white/20"
                        >
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.09] bg-white/[0.05] text-white/60 transition-colors duration-300 group-hover:border-white/15 group-hover:text-white">
                                <FolderKanban className="size-3.5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">
                                    Project
                                </div>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                    <span className="max-w-[135px] truncate text-[13px] font-semibold leading-none text-white/90">
                                        {loadingProjects
                                            ? "Loading..."
                                            : activeProject?.name || "Select project"}
                                    </span>
                                    <span className="text-[9px] font-medium text-white/25">
                                        Change
                                    </span>
                                </div>
                            </div>

                            <ChevronDown
                                className={`size-3.5 shrink-0 text-white/35 transition-transform duration-300 ${projectDropdownOpen ? "rotate-180 text-white" : ""
                                    }`}
                            />
                        </button>

                        {projectDropdownOpen && (
                            <div className="absolute left-0 top-[calc(100%+10px)] z-[70] w-72 overflow-hidden rounded-2xl border border-white/[0.11] bg-[#0b0b0b]/95 p-1.5 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                                <div className="flex items-center justify-between px-3 py-2">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                                            Project
                                        </span>
                                        <p className="mt-0.5 text-[11px] text-white/25">
                                            Select the workspace you want to manage
                                        </p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="h-5 border border-white/[0.08] bg-white/[0.05] px-1.5 text-[10px] text-white/55"
                                    >
                                        {projects.length}
                                    </Badge>
                                </div>

                                <div className="my-1 max-h-64 space-y-0.5 overflow-y-auto">
                                    {projects.length === 0 ? (
                                        <div className="px-3 py-4 text-center text-xs text-white/35">
                                            No projects found.
                                        </div>
                                    ) : (
                                        projects.map((project) => (
                                            <button
                                                key={project.id}
                                                type="button"
                                                onClick={() => handleSelectProject(project)}
                                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${project.id === effectiveProjectId
                                                    ? "bg-white text-black"
                                                    : "text-white/65 hover:bg-white/[0.07] hover:text-white"
                                                    }`}
                                            >
                                                <div className="flex min-w-0 items-center gap-2.5">
                                                    <FolderKanban className="size-3.5 shrink-0 opacity-60" />
                                                    <span className="truncate">{project.name}</span>
                                                </div>
                                                {project.id === effectiveProjectId && (
                                                    <Check className="size-3.5 shrink-0" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>

                                <div className="border-t border-white/[0.08] pt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProjectDropdownOpen(false);
                                            setCreateProjectModalOpen(true);
                                        }}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <Plus className="size-4" />
                                        Create new project
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Center navigation */}
                    <nav className="hidden min-w-0 flex-1 justify-center lg:flex">
                        <div className="flex items-center gap-0.5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1 shadow-[inset_0_1px_rgba(255,255,255,0.025)]">
                            {[
                                {
                                    to: "/dashboard",
                                    label: "Dashboard",
                                    icon: LayoutDashboard,
                                    active: location.pathname === "/dashboard",
                                },
                                {
                                    to: featureFlagsPath,
                                    label: "Feature Flags",
                                    icon: Sliders,
                                    active: isFeatureFlagsActive,
                                },
                                {
                                    to: evaluationPath,
                                    label: "Evaluation",
                                    icon: Sparkles,
                                    active: isEvaluationActive,
                                },
                                {
                                    to: "/activity",
                                    label: "Activity",
                                    icon: History,
                                    active: isActivityActive,
                                },
                                {
                                    to: apiKeysPath,
                                    label: "API Keys",
                                    icon: SettingsIcon,
                                    active: isApiKeysActive,
                                },
                                {
                                    to: "/docs",
                                    label: "Docs",
                                    icon: ExternalLink,
                                    active: isDocsActive,
                                },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.label}
                                        to={item.to}

                                        className={`group relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold transition-all duration-300 hover:-translate-y-px xl:px-3.5 ${item.active
                                            ? "bg-white text-black shadow-[0_6px_20px_rgba(255,255,255,0.10)]"
                                            : "text-white/40 hover:bg-white/[0.06] hover:text-white/85"
                                            }`}
                                    >
                                        <Icon className="size-3.5 transition-transform duration-300 group-hover:scale-110" />
                                        <span className="hidden xl:inline">{item.label}</span>
                                        {item.active && (
                                            <span className="absolute inset-x-3 -bottom-1 h-px bg-white/60 blur-[2px]" />
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Right controls */}
                    <div className="ml-auto flex shrink-0 items-center gap-1.5">
                        <div className="hidden items-center gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1 sm:flex">
                            <div>
                                <ThemeToggle />
                            </div>

                            <NavLink
                                to="/settings"

                                className={({ isActive }) =>
                                    `flex size-9 items-center justify-center rounded-xl border transition-all duration-300 ${isActive
                                        ? "border-white/[0.14] bg-white/[0.09] text-white"
                                        : "border-transparent text-white/40 hover:border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
                                    }`
                                }
                                title="Settings"
                            >
                                <SettingsIcon className="size-4" />
                            </NavLink>
                        </div>

                        {/* User profile */}
                        <div className="relative" ref={userDropdownRef}>
                            <button
                                type="button"

                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="group flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-2.5 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.065] focus:outline-none"
                            >
                                <div className="flex size-6.5 items-center justify-center rounded-lg bg-white text-[10px] font-bold text-black">
                                    {currentUser?.email
                                        ? currentUser.email.charAt(0).toUpperCase()
                                        : "U"}
                                </div>
                                <span className="hidden max-w-[100px] truncate text-xs font-semibold text-white/75 xl:inline">
                                    {currentUser?.name ||
                                        currentUser?.email?.split("@")[0] ||
                                        "Account"}
                                </span>
                                <ChevronDown
                                    className={`size-3.5 text-white/35 transition-transform duration-300 ${userDropdownOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {userDropdownOpen && (
                                <div className="absolute right-0 top-[calc(100%+10px)] z-[70] w-60 overflow-hidden rounded-2xl border border-white/[0.11] bg-[#0b0b0b]/95 p-1.5 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                                    <div className="px-3 py-2.5">
                                        <p className="truncate text-xs font-semibold text-white">
                                            {currentUser?.name || "FlagForge User"}
                                        </p>
                                        <p className="mt-0.5 truncate text-[11px] text-white/35">
                                            {currentUser?.email || "Signed in"}
                                        </p>
                                    </div>

                                    <div className="border-t border-white/[0.08] py-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleTheme()}
                                            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                {theme === "dark" ? (
                                                    <Sun className="size-4" />
                                                ) : (
                                                    <Moon className="size-4" />
                                                )}
                                                Theme
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                                                {theme}
                                            </span>
                                        </button>

                                        <Link
                                            to="/settings"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                                        >
                                            <SettingsIcon className="size-4" />
                                            Account settings
                                        </Link>
                                    </div>

                                    <div className="border-t border-white/[0.08] pt-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                logout();
                                                window.location.href = "/login";
                                            }}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-300/70 transition-colors hover:bg-red-400/[0.08] hover:text-red-300"
                                        >
                                            <LogOut className="size-4" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/60 transition-all hover:border-white/[0.15] hover:bg-white/[0.065] hover:text-white lg:hidden"
                            aria-label="Toggle navigation menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="size-4.5" />
                            ) : (
                                <Menu className="size-4.5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile drawer */}
            {mobileMenuOpen && (
                <div className="absolute left-3 right-3 top-[calc(100%+8px)] z-[60] overflow-hidden rounded-2xl border border-white/[0.10] bg-[#0a0a0a]/95 p-2 shadow-[0_30px_90px_rgba(0,0,0,0.65)] backdrop-blur-2xl lg:hidden">
                    {[
                        {
                            to: "/dashboard",
                            label: "Dashboard",
                            icon: LayoutDashboard,
                            active: location.pathname === "/dashboard",
                        },
                        {
                            to: featureFlagsPath,
                            label: "Feature Flags",
                            icon: Sliders,
                            active: isFeatureFlagsActive,
                        },
                        {
                            to: evaluationPath,
                            label: "Evaluation",
                            icon: Sparkles,
                            active: isEvaluationActive,
                        },
                        {
                            to: "/activity",
                            label: "Activity",
                            icon: History,
                            active: isActivityActive,
                        },
                        {
                            to: apiKeysPath,
                            label: "API Keys",
                            icon: SettingsIcon,
                            active: isApiKeysActive,
                        },
                        {
                            to: "/docs",
                            label: "Docs",
                            icon: ExternalLink,
                            active: isDocsActive,
                        },
                        {
                            to: "/settings",
                            label: "Profile Settings",
                            icon: SettingsIcon,
                            active: location.pathname.startsWith("/settings"),
                        },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.label}
                                to={item.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${item.active
                                    ? "bg-white text-black"
                                    : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                                    }`}
                            >
                                <Icon className="size-4" />
                                {item.label}
                            </NavLink>
                        );
                    })}

                    <div className="mt-2 border-t border-white/[0.08] pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                toggleTheme();
                                setMobileMenuOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold text-white/55 hover:bg-white/[0.06] hover:text-white"
                        >
                            <div className="flex items-center gap-3">
                                {theme === "dark" ? (
                                    <Sun className="size-4" />
                                ) : (
                                    <Moon className="size-4" />
                                )}
                                Appearance
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                                {theme}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* Environment context bar */}
            {effectiveProjectId && (
                <div className="border-t border-white/[0.06] bg-[#070707]/90 backdrop-blur-xl">
                    <div className="mx-auto flex min-h-10 max-w-[1800px] items-center justify-between gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex shrink-0 items-center gap-2.5">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                                <Layers className="size-3" />
                                Environment
                            </span>

                            {loadingEnvironments ? (
                                <span className="text-xs text-white/35">Loading...</span>
                            ) : environments.length === 0 ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/35">
                                        No environments
                                    </span>
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={() => setCreateEnvModalOpen(true)}
                                        className="h-6 border-white/[0.12] bg-white/[0.04] px-2 text-[10px] text-white"
                                    >
                                        <Plus className="mr-1 size-3" />
                                        Create
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 py-1">
                                    {environments.map((env) => {
                                        const isSelected = env.id === effectiveEnvId;
                                        return (
                                            <button
                                                key={env.id}
                                                type="button"
                                                onClick={() => handleSelectEnvironment(env)}
                                                className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${isSelected
                                                    ? "bg-white text-black shadow-[0_4px_18px_rgba(255,255,255,0.08)]"
                                                    : "border border-white/[0.07] bg-white/[0.025] text-white/40 hover:border-white/[0.13] hover:bg-white/[0.06] hover:text-white"
                                                    }`}
                                            >
                                                <span
                                                    className={`size-1.5 rounded-full ${isSelected
                                                        ? "bg-black"
                                                        : "bg-white/25 group-hover:bg-white"
                                                        }`}
                                                />
                                                {env.name}
                                            </button>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        onClick={() => setCreateEnvModalOpen(true)}
                                        className="inline-flex size-6 items-center justify-center rounded-lg border border-dashed border-white/[0.13] text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white"
                                        title="Add Environment"
                                    >
                                        <Plus className="size-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {activeProject && (
                            <div className="hidden shrink-0 items-center gap-2 text-[11px] text-white/35 lg:flex">
                                <span className="text-white/25">Project</span>
                                <span className="font-semibold text-white/60">
                                    {activeProject.name}
                                </span>
                                {activeEnvironment && (
                                    <>
                                        <span className="text-white/20">/</span>
                                        <span className="text-white/25">Environment</span>
                                        <span className="font-semibold text-white">
                                            {activeEnvironment.name}
                                        </span>
                                        <code className="rounded-md border border-white/[0.06] bg-white/[0.035] px-1.5 py-0.5 font-mono text-[9px] text-white/30">
                                            {activeEnvironment.key}
                                        </code>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Project Modal */}
            <Dialog open={createProjectModalOpen} onOpenChange={setCreateProjectModalOpen}>
                <DialogClose onClose={() => setCreateProjectModalOpen(false)} />
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Projects contain your environments and feature flags.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="top-proj-name">Project Name</Label>
                        <Input
                            id="top-proj-name"
                            placeholder="e.g. Core App, Checkout Service"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateProjectModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={creatingProject || !newProjectName.trim()}>
                            {creatingProject ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>

            {/* Create Environment Modal */}
            <Dialog open={createEnvModalOpen} onOpenChange={setCreateEnvModalOpen}>
                <DialogClose onClose={() => setCreateEnvModalOpen(false)} />
                <DialogHeader>
                    <DialogTitle>Add Environment to {activeProject?.name}</DialogTitle>
                    <DialogDescription>
                        Create an isolated deployment environment (e.g. Development, Staging, Production).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateEnvSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="top-env-name">Environment Name</Label>
                        <Input
                            id="top-env-name"
                            placeholder="e.g. Production"
                            value={newEnvName}
                            onChange={(e) => {
                                setNewEnvName(e.target.value);
                                if (!newEnvKey || newEnvKey === newEnvName.toLowerCase().replace(/\s+/g, "-")) {
                                    setNewEnvKey(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                                }
                            }}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="top-env-key">Environment Key (for SDK & APIs)</Label>
                        <Input
                            id="top-env-key"
                            placeholder="e.g. production"
                            value={newEnvKey}
                            onChange={(e) => setNewEnvKey(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateEnvModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={creatingEnv || !newEnvName.trim() || !newEnvKey.trim()}
                        >
                            {creatingEnv ? "Creating..." : "Create Environment"}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>
        </header>
    );
}
