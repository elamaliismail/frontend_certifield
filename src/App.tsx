import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppLayout } from "./layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientsPage } from "./pages/PatientsPage";
import { DossierPage } from "./pages/DossierPage";
import { DocumentPage } from "./pages/DocumentPage";
import { DocumentsPage, SignaturePage, ValidationPage } from "./pages/DocumentsPage";
import { UsersPage } from "./pages/UsersPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

// Réservé au rôle Administrateur (page /app/utilisateurs) — pas de
// vérification côté serveur sur les routes /users du mcp-server (même
// posture que le reste du projet, qui n'a aucune middleware
// d'autorisation), donc ce garde-fou front-end est le seul rempart.
function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "Administrateur") {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route
              path="dossiers"
              element={<Navigate to="/app/patients" replace />}
            />
            <Route path="dossiers/:patientId" element={<DossierPage />} />
            <Route
              path="dossiers/:patientId/documents/:documentId"
              element={<DocumentPage />}
            />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="validation" element={<ValidationPage />} />
            <Route path="signature" element={<SignaturePage />} />
            <Route
              path="recherche"
              element={<PlaceholderPage title="Recherche multi-critères" />}
            />
            <Route
              path="utilisateurs"
              element={
                <RequireAdmin>
                  <UsersPage />
                </RequireAdmin>
              }
            />
            <Route
              path="audit"
              element={
                <RequireAdmin>
                  <AuditLogsPage />
                </RequireAdmin>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
