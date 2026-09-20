import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

import { LandingPage } from "@/pages/LandingPage";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Environments } from "@/pages/Environments";
import { FeatureFlags } from "@/pages/FeatureFlags";
import { Settings } from "@/pages/Settings";
import { EvaluationPlayground } from "@/pages/EvaluationPlayground";
import { Activity } from "@/pages/Activity";
import { FeatureFlagDetail } from "@/pages/FeatureFlagDetail";
import { ApiKeys } from "@/pages/ApiKeys";
import { Docs } from "@/pages/Docs";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Public / Semi-Public Routes */}
                <Route path="/login" element={<Login />} />

                {/* Docs page rendered with AppLayout so users can view docs */}
                <Route
                    path="/docs"
                    element={
                        <div className="min-h-screen bg-background text-foreground flex flex-col">
                            <Docs />
                        </div>
                    }
                />

                {/* Protected Application Workspace */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Redirect legacy /projects to Dashboard */}
                        <Route
                            path="/projects"
                            element={<Navigate to="/dashboard" replace />}
                        />

                        <Route
                            path="/projects/:projectId"
                            element={<Environments />}
                        />

                        <Route
                            path="/projects/:projectId/environments/:environmentId"
                            element={<FeatureFlags />}
                        />

                        <Route
                            path="/projects/:projectId/environments/:environmentId/evaluate"
                            element={<EvaluationPlayground />}
                        />

                        <Route
                            path="/evaluation"
                            element={<EvaluationPlayground />}
                        />

                        <Route
                            path="/projects/:projectId/environments/:environmentId/flags/:flagId"
                            element={<FeatureFlagDetail />}
                        />

                        <Route
                            path="/projects/:projectId/environments/:environmentId/api-keys"
                            element={<ApiKeys />}
                        />

                        <Route
                            path="/api-keys"
                            element={<ApiKeys />}
                        />

                        <Route path="/activity" element={<Activity />} />

                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Route>

                {/* Catch-all fallback */}
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;