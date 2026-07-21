import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Clock,
  FileCheck2,
  ShieldCheck,
  ChevronRight,
  Inbox,
  BellRing,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDocumentsFeed } from "../context/DocumentsContext";
import {
  listPatientsRequest,
  listUserStatsRequest,
  WorkflowError,
} from "../lib/api";
import { MOCK_PATIENTS } from "../lib/mockPatients";
import { buildActivityFeed, formatRelativeTime } from "../lib/activity";
import { ROLE_META } from "../lib/statusStyles";
import type { PatientDocument, UserActivityStats } from "../types";
import {
  Avatar,
  Badge,
  Banner,
  Card,
  EmptyState,
  SectionCard,
  SkeletonText,
  StatCard,
  fadeUp,
  pageContainer,
} from "../components/ui";

function patientLabel(doc: PatientDocument): string {
  const name = `${doc.patientFirstName ?? ""} ${doc.patientLastName ?? ""}`.trim();
  return name || "Patient inconnu";
}

function averageConfidence(doc: PatientDocument): number | null {
  const scores = Object.values(doc.extractedFields)
    .filter((field): field is NonNullable<typeof field> => Boolean(field))
    .map((field) => field.confidence);
  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { documents, isLoading: isDocumentsLoading } = useDocumentsFeed();
  const [patientCount, setPatientCount] = useState<number | null>(null);
  const [isPatientsLoading, setIsPatientsLoading] = useState(true);
  const isAdmin = user?.role === "Administrateur";
  const [userStats, setUserStats] = useState<UserActivityStats[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(isAdmin);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listPatientsRequest()
      .then((patients) => {
        if (!cancelled) setPatientCount(patients.length);
      })
      .catch((err) => {
        if (!cancelled && err instanceof WorkflowError) {
          setPatientCount(MOCK_PATIENTS.length);
        }
      })
      .finally(() => {
        if (!cancelled) setIsPatientsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    listUserStatsRequest()
      .then((stats) => {
        if (!cancelled) setUserStats(stats);
      })
      .catch((err) => {
        if (!cancelled) {
          setStatsError(
            err instanceof WorkflowError
              ? err.message
              : "Impossible de charger les statistiques.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsStatsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const isLoading = isDocumentsLoading || isPatientsLoading;
  const pendingCount = documents.filter((doc) => doc.status === "a_valider").length;
  const validatedCount = documents.filter((doc) => doc.status === "valide").length;
  const signedCount = documents.filter((doc) => doc.status === "signe").length;

  const stats = [
    {
      label: "Patients",
      value: patientCount ?? "—",
      hint: "dossiers actifs",
      icon: Users,
      tone: "blue" as const,
    },
    {
      label: "En attente",
      value: pendingCount,
      hint: "documents à valider",
      icon: Clock,
      tone: "amber" as const,
    },
    {
      label: "Validés",
      value: validatedCount,
      hint: "en attente de signature",
      icon: FileCheck2,
      tone: "teal" as const,
    },
    {
      label: "Signés",
      value: signedCount,
      hint: "archivés",
      icon: ShieldCheck,
      tone: "green" as const,
    },
  ];

  const pendingDocs = documents
    .filter((doc) => doc.status === "a_valider" || doc.status === "a_corriger")
    .slice(0, 5);

  const activity = buildActivityFeed(documents).slice(0, 6);

  return (
    <motion.div
      variants={pageContainer}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.p variants={fadeUp} className="text-sm text-ink-600">
        Bonjour <span className="font-semibold text-ink-900">{user?.name}</span>,
        voici l'activité du dossier patient numérique.
      </motion.p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} loading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <SectionCard
          animate
          icon={<Inbox size={18} />}
          title="Documents en attente de validation"
          description="Champs extraits par OCR + IA à vérifier avant signature."
          action={
            <button
              onClick={() => navigate("/app/validation")}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-hc-primary transition-colors hover:bg-hc-primary/5"
            >
              Voir tout
              <ChevronRight size={16} />
            </button>
          }
        >
          {isLoading && <SkeletonText lines={3} />}
          {!isLoading && pendingDocs.length === 0 && (
            <EmptyState
              icon={Inbox}
              title="Rien à valider"
              description="Aucun document en attente de validation pour le moment."
              className="py-8"
            />
          )}
          <div className="space-y-3">
            {!isLoading &&
              pendingDocs.map((doc) => {
                const confidence = averageConfidence(doc);
                return (
                  <div
                    key={doc.id}
                    onClick={() =>
                      navigate(
                        `/app/dossiers/${doc.patientId}/documents/${doc.id}`,
                        { state: { document: doc } },
                      )
                    }
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-100 bg-hc-bg px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-hc-primary/30 hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink-900">
                        {patientLabel(doc)}
                      </div>
                      <div className="truncate text-xs text-ink-400">
                        {doc.fileName}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {confidence !== null && (
                        <span className="text-xs text-ink-600">
                          confiance{" "}
                          <span className="font-semibold text-ink-900">
                            {Math.round(confidence * 100)}%
                          </span>
                        </span>
                      )}
                      <Badge tone={doc.status === "a_corriger" ? "red" : "amber"}>
                        {doc.status === "a_corriger" ? "À corriger" : "À valider"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </SectionCard>

        <SectionCard
          animate
          icon={<BellRing size={18} />}
          title="Notifications"
          description="Dernières alertes"
        >
          {isLoading && <SkeletonText lines={4} />}
          {!isLoading && activity.length === 0 && (
            <p className="text-sm text-ink-400">Aucune activité récente.</p>
          )}
          <div className="space-y-4">
            {!isLoading &&
              activity.map((event) => (
                <div
                  key={event.id}
                  className="border-l-2 border-hc-primary/30 pl-3"
                >
                  <div className="text-sm font-semibold text-ink-900">
                    {event.title}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-600">
                    {event.detail}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-400">
                    {formatRelativeTime(event.timestamp)}
                  </div>
                </div>
              ))}
          </div>
        </SectionCard>
      </div>

      {isAdmin && (
        <SectionCard
          animate
          icon={<Users size={18} />}
          title="Activité par utilisateur"
          description="Documents importés, signés et consultations saisies par chaque membre du personnel soignant."
        >
          {statsError && (
            <Banner tone="red" className="mb-4">
              {statsError}
            </Banner>
          )}

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-hc-bg text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <tr>
                    <th className="px-4 py-2.5">Utilisateur</th>
                    <th className="px-4 py-2.5">Rôle</th>
                    <th className="px-4 py-2.5">Documents importés</th>
                    <th className="px-4 py-2.5">Documents signés</th>
                    <th className="px-4 py-2.5">Consultations</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.map((stat) => (
                    <tr
                      key={stat.userId}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={stat.fullName} size="sm" />
                          <span className="font-medium text-ink-900">
                            {stat.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone={ROLE_META[stat.role]?.tone ?? "slate"}>
                          {stat.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-ink-600">
                        {stat.documentsUploaded}
                      </td>
                      <td className="px-4 py-2.5 text-ink-600">
                        {stat.documentsSigned}
                      </td>
                      <td className="px-4 py-2.5 text-ink-600">
                        {stat.consultationsCreated}
                      </td>
                    </tr>
                  ))}

                  {!isStatsLoading && userStats.length === 0 && !statsError && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-ink-400"
                      >
                        Aucun compte Clinicien/Opérateur pour le moment.
                      </td>
                    </tr>
                  )}

                  {isStatsLoading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-ink-400"
                      >
                        Chargement des statistiques...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </SectionCard>
      )}
    </motion.div>
  );
}
