import { Outlet } from "react-router-dom";
import { TopNavigation } from "@/components/layout/TopNavigation";

export function AppLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
            <TopNavigation />

            <main className="flex-1 container mx-auto px-4">
                <Outlet />
            </main>
        </div>
    );
}