import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { useAuth } from "../context/AuthContext";
import { DocumentsProvider } from "../context/DocumentsContext";

const TITLES: Record<string, string> = {
  "/app/dashboard": "Tableau de bord",
  "/app/patients": "Patients",
  "/app/dossiers": "Dossiers médicaux",
  "/app/documents": "Documents",
  "/app/validation": "Validation",
  "/app/signature": "Signature",
  "/app/recherche": "Recherche",
  "/app/utilisateurs": "Utilisateurs",
  "/app/audit": "Journal d'audit",
};

export function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const title =
    TITLES[location.pathname] ??
    (location.pathname.includes("/documents/")
      ? "Document"
      : location.pathname.startsWith("/app/dossiers/")
        ? "Dossier médical"
        : "Dossier Patient Numérique");

  return (
    <DocumentsProvider>
      <div className="flex h-screen overflow-hidden bg-surface">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar title={title} />
          <main className="flex-1 overflow-y-auto p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </DocumentsProvider>
  );
}
