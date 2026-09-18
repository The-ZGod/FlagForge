import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Sidebar } from "@/components/layout/Sidebar";

import { Dashboard } from "@/pages/Dashboard";
import { Projects } from "@/pages/Projects";
import { Environments } from "@/pages/Environments";
import { FeatureFlags } from "@/pages/FeatureFlags";
import { Settings } from "@/pages/Settings";

function App() {
  return (
    <BrowserRouter>
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

            <Routes>
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/projects"
                element={<Projects />}
              />

              <Route
                path="/environments"
                element={<Environments />}
              />

              <Route
                path="/feature-flags"
                element={<FeatureFlags />}
              />

              <Route
                path="/settings"
                element={<Settings />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;