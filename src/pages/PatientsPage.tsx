import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Users } from "lucide-react";
import {
  createPatientRequest,
  listPatientsRequest,
  WorkflowError,
} from "../lib/api";
import { MOCK_PATIENTS } from "../lib/mockPatients";
import { Modal } from "../components/Modal";
import { PatientForm } from "../components/PatientForm";
import { Toast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { PATIENT_STATUS_META } from "../lib/statusStyles";
import type { Patient, PatientFormInput, PatientStatus } from "../types";
import {
  Avatar,
  Badge,
  Banner,
  Button,
  DataTable,
  EmptyState,
  PageHeader,
  Pagination,
  SearchBar,
  Tabs,
  type Column,
  pageContainer,
} from "../components/ui";

const PAGE_SIZE = 8;

type StatusTab = "all" | PatientStatus;

const STATUS_TABS: { id: StatusTab; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "actif", label: "Actifs" },
  { id: "archivé", label: "Archivés" },
];

function formatDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

export function PatientsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [page, setPage] = useState(1);
  const [isDemoData, setIsDemoData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listPatientsRequest()
      .then((data) => {
        if (!cancelled) {
          setPatients(data);
          setIsDemoData(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPatients(MOCK_PATIENTS);
          setIsDemoData(true);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPatients = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return patients.filter((p) => {
      if (statusTab !== "all" && p.status !== statusTab) return false;
      if (!normalized) return true;
      return `${p.firstName} ${p.lastName} ${p.cin}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [patients, query, statusTab]);

  const pageCount = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedPatients = filteredPatients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [query, statusTab]);

  async function handleCreate(input: PatientFormInput) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const patient = await createPatientRequest(input, user?.id ?? "");
      setPatients((prev) => [patient, ...prev]);
      setIsFormOpen(false);
      setToastMessage(
        `Patient ${patient.firstName} ${patient.lastName} ajouté avec succès`,
      );
    } catch (err) {
      if (err instanceof WorkflowError && isDemoData) {
        // Pas de workflow configuré : on simule la création localement pour
        // pouvoir continuer à tester la vue.
        const patient: Patient = {
          ...input,
          id: `local_${crypto.randomUUID()}`,
          status: "actif",
          createdAt: new Date().toISOString(),
        };
        setPatients((prev) => [patient, ...prev]);
        setIsFormOpen(false);
        setToastMessage(
          `Patient ${patient.firstName} ${patient.lastName} ajouté avec succès`,
        );
      } else {
        setFormError(
          err instanceof WorkflowError
            ? err.message
            : "Une erreur inattendue est survenue.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: Column<Patient>[] = [
    {
      key: "patient",
      header: "Patient",
      render: (patient) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${patient.firstName} ${patient.lastName}`} />
          <div>
            <div className="font-semibold text-ink-900">
              {patient.firstName} {patient.lastName}
            </div>
            <div className="text-xs text-ink-400">{patient.email ?? "—"}</div>
          </div>
        </div>
      ),
    },
    { key: "cin", header: "CIN", render: (p) => p.cin },
    { key: "phone", header: "Téléphone", render: (p) => p.phone ?? "—" },
    {
      key: "birthDate",
      header: "Naissance",
      render: (p) => formatDate(p.birthDate),
    },
    {
      key: "status",
      header: "Statut",
      render: (p) => (
        <Badge tone={PATIENT_STATUS_META[p.status].tone} dot>
          {PATIENT_STATUS_META[p.status].label}
        </Badge>
      ),
    },
  ];

  return (
    <motion.div
      variants={pageContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}

      {isDemoData && (
        <Banner>
          Workflow Patients non configuré — données de démonstration affichées
          (voir VITE_PATIENTS_LIST_WEBHOOK_URL).
        </Banner>
      )}

      <PageHeader
        description="Répertoire des patients — recherche, filtres et création de dossiers."
        actions={
          <Button shine fullWidth={false} onClick={() => setIsFormOpen(true)}>
            <Plus size={16} />
            Nouveau patient
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={STATUS_TABS} active={statusTab} onChange={setStatusTab} />
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Rechercher par nom ou CIN..."
        />
      </div>

      <DataTable
        columns={columns}
        rows={pagedPatients}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        skeletonRows={PAGE_SIZE}
        onRowClick={(patient) =>
          navigate(`/app/dossiers/${patient.id}`, { state: { patient } })
        }
        empty={
          <EmptyState
            icon={Users}
            title="Aucun patient"
            description="Aucun patient ne correspond à cette recherche."
          />
        }
        footer={
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
            total={filteredPatients.length}
            pageSize={PAGE_SIZE}
          />
        }
      />

      {isFormOpen && (
        <Modal title="Nouveau patient" onClose={() => setIsFormOpen(false)}>
          {formError && (
            <Banner tone="red" className="mb-4">
              {formError}
            </Banner>
          )}
          <PatientForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
            submitting={isSubmitting}
          />
        </Modal>
      )}
    </motion.div>
  );
}
