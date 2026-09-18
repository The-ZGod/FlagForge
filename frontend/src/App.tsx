import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Projects } from "@/pages/Projects";
import { Environments } from "@/pages/Environments";
import { FeatureFlags } from "@/pages/FeatureFlags";
import { Settings } from "@/pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route
              path="/projects/:projectId"
              element={<Environments />}
            />
            <Route
              path="/projects/:projectId/environments/:environmentId"
              element={<FeatureFlags />}
            />
            <Route path="/feature-flags" element={<FeatureFlags />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;