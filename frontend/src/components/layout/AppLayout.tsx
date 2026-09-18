import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex min-h-screen">
                {/* Fixed-height sidebar */}
                <aside className="sticky top-0 h-screen shrink-0">
                    <Sidebar />
                </aside>

                {/* Only this area should grow and scroll */}
                <main className="min-w-0 flex-1">
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