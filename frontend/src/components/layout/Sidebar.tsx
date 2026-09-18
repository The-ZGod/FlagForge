import {
    Activity,
    Flag,
    FolderKanban,
    Layers3,
    Settings,
} from "lucide-react";

const navigationItems = [
    {
        label: "Dashboard",
        icon: Activity,
    },
    {
        label: "Projects",
        icon: FolderKanban,
    },
    {
        label: "Environments",
        icon: Layers3,
    },
    {
        label: "Feature Flags",
        icon: Flag,
    },
];

interface SidebarProps {
    activeItem?: string;
}

export function Sidebar({
    activeItem = "Dashboard",
}: SidebarProps) {
    return (
        <aside className="hidden w-64 shrink-0 border-r bg-muted/20 md:block">
            <div className="flex min-h-screen flex-col">
                <div className="border-b p-6">
                    <h1 className="text-xl font-semibold tracking-tight">
                        FlagForge
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Feature management
                    </p>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.label === activeItem;

                        return (
                            <button
                                key={item.label}
                                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                                        ? "bg-muted font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <Icon className="size-4" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="border-t p-4">
                    <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <Settings className="size-4" />
                        Settings
                    </button>
                </div>
            </div>
        </aside>
    );
}