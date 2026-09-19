import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
    Activity,
    ChevronDown,
    FolderKanban,
    History,
    LogOut,
    Settings,
} from "lucide-react";

import { logout } from "@/lib/auth";
import { getProjects, type Project } from "@/lib/projects";
import {
    getEnvironments,
    type Environment,
} from "@/lib/environments";

export function Sidebar() {
    const navigate = useNavigate();
    const { projectId, environmentId } = useParams();

    const [projects, setProjects] = useState<Project[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [projectMenuOpen, setProjectMenuOpen] = useState(false);

    useEffect(() => {
        async function loadProjects() {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch {
                setProjects([]);
            }
        }

        void loadProjects();
    }, []);

    useEffect(() => {
        if (!projectId) {
            setEnvironments([]);
            return;
        }

        async function loadEnvironments() {
            try {
                const data = await getEnvironments(projectId!);
                setEnvironments(data);
            } catch {
                setEnvironments([]);
            }
        }

        void loadEnvironments();
    }, [projectId]);

    const currentProject = projects.find(
        (project) => project.id === projectId
    );

    const currentEnvironment = environments.find(
        (environment) => environment.id === environmentId
    );

    function handleProjectChange(project: Project) {
        setProjectMenuOpen(false);
        navigate(`/projects/${project.id}`);
    }

    function handleEnvironmentChange(environment: Environment) {
        navigate(
            `/projects/${environment.projectId}/environments/${environment.id}`
        );
    }

    const navigationItems = [
        {
            label: "Dashboard",
            icon: Activity,
            path: "/dashboard",
            visible: true,
        },
        {
            label: "Projects",
            icon: FolderKanban,
            path: "/projects",
            visible: true,
        },
        {
            label: "Feature Flags",
            icon: Activity,
            path:
                projectId && environmentId
                    ? `/projects/${projectId}/environments/${environmentId}`
                    : "/projects",
            visible: Boolean(projectId && environmentId),
        },
        {
            label: "Evaluation",
            icon: Activity,
            path:
                projectId && environmentId
                    ? `/projects/${projectId}/environments/${environmentId}/evaluate`
                    : "/projects",
            visible: Boolean(projectId && environmentId),
        },
        {
            label: "Activity",
            icon: History,
            path: "/activity",
            visible: true,
        },
    ];

    return (
        <div className="border-b bg-background">
            {/* Main navigation */}
            <div className="mx-auto flex min-h-16 max-w-[1600px] items-center gap-6 px-6">
                {/* Brand */}
                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="shrink-0 text-left"
                >
                    <div className="text-lg font-semibold tracking-tight">
                        FlagForge
                    </div>

                    <div className="text-[11px] text-muted-foreground">
                        Feature management
                    </div>
                </button>

                {/* Project selector */}
                <div className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() =>
                            setProjectMenuOpen((current) => !current)
                        }
                        className="flex h-9 items-center gap-2 rounded-md border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        <FolderKanban className="size-4 text-muted-foreground" />

                        <span className="max-w-40 truncate">
                            {currentProject?.name ?? "Select project"}
                        </span>

                        <ChevronDown className="size-4 text-muted-foreground" />
                    </button>

                    {projectMenuOpen && (
                        <div className="absolute left-0 top-11 z-50 w-64 rounded-lg border bg-popover p-1 shadow-lg">
                            <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                                Projects
                            </div>

                            {projects.length === 0 ? (
                                <div className="px-3 py-3 text-sm text-muted-foreground">
                                    No projects found.
                                </div>
                            ) : (
                                projects.map((project) => (
                                    <button
                                        key={project.id}
                                        type="button"
                                        onClick={() =>
                                            handleProjectChange(project)
                                        }
                                        className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${project.id === projectId
                                                ? "bg-muted font-medium"
                                                : ""
                                            }`}
                                    >
                                        {project.name}
                                    </button>
                                ))
                            )}

                            <div className="my-1 border-t" />

                            <button
                                type="button"
                                onClick={() => {
                                    setProjectMenuOpen(false);
                                    navigate("/projects");
                                }}
                                className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                Manage projects
                            </button>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
                    {navigationItems
                        .filter((item) => item.visible)
                        .map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.label}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                                            ? "bg-foreground text-background font-medium"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`
                                    }
                                >
                                    <Icon className="size-4" />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                </nav>

                {/* Right side */}
                <div className="flex shrink-0 items-center gap-1">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `rounded-md p-2 transition-colors ${isActive
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`
                        }
                        title="Settings"
                    >
                        <Settings className="size-4" />
                    </NavLink>

                    <button
                        type="button"
                        onClick={() => {
                            logout();
                            window.location.href = "/login";
                        }}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Sign out"
                    >
                        <LogOut className="size-4" />
                    </button>
                </div>
            </div>

            {/* Environment context */}
            {projectId && (
                <div className="border-t bg-muted/20">
                    <div className="mx-auto flex min-h-11 max-w-[1600px] items-center gap-3 overflow-x-auto px-6">
                        <span className="shrink-0 text-xs font-medium text-muted-foreground">
                            Environment
                        </span>

                        {environments.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                                No environments
                            </span>
                        ) : (
                            environments.map((environment) => (
                                <button
                                    key={environment.id}
                                    type="button"
                                    onClick={() =>
                                        handleEnvironmentChange(environment)
                                    }
                                    className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${environment.id === environmentId
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    {environment.name}
                                </button>
                            ))
                        )}

                        {currentEnvironment && (
                            <span className="ml-auto hidden shrink-0 text-xs text-muted-foreground md:block">
                                {currentProject?.name} /{" "}
                                {currentEnvironment.name}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}