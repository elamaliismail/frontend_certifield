import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, RefreshCcw } from "lucide-react";
import { listAuditLogsRequest, WorkflowError } from "../lib/api";
import { AUDIT_ACTION_META } from "../lib/statusStyles";
import type { AuditAction, AuditLogEntry } from "../types";
import {
  Badge,
  Banner,
  Button,
  DataTable,
  EmptyState,
  PageHeader,
  SearchBar,
  type Column,
  pageContainer,
} from "../components/ui";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEntity(entity: string): string {
  return entity.replace(/_/g, " ");
}

function detailsPreview(details?: Record<string, unknown>): string {
  if (!details) return "—";
  const entries = Object.entries(details).slice(0, 2);
  if (entries.length === 0) return "—";
  return entries
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ");
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");

  function loadLogs() {
    setIsLoading(true);
    setError(null);

    listAuditLogsRequest()
      .then((data) => setLogs(data))
      .catch((err) => {
        setError(
          err instanceof WorkflowError
            ? err.message
            : "Impossible de charger le journal d'audit.",
        );
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return logs.filter((log) => {
      if (actionFilter !== "all" && log.action !== actionFilter) return false;
      if (!normalized) return true;

      return [
        log.userName,
        log.patientName,
        log.documentName,
        log.entity,
        log.action,
        detailsPreview(log.details),
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalized));
    });
  }, [actionFilter, logs, query]);

  const columns: Column<AuditLogEntry>[] = [
    {
      key: "date",
      header: "Date",
      render: (log) => (
        <span className="whitespace-nowrap">{formatDateTime(log.createdAt)}</span>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (log) => (
        <Badge tone={AUDIT_ACTION_META[log.action].tone} dot>
          {AUDIT_ACTION_META[log.action].label}
        </Badge>
      ),
    },
    {
      key: "entity",
      header: "Entité",
      render: (log) => (
        <span className="font-medium capitalize text-ink-900">
          {formatEntity(log.entity)}
        </span>
      ),
    },
    {
      key: "user",
      header: "Utilisateur",
      render: (log) => log.userName ?? "Système",
    },
    {
      key: "context",
      header: "Contexte",
      render: (log) => (
        <div>
          <div>{log.patientName ?? "—"}</div>
          <div className="text-xs text-ink-400">{log.documentName ?? "—"}</div>
        </div>
      ),
    },
    {
      key: "details",
      header: "Détails",
      render: (log) => detailsPreview(log.details),
    },
  ];

  return (
    <motion.div
      variants={pageContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <PageHeader
        description="Suivi des créations, modifications, validations, signatures et suppressions réalisées dans l'application."
        actions={
          <Button
            variant="outline"
            fullWidth={false}
            onClick={loadLogs}
            disabled={isLoading}
          >
            <RefreshCcw size={16} />
            {isLoading ? "Actualisation..." : "Actualiser"}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Rechercher par utilisateur, patient, document..."
        />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as AuditAction | "all")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-hc-primary focus:ring-2 focus:ring-hc-primary/20"
        >
          <option value="all">Toutes les actions</option>
          {(Object.keys(AUDIT_ACTION_META) as AuditAction[]).map((action) => (
            <option key={action} value={action}>
              {AUDIT_ACTION_META[action].label}
            </option>
          ))}
        </select>
      </div>

      {error && <Banner tone="red">{error}</Banner>}

      <DataTable
        columns={columns}
        rows={filteredLogs}
        rowKey={(log) => log.id}
        isLoading={isLoading}
        skeletonRows={6}
        empty={
          <EmptyState
            icon={Activity}
            title="Aucun événement"
            description="Aucun événement d'audit ne correspond aux filtres."
          />
        }
      />
    </motion.div>
  );
}
