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
    Plus,
    Radio,
    Settings as SettingsIcon,
    Sliders,
    Sparkles,
    X,
} from "lucide-react";

import { getCurrentUser, logout } from "@/lib/auth";
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
            : "/projects";

    // Dynamic destination for evaluation link
    const evaluationPath =
        effectiveProjectId && effectiveEnvId
            ? `/projects/${effectiveProjectId}/environments/${effectiveEnvId}/evaluate`
            : effectiveProjectId
            ? `/projects/${effectiveProjectId}`
            : "/projects";

    const isFeatureFlagsActive =
        location.pathname.includes("/environments/") &&
        !location.pathname.includes("/evaluate");

    const isEvaluationActive = location.pathname.includes("/evaluate");

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
            {/* Top Bar */}
            <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6">
                {/* Left: Branding & Project Selector */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Brand */}
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 group transition-transform focus:outline-hidden"
                    >
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs group-hover:scale-105 transition-transform">
                            <Radio className="size-4.5" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-bold tracking-tight text-foreground leading-none">
                                FlagForge
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                Feature Management
                            </span>
                        </div>
                    </Link>

                    <div className="h-4 w-px bg-border hidden sm:block" />

                    {/* Project Selector */}
                    <div className="relative" ref={projectDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                            className="flex h-8 items-center gap-2 rounded-md border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:bg-muted/70 hover:border-border focus:outline-hidden cursor-pointer shadow-2xs"
                        >
                            <FolderKanban className="size-3.5 text-muted-foreground" />
                            <span className="max-w-[130px] sm:max-w-[170px] truncate">
                                {loadingProjects
                                    ? "Loading..."
                                    : activeProject?.name || "Select project"}
                            </span>
                            <ChevronDown className="size-3.5 text-muted-foreground" />
                        </button>

                        {projectDropdownOpen && (
                            <div className="absolute left-0 top-10 z-50 w-64 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in-80 zoom-in-95 duration-100">
                                <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                                    <span>Projects</span>
                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                        {projects.length}
                                    </Badge>
                                </div>

                                <div className="max-h-60 overflow-y-auto space-y-0.5 my-1">
                                    {projects.length === 0 ? (
                                        <div className="px-3 py-3 text-xs text-muted-foreground text-center">
                                            No projects found.
                                        </div>
                                    ) : (
                                        projects.map((project) => (
                                            <button
                                                key={project.id}
                                                type="button"
                                                onClick={() => handleSelectProject(project)}
                                                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                                                    project.id === effectiveProjectId
                                                        ? "bg-muted font-semibold text-foreground"
                                                        : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <FolderKanban className="size-3.5 text-muted-foreground shrink-0" />
                                                    <span className="truncate">{project.name}</span>
                                                </div>
                                                {project.id === effectiveProjectId && (
                                                    <Check className="size-3.5 text-primary shrink-0" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>

                                <div className="border-t border-border pt-1 mt-1 space-y-0.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProjectDropdownOpen(false);
                                            setCreateProjectModalOpen(true);
                                        }}
                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-primary font-medium hover:bg-muted/70 transition-colors cursor-pointer"
                                    >
                                        <Plus className="size-3.5" />
                                        <span>Create new project</span>
                                    </button>

                                    <Link
                                        to="/projects"
                                        onClick={() => setProjectDropdownOpen(false)}
                                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
                                    >
                                        <span>Manage all projects</span>
                                        <ExternalLink className="size-3" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center: Main Navigation Links */}
                <nav className="hidden md:flex items-center gap-1">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            }`
                        }
                    >
                        <LayoutDashboard className="size-3.5" />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to={featureFlagsPath}
                        className={() =>
                            `flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                isFeatureFlagsActive
                                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            }`
                        }
                    >
                        <Sliders className="size-3.5" />
                        Feature Flags
                    </NavLink>

                    <NavLink
                        to={evaluationPath}
                        className={() =>
                            `flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                isEvaluationActive
                                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            }`
                        }
                    >
                        <Sparkles className="size-3.5" />
                        Evaluation
                    </NavLink>

                    <NavLink
                        to="/activity"
                        className={({ isActive }) =>
                            `flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            }`
                        }
                    >
                        <History className="size-3.5" />
                        Activity
                    </NavLink>
                </nav>

                {/* Right: Settings & User Profile Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex size-8 items-center justify-center rounded-md border border-border/60 transition-colors ${
                                isActive
                                    ? "bg-muted text-foreground border-border"
                                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            }`
                        }
                        title="Settings"
                    >
                        <SettingsIcon className="size-4" />
                    </NavLink>

                    {/* User profile dropdown */}
                    <div className="relative" ref={userDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                            className="flex h-8 items-center gap-1.5 rounded-md border border-border/60 bg-card px-2 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                        >
                            <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                                {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
                            </div>
                            <span className="hidden sm:inline max-w-[100px] truncate text-[11px]">
                                {currentUser?.name || currentUser?.email?.split("@")[0] || "Account"}
                            </span>
                            <ChevronDown className="size-3 text-muted-foreground" />
                        </button>

                        {userDropdownOpen && (
                            <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in-80 zoom-in-95 duration-100">
                                <div className="px-2.5 py-2">
                                    <p className="text-xs font-semibold text-foreground truncate">
                                        {currentUser?.name || "FlagForge User"}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate">
                                        {currentUser?.email || "Signed in"}
                                    </p>
                                </div>

                                <div className="border-t border-border my-1" />

                                <Link
                                    to="/settings"
                                    onClick={() => setUserDropdownOpen(false)}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground/80 hover:bg-muted/60 hover:text-foreground transition-colors"
                                >
                                    <SettingsIcon className="size-3.5 text-muted-foreground" />
                                    <span>Settings & API Keys</span>
                                </Link>

                                <Link
                                    to="/projects"
                                    onClick={() => setUserDropdownOpen(false)}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground/80 hover:bg-muted/60 hover:text-foreground transition-colors"
                                >
                                    <FolderKanban className="size-3.5 text-muted-foreground" />
                                    <span>Projects Overview</span>
                                </Link>

                                <div className="border-t border-border my-1" />

                                <button
                                    type="button"
                                    onClick={() => {
                                        logout();
                                        window.location.href = "/login";
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                >
                                    <LogOut className="size-3.5" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu trigger */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex md:hidden size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-card p-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
                    <NavLink
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to={featureFlagsPath}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                        <Sliders className="size-4" />
                        Feature Flags
                    </NavLink>
                    <NavLink
                        to={evaluationPath}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                        <Sparkles className="size-4" />
                        Evaluation
                    </NavLink>
                    <NavLink
                        to="/activity"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                        <History className="size-4" />
                        Activity
                    </NavLink>
                    <NavLink
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                        <SettingsIcon className="size-4" />
                        Settings
                    </NavLink>
                </div>
            )}

            {/* Sub-Header: Contextual Environment Bar */}
            {effectiveProjectId && (
                <div className="border-t border-border/60 bg-muted/25 px-4 sm:px-6">
                    <div className="mx-auto flex h-10 max-w-[1600px] items-center justify-between gap-4 overflow-x-auto">
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/90 shrink-0">
                                <Layers className="size-3 text-muted-foreground" />
                                Environment:
                            </span>

                            {loadingEnvironments ? (
                                <span className="text-xs text-muted-foreground">Loading environments...</span>
                            ) : environments.length === 0 ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">No environments yet</span>
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={() => setCreateEnvModalOpen(true)}
                                        className="h-6 text-[11px] px-2"
                                    >
                                        <Plus className="size-3 mr-1" />
                                        Create
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                                    {environments.map((env) => {
                                        const isSelected = env.id === effectiveEnvId;
                                        return (
                                            <button
                                                key={env.id}
                                                type="button"
                                                onClick={() => handleSelectEnvironment(env)}
                                                className={`group flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-foreground text-background shadow-xs font-semibold"
                                                        : "bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                                                }`}
                                            >
                                                <span
                                                    className={`size-1.5 rounded-full ${
                                                        isSelected
                                                            ? "bg-background"
                                                            : "bg-muted-foreground/60 group-hover:bg-primary"
                                                    }`}
                                                />
                                                <span>{env.name}</span>
                                            </button>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        onClick={() => setCreateEnvModalOpen(true)}
                                        className="inline-flex size-5 items-center justify-center rounded-full border border-dashed border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                                        title="Add Environment"
                                    >
                                        <Plus className="size-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Breadcrumb path info */}
                        {activeProject && (
                            <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground/80 shrink-0">
                                <span className="font-medium text-foreground/70">{activeProject.name}</span>
                                {activeEnvironment && (
                                    <>
                                        <span>/</span>
                                        <span className="font-semibold text-foreground">{activeEnvironment.name}</span>
                                        <code className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-sm font-mono text-muted-foreground">
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
