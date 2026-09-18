import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex min-h-screen">
                <Sidebar />

                <main className="flex-1">
                    <header className="flex h-16 items-center justify-between border-b px-6">
                        <div>
                            <h2 className="text-sm font-medium">
                                Evaluation Demo
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Development
                            </p>
                        </div>
                    </header>

                    <Outlet />
                </main>
            </div>
        </div>
    );
}