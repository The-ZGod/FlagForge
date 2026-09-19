import { useEffect, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";

import { Sidebar } from "@/components/layout/Sidebar";
import { getProjects, type Project } from "@/lib/projects";
import {
    getEnvironments,
    type Environment,
} from "@/lib/environments";

export function AppLayout() {
    const { projectId, environmentId } = useParams();
    const location = useLocation();

    const [project, setProject] = useState<Project | null>(null);
    const [environment, setEnvironment] =
        useState<Environment | null>(null);

    useEffect(() => {
        if (!projectId) {
            setProject(null);
            return;
        }

        async function loadProject() {
            try {
                const projects = await getProjects();

                const currentProject = projects.find(
                    (item) => item.id === projectId
                );

                setProject(currentProject ?? null);
            } catch {
                setProject(null);
            }
        }

        void loadProject();
    }, [projectId]);

    useEffect(() => {
        if (!projectId || !environmentId) {
            setEnvironment(null);
            return;
        }

        async function loadEnvironment() {
            try {
                const environments =
                    await getEnvironments(projectId!);

                const currentEnvironment =
                    environments.find(
                        (item) => item.id === environmentId
                    );

                setEnvironment(
                    currentEnvironment ?? null
                );
            } catch {
                setEnvironment(null);
            }
        }

        void loadEnvironment();
    }, [projectId, environmentId]);

    function getHeaderContent() {
        if (environment) {
            return {
                title: project?.name ?? "Project",
                subtitle: environment.name,
            };
        }

        if (location.pathname === "/dashboard") {
            return {
                title: "Dashboard",
                subtitle: "Overview",
            };
        }

        if (location.pathname === "/projects") {
            return {
                title: "Projects",
                subtitle: "All projects",
            };
        }

        if (location.pathname === "/activity") {
            return {
                title: "Activity",
                subtitle: "Recent changes",
            };
        }

        if (location.pathname === "/settings") {
            return {
                title: "Settings",
                subtitle: "Account settings",
            };
        }

        return {
            title: "FlagForge",
            subtitle: "Feature management",
        };
    }

    const header = getHeaderContent();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex min-h-screen">
                <aside className="sticky top-0 h-screen shrink-0">
                    <Sidebar />
                </aside>

                <main className="min-w-0 flex-1">
                    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur">
                        <div>
                            <h2 className="text-sm font-semibold tracking-tight">
                                {header.title}
                            </h2>

                            <p className="text-xs text-muted-foreground">
                                {header.subtitle}
                            </p>
                        </div>
                    </header>

                    <div className="min-h-[calc(100vh-4rem)]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}