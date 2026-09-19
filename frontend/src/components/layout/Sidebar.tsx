import { NavLink } from "react-router-dom";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth";

import {
    Activity,
    FolderKanban,
    History,
    Settings,
} from "lucide-react";

const navigationItems = [
    {
        label: "Dashboard",
        icon: Activity,
        path: "/dashboard",
    },
    {
        label: "Projects",
        icon: FolderKanban,
        path: "/projects",
    },
    {
        label: "Activity",
        icon: History,
        path: "/activity",
    },
];

export function Sidebar() {
    return (
        <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:block">
            <div className="flex min-h-screen flex-col">
                <div className="border-b px-6 py-5">
                    <h1 className="text-lg font-semibold tracking-tight">
                        FlagForge
                    </h1>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Feature management
                    </p>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                                        ? "bg-foreground text-background font-medium shadow-sm"
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

                <div className="border-t p-4">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                                ? "bg-foreground text-background font-medium shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`
                        }
                    >
                        <Settings className="size-4" />
                        Settings
                    </NavLink>

                    <button
                        type="button"
                        onClick={() => {
                            logout();
                            window.location.href = "/login";
                        }}
                        className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <LogOut className="size-4" />
                        Sign out
                    </button>
                </div>
            </div>
        </aside>
    );
}