import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { listAllDocumentsRequest, WorkflowError } from "../lib/api";
import { getMockAllDocuments } from "../lib/mockDocuments";
import type { PatientDocument } from "../types";

interface DocumentsContextValue {
  documents: PatientDocument[];
  isLoading: boolean;
}

const DocumentsContext = createContext<DocumentsContextValue | undefined>(undefined);

// Récupère list_all_documents UNE SEULE FOIS par session (au montage de
// AppLayout), partagé entre Topbar (notifications) et DashboardPage (stats)
// — sans ce partage, chaque consommateur déclenchait son propre appel au
// workflow à chaque visite du dashboard.
export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    listAllDocumentsRequest()
      .then((docs) => {
        if (!cancelled) setDocuments(docs);
      })
      .catch((err) => {
        if (!cancelled && err instanceof WorkflowError) {
          setDocuments(getMockAllDocuments());
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DocumentsContext.Provider value={{ documents, isLoading }}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocumentsFeed() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocumentsFeed must be used within DocumentsProvider");
  return ctx;
}
