import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  ClipboardList,
  FileText,
  HeartPulse,
  Mail,
  MessageSquareText,
  Pencil,
  Phone,
  Plus,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import {
  askPatientQuestionRequest,
  createConsultationRequest,
  extractDocumentRequest,
  getMedicalRecordRequest,
  listConsultationsRequest,
  listDocumentsRequest,
  updateMedicalRecordRequest,
  uploadDocumentFileRequest,
  WorkflowError,
} from "../lib/api";
import { MOCK_PATIENTS } from "../lib/mockPatients";
import { getMockMedicalRecord } from "../lib/mockMedicalRecords";
import { createMockDocument, getMockDocuments } from "../lib/mockDocuments";
import { createMockConsultation, getMockConsultations } from "../lib/mockConsultations";
import { useAuth } from "../context/AuthContext";
import { Toast } from "../components/Toast";
import { Modal } from "../components/Modal";
import { DocumentUploadModal } from "../components/DocumentUploadModal";
import { ConsultationForm } from "../components/ConsultationForm";
import { validateMedicalField } from "../lib/validation";
import { DOCUMENT_STATUS_META, PATIENT_STATUS_META } from "../lib/statusStyles";
import type {
  Consultation,
  ConsultationFormInput,
  MedicalRecord,
  MedicalRecordFormInput,
  Patient,
  PatientDocument,
  PatientQuestionResponse,
} from "../types";
import {
  Avatar,
  Badge,
  Banner,
  Breadcrumb,
  Button,
  Card,
  EmptyState,
  SectionCard,
  SkeletonText,
  Tabs,
  type TabItem,
  fadeUp,
  pageContainer,
} from "../components/ui";

type DossierTab = "profil" | "consultations" | "documents" | "assistant";

function formatDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

const FIELDS: { key: keyof MedicalRecordFormInput; label: string }[] = [
  { key: "allergies", label: "Allergies" },
  { key: "chronicConditions", label: "Maladies chroniques" },
  { key: "medicalHistory", label: "Antécédents" },
  { key: "currentTreatments", label: "Traitements en cours" },
  { key: "vaccinations", label: "Vaccinations" },
];

export function DossierPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const statePatient = (location.state as { patient?: Patient } | null)
    ?.patient;

  const [patient, setPatient] = useState<Patient | null>(statePatient ?? null);
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [isDemoData, setIsDemoData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<MedicalRecordFormInput>({});
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof MedicalRecordFormInput, string>>
  >({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(true);
  const [isDocumentsDemo, setIsDocumentsDemo] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isConsultationsLoading, setIsConsultationsLoading] = useState(true);
  const [isConsultationsDemo, setIsConsultationsDemo] = useState(false);
  const [isConsultationFormOpen, setIsConsultationFormOpen] = useState(false);
  const [isCreatingConsultation, setIsCreatingConsultation] = useState(false);
  const [consultationError, setConsultationError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [questionResponse, setQuestionResponse] = useState<PatientQuestionResponse | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<DossierTab>("profil");

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    getMedicalRecordRequest(patientId)
      .then(({ patient: p, medicalRecord }) => {
        if (cancelled) return;
        setPatient(p);
        setRecord(medicalRecord);
        setForm({
          allergies: medicalRecord.allergies ?? "",
          chronicConditions: medicalRecord.chronicConditions ?? "",
          medicalHistory: medicalRecord.medicalHistory ?? "",
          currentTreatments: medicalRecord.currentTreatments ?? "",
          vaccinations: medicalRecord.vaccinations ?? "",
        });
        setIsDemoData(false);
      })
      .catch(() => {
        if (cancelled) return;
        const fallbackPatient =
          statePatient ?? MOCK_PATIENTS.find((p) => p.id === patientId) ?? null;
        const mockRecord = getMockMedicalRecord(patientId);
        setPatient(fallbackPatient);
        setRecord(mockRecord);
        setForm({
          allergies: mockRecord.allergies ?? "",
          chronicConditions: mockRecord.chronicConditions ?? "",
          medicalHistory: mockRecord.medicalHistory ?? "",
          currentTreatments: mockRecord.currentTreatments ?? "",
          vaccinations: mockRecord.vaccinations ?? "",
        });
        setIsDemoData(true);
        if (!fallbackPatient) {
          setLoadError("Patient introuvable.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    setIsDocumentsLoading(true);

    listDocumentsRequest(patientId)
      .then((docs) => {
        if (cancelled) return;
        setDocuments(docs);
        setIsDocumentsDemo(false);
      })
      .catch(() => {
        if (cancelled) return;
        setDocuments(getMockDocuments(patientId));
        setIsDocumentsDemo(true);
      })
      .finally(() => {
        if (!cancelled) setIsDocumentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    setIsConsultationsLoading(true);

    listConsultationsRequest(patientId)
      .then((data) => {
        if (cancelled) return;
        setConsultations(data);
        setIsConsultationsDemo(false);
      })
      .catch(() => {
        if (cancelled) return;
        setConsultations(getMockConsultations(patientId));
        setIsConsultationsDemo(true);
      })
      .finally(() => {
        if (!cancelled) setIsConsultationsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  async function handleCreateConsultation(input: ConsultationFormInput) {
    if (!patientId || !user) return;
    setIsCreatingConsultation(true);
    setConsultationError(null);
    try {
      const consultation = await createConsultationRequest(patientId, user.id, input);
      setConsultations((prev) => [consultation, ...prev]);
      setIsConsultationFormOpen(false);
      setToastMessage("Consultation ajoutée à l'historique");
    } catch (err) {
      if (err instanceof WorkflowError && isConsultationsDemo) {
        const consultation = createMockConsultation(patientId, user.name, input);
        setConsultations((prev) => [consultation, ...prev]);
        setIsConsultationFormOpen(false);
        setToastMessage("Consultation ajoutée à l'historique");
      } else {
        setConsultationError(
          err instanceof WorkflowError
            ? err.message
            : "Une erreur inattendue est survenue.",
        );
      }
    } finally {
      setIsCreatingConsultation(false);
    }
  }

  async function handleUpload(file: File) {
    if (!patientId) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      // 1) Upload direct (hors workflow) : crée le document côté Supabase et
      //    évite de faire transiter le base64 par le webhook/l'agent.
      const uploaded = await uploadDocumentFileRequest(patientId, file, user?.id ?? "");
      // 2) Le webhook d'extraction ne reçoit ensuite que l'id du document.
      const document = await extractDocumentRequest(
        patientId,
        uploaded.id,
        "jigsawstack",
        uploaded.status,
      );
      setDocuments((prev) => [document, ...prev]);
      setIsUploadOpen(false);
      navigate(`/app/dossiers/${patientId}/documents/${document.id}`, {
        state: { document },
      });
    } catch (err) {
      if (err instanceof WorkflowError && isDocumentsDemo) {
        const previewUrl = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "";
        const normalizedFileType: "image" | "pdf" = file.type.includes("pdf")
          ? "pdf"
          : "image";
        const document = createMockDocument(
          patientId,
          file.name,
          normalizedFileType,
          previewUrl,
          "jigsawstack",
        );
        setDocuments((prev) => [document, ...prev]);
        setIsUploadOpen(false);
        navigate(`/app/dossiers/${patientId}/documents/${document.id}`, {
          state: { document },
        });
      } else {
        setUploadError(
          err instanceof WorkflowError
            ? err.message
            : "Une erreur inattendue est survenue.",
        );
      }
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave() {
    if (!patientId) return;

    const nextErrors: Partial<Record<keyof MedicalRecordFormInput, string>> = {};
    FIELDS.forEach(({ key, label }) => {
      const error = validateMedicalField(form[key] ?? "", label);
      if (error) nextErrors[key] = error;
    });
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      const updated = await updateMedicalRecordRequest(patientId, form, user?.id ?? "");
      setRecord(updated);
      setIsEditing(false);
      setToastMessage("Dossier médical mis à jour");
    } catch (err) {
      if (err instanceof WorkflowError && isDemoData) {
        setRecord((prev) =>
          prev ? { ...prev, ...form, updatedAt: new Date().toISOString() } : prev,
        );
        setIsEditing(false);
        setToastMessage("Dossier médical mis à jour");
      } else {
        setToastMessage(
          err instanceof WorkflowError
            ? err.message
            : "Une erreur inattendue est survenue.",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAskQuestion() {
    if (!patientId) return;

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setQuestionError("Saisissez une question sur ce patient.");
      return;
    }

    setIsAskingQuestion(true);
    setQuestionError(null);

    try {
      const response = await askPatientQuestionRequest(
        patientId,
        trimmedQuestion,
        user?.id ?? "",
      );
      setQuestionResponse(response);
    } catch (err) {
      setQuestionResponse(null);
      setQuestionError(
        err instanceof WorkflowError
          ? err.message
          : "Une erreur inattendue est survenue.",
      );
    } finally {
      setIsAskingQuestion(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <SkeletonText lines={3} />
        </Card>
        <Card className="p-6">
          <SkeletonText lines={5} />
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <Card className="p-10">
        <EmptyState
          icon={FileText}
          title="Patient introuvable"
          description={loadError ?? "Ce dossier patient n'existe pas ou plus."}
          action={
            <Button fullWidth={false} onClick={() => navigate("/app/patients")}>
              Retour aux patients
            </Button>
          }
        />
      </Card>
    );
  }

  const statusMeta = PATIENT_STATUS_META[patient.status];

  const tabs: TabItem<DossierTab>[] = [
    { id: "profil", label: "Profil médical", icon: HeartPulse },
    {
      id: "consultations",
      label: "Consultations",
      icon: Stethoscope,
      count: consultations.length,
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      count: documents.length,
    },
    { id: "assistant", label: "Assistant IA", icon: Sparkles },
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
          Workflow Dossier médical non configuré — données de démonstration
          affichées (voir VITE_MEDICAL_RECORD_WEBHOOK_URL).
        </Banner>
      )}

      <motion.div variants={fadeUp}>
        <Breadcrumb
          items={[
            { label: "Patients", to: "/app/patients" },
            { label: `${patient.firstName} ${patient.lastName}` },
          ]}
        />
      </motion.div>

      {/* Patient profile header */}
      <motion.div
        variants={fadeUp}
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60"
      >
        <div className="flex flex-col gap-4 bg-gradient-to-br from-hc-primary to-hc-secondary px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              name={`${patient.firstName} ${patient.lastName}`}
              size="lg"
              className="bg-white/20 shadow-none ring-2 ring-white/40"
            />
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {patient.firstName} {patient.lastName}
              </h2>
              <p className="mt-0.5 text-sm text-white/80">
                CIN {patient.cin}
                {record?.recordNumber ? ` · Dossier ${record.recordNumber}` : ""}
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/30">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {statusMeta.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-slate-200/60 sm:grid-cols-4">
          {[
            { icon: Calendar, label: "Naissance", value: formatDate(patient.birthDate) },
            { icon: Phone, label: "Téléphone", value: patient.phone || "—" },
            { icon: Mail, label: "E-mail", value: patient.email || "—" },
            {
              icon: ClipboardList,
              label: "Créé le",
              value: formatDate(patient.createdAt),
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white px-5 py-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                <Icon size={13} />
                {label}
              </div>
              <div className="mt-1 truncate text-sm font-medium text-ink-900">
                {value}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </motion.div>

      {/* Profil médical */}
      {activeTab === "profil" && (
        <SectionCard
          animate
          icon={<HeartPulse size={18} />}
          title="Dossier médical"
          description="Informations cliniques structurées du patient."
          action={
            !isEditing && (
              <Button
                variant="ghost"
                fullWidth={false}
                onClick={() => {
                  setFormErrors({});
                  setIsEditing(true);
                }}
              >
                <Pencil size={14} />
                Modifier
              </Button>
            )
          }
        >
          {isEditing ? (
            <div className="space-y-4">
              {FIELDS.map(({ key, label }) => (
                <label
                  key={key}
                  className="block text-sm font-medium text-ink-900"
                >
                  {label}
                  <textarea
                    value={form[key] ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    onBlur={() =>
                      setFormErrors((prev) => ({
                        ...prev,
                        [key]:
                          validateMedicalField(form[key] ?? "", label) ??
                          undefined,
                      }))
                    }
                    rows={2}
                    className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-hc-primary focus:ring-2 focus:ring-hc-primary/20 ${
                      formErrors[key]
                        ? "border-status-red-fg/50"
                        : "border-slate-200"
                    }`}
                  />
                  {formErrors[key] && (
                    <span className="mt-1 block text-xs font-normal text-status-red-fg">
                      {formErrors[key]}
                    </span>
                  )}
                </label>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  fullWidth={false}
                  onClick={() => {
                    setFormErrors({});
                    setIsEditing(false);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  fullWidth={false}
                  disabled={isSaving}
                  onClick={handleSave}
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FIELDS.map(({ key, label }) => (
                <div
                  key={key}
                  className="rounded-xl border border-slate-100 bg-hc-bg p-4"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    {label}
                  </div>
                  <div className="mt-1.5 text-sm text-ink-900">
                    {record?.[key] || "Non renseigné"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Consultations timeline */}
      {activeTab === "consultations" && (
        <SectionCard
          animate
          icon={<Stethoscope size={18} />}
          title="Historique des consultations"
          description={
            isConsultationsDemo
              ? "Données de démonstration (voir VITE_CONSULTATIONS_LIST_WEBHOOK_URL)."
              : "Chronologie des consultations du patient."
          }
          action={
            <Button
              variant="ghost"
              fullWidth={false}
              onClick={() => {
                setConsultationError(null);
                setIsConsultationFormOpen(true);
              }}
            >
              <Plus size={14} />
              Ajouter
            </Button>
          }
        >
          {isConsultationsLoading && <SkeletonText lines={3} />}
          {!isConsultationsLoading && consultations.length === 0 && (
            <EmptyState
              icon={Stethoscope}
              title="Aucune consultation"
              description="Aucune consultation enregistrée pour ce patient."
              className="py-8"
            />
          )}

          {!isConsultationsLoading && consultations.length > 0 && (
            <ol className="relative space-y-6 border-l border-slate-200 pl-6">
              {consultations.map((consultation) => (
                <li key={consultation.id} className="relative">
                  <span className="absolute -left-[1.72rem] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-br from-hc-primary to-hc-secondary ring-4 ring-white" />
                  <div className="rounded-xl border border-slate-100 bg-hc-bg p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                        <Calendar size={14} className="shrink-0 text-hc-primary" />
                        {formatDate(consultation.consultationDate)}
                      </div>
                      {consultation.doctorName && (
                        <span className="shrink-0 text-xs text-ink-400">
                          {consultation.doctorName}
                        </span>
                      )}
                    </div>
                    {consultation.diagnosis && (
                      <p className="mt-2 text-sm text-ink-900">
                        {consultation.diagnosis}
                      </p>
                    )}
                    {consultation.prescription && (
                      <p className="mt-1 text-xs text-ink-600">
                        Prescription : {consultation.prescription}
                      </p>
                    )}
                    {consultation.notes && (
                      <p className="mt-1 text-xs text-ink-400">
                        {consultation.notes}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>
      )}

      {/* Documents */}
      {activeTab === "documents" && (
        <SectionCard
          animate
          icon={<FileText size={18} />}
          title="Documents rattachés"
          description={
            isDocumentsDemo
              ? "Données de démonstration (voir VITE_DOCUMENTS_LIST_WEBHOOK_URL)."
              : "Documents importés et analysés pour ce patient."
          }
          action={
            <Button
              fullWidth={false}
              onClick={() => {
                setUploadError(null);
                setIsUploadOpen(true);
              }}
            >
              <Plus size={14} />
              Importer
            </Button>
          }
        >
          {isDocumentsLoading && <SkeletonText lines={3} />}
          {!isDocumentsLoading && documents.length === 0 && (
            <EmptyState
              icon={FileText}
              title="Aucun document"
              description="Aucun document importé pour ce patient."
              className="py-8"
            />
          )}

          <div className="space-y-2.5">
            {documents.map((document) => {
              const meta = DOCUMENT_STATUS_META[document.status];
              return (
                <button
                  key={document.id}
                  onClick={() =>
                    navigate(
                      `/app/dossiers/${patientId}/documents/${document.id}`,
                      { state: { document } },
                    )
                  }
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 bg-hc-bg px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-hc-primary/30 hover:shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-hc-primary shadow-sm">
                      <FileText size={16} />
                    </span>
                    <span className="truncate text-sm font-medium text-ink-900">
                      {document.fileName}
                    </span>
                  </div>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </button>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Assistant IA */}
      {activeTab === "assistant" && (
        <SectionCard
          animate
          icon={<MessageSquareText size={18} />}
          title="Assistant IA — questions sur le patient"
          description="Posez une question au workflow RAG à partir du dossier, des consultations et des documents du patient."
        >
          {!import.meta.env.VITE_PATIENT_QA_WEBHOOK_URL && (
            <Banner className="mb-4">
              VITE_PATIENT_QA_WEBHOOK_URL n'est pas configuré dans le fichier
              .env.
            </Banner>
          )}

          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <label className="block text-sm font-medium text-ink-900">
                Question
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={4}
                  placeholder="Ex: Quelles sont les allergies connues de ce patient ?"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-hc-primary focus:ring-2 focus:ring-hc-primary/20"
                />
              </label>

              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  "Quelles sont les allergies connues ?",
                  "Résume l'historique récent du patient.",
                  "Quels documents parlent d'hypertension ?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setQuestion(prompt)}
                    className="rounded-full border border-slate-200 bg-hc-bg px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:border-hc-primary/40 hover:text-hc-primary"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {questionError && (
                <Banner tone="red" className="mt-4">
                  {questionError}
                </Banner>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  shine
                  fullWidth={false}
                  onClick={handleAskQuestion}
                  disabled={
                    isAskingQuestion ||
                    !import.meta.env.VITE_PATIENT_QA_WEBHOOK_URL
                  }
                >
                  <Sparkles size={16} />
                  {isAskingQuestion ? "Question en cours..." : "Poser la question"}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-hc-bg p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Réponse
              </div>

              {!questionResponse && !isAskingQuestion && (
                <p className="mt-3 text-sm text-ink-400">
                  La réponse du workflow apparaîtra ici.
                </p>
              )}

              {isAskingQuestion && (
                <p className="mt-3 text-sm text-ink-400">
                  Recherche des informations pertinentes en cours...
                </p>
              )}

              {questionResponse && (
                <div className="mt-3 space-y-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-ink-900">
                    {questionResponse.answer}
                  </p>

                  {questionResponse.sources &&
                    questionResponse.sources.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                          Sources
                        </div>
                        <div className="mt-2 space-y-2">
                          {questionResponse.sources.map((source, index) => (
                            <div
                              key={
                                source.id ??
                                `${source.title ?? "source"}-${index}`
                              }
                              className="rounded-lg border border-slate-200 bg-white p-3"
                            >
                              <div className="text-sm font-medium text-ink-900">
                                {source.title ?? `Source ${index + 1}`}
                              </div>
                              {source.snippet && (
                                <p className="mt-1 text-xs leading-5 text-ink-600">
                                  {source.snippet}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      )}

      {isUploadOpen && (
        <Modal title="Importer un document" onClose={() => setIsUploadOpen(false)}>
          {uploadError && (
            <Banner tone="red" className="mb-4">
              {uploadError}
            </Banner>
          )}
          <DocumentUploadModal
            onUpload={handleUpload}
            onClose={() => setIsUploadOpen(false)}
            submitting={isUploading}
          />
        </Modal>
      )}

      {isConsultationFormOpen && (
        <Modal
          title="Ajouter une consultation"
          onClose={() => setIsConsultationFormOpen(false)}
        >
          {consultationError && (
            <Banner tone="red" className="mb-4">
              {consultationError}
            </Banner>
          )}
          <ConsultationForm
            onSubmit={handleCreateConsultation}
            onCancel={() => setIsConsultationFormOpen(false)}
            submitting={isCreatingConsultation}
          />
        </Modal>
      )}
    </motion.div>
  );
}
