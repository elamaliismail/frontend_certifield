import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, FolderOpen } from "lucide-react";
import { listAllDocumentsRequest, WorkflowError } from "../lib/api";
import { getMockAllDocuments } from "../lib/mockDocuments";
import { ENGINE_LABELS } from "../lib/extraction";
import { DOCUMENT_STATUS_META } from "../lib/statusStyles";
import type { DocumentStatus, PatientDocument } from "../types";
import {
  Badge,
  Banner,
  DataTable,
  EmptyState,
  PageHeader,
  SearchBar,
  type Column,
  pageContainer,
} from "../components/ui";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function patientLabel(doc: PatientDocument): string {
  if (doc.patientFirstName || doc.patientLastName) {
    return `${doc.patientFirstName ?? ""} ${doc.patientLastName ?? ""}`.trim();
  }
  return "Patient inconnu";
}

interface DocumentsListPageProps {
  statusFilter?: DocumentStatus;
  description: string;
  emptyMessage: string;
  webhookEnvVarHint: string;
}

function DocumentsListPage({
  statusFilter,
  description,
  emptyMessage,
  webhookEnvVarHint,
}: DocumentsListPageProps) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [query, setQuery] = useState("");
  const [isDemoData, setIsDemoData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    listAllDocumentsRequest(statusFilter)
      .then((data) => {
        if (!cancelled) {
          setDocuments(data);
          setIsDemoData(false);
        }
      })
      .catch((err) => {
        if (!cancelled && err instanceof WorkflowError) {
          setDocuments(getMockAllDocuments(statusFilter));
          setIsDemoData(true);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return documents;
    return documents.filter((doc) =>
      `${patientLabel(doc)} ${doc.fileName}`.toLowerCase().includes(normalized),
    );
  }, [documents, query]);

  const columns: Column<PatientDocument>[] = [
    {
      key: "patient",
      header: "Patient",
      render: (doc) => (
        <span className="font-medium text-ink-900">{patientLabel(doc)}</span>
      ),
    },
    {
      key: "document",
      header: "Document",
      render: (doc) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-hc-primary/10 text-hc-primary">
            <FileText size={15} />
          </span>
          <span className="truncate text-ink-600">{doc.fileName}</span>
        </div>
      ),
    },
    {
      key: "engine",
      header: "Moteur",
      render: (doc) => (doc.engine ? ENGINE_LABELS[doc.engine] : "—"),
    },
    {
      key: "status",
      header: "Statut",
      render: (doc) => (
        <Badge tone={DOCUMENT_STATUS_META[doc.status].tone}>
          {DOCUMENT_STATUS_META[doc.status].label}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Importé le",
      render: (doc) => formatDate(doc.createdAt),
    },
  ];

  return (
    <motion.div
      variants={pageContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {isDemoData && (
        <Banner>
          Workflow Documents non configuré — données de démonstration affichées
          (voir {webhookEnvVarHint}).
        </Banner>
      )}

      <PageHeader
        description={description}
        actions={
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Rechercher par patient ou fichier..."
          />
        }
      />

      <DataTable
        columns={columns}
        rows={filteredDocuments}
        rowKey={(doc) => doc.id}
        isLoading={isLoading}
        onRowClick={(doc) =>
          navigate(`/app/dossiers/${doc.patientId}/documents/${doc.id}`, {
            state: { document: doc },
          })
        }
        empty={
          <EmptyState
            icon={FolderOpen}
            title="Aucun document"
            description={emptyMessage}
          />
        }
      />
    </motion.div>
  );
}

export function DocumentsPage() {
  return (
    <DocumentsListPage
      description="Tous les documents importés, tous patients confondus."
      emptyMessage="Aucun document ne correspond à cette recherche."
      webhookEnvVarHint="VITE_DOCUMENTS_QUEUE_WEBHOOK_URL"
    />
  );
}

export function ValidationPage() {
  return (
    <DocumentsListPage
      statusFilter="a_valider"
      description="File d'attente des documents à vérifier avant signature."
      emptyMessage="Aucun document en attente de validation."
      webhookEnvVarHint="VITE_DOCUMENTS_QUEUE_WEBHOOK_URL"
    />
  );
}

export function SignaturePage() {
  return (
    <DocumentsListPage
      statusFilter="valide"
      description="Documents validés en attente de signature électronique."
      emptyMessage="Aucun document en attente de signature."
      webhookEnvVarHint="VITE_DOCUMENTS_QUEUE_WEBHOOK_URL"
    />
  );
}
