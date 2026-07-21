import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  Cpu,
  Download,
  FileText,
  Lock,
  PenLine,
  RotateCcw,
} from "lucide-react";
import {
  extractDocumentRequest,
  signDocumentRequest,
  validateDocumentRequest,
  WorkflowError,
} from "../lib/api";
import { ENGINE_LABELS, MAX_EXTRACTION_ATTEMPTS, nextEngine } from "../lib/extraction";
import { createMockDocument, getMockDocument } from "../lib/mockDocuments";
import { useAuth } from "../context/AuthContext";
import { Modal } from "../components/Modal";
import { Toast } from "../components/Toast";
import { validateMedicalField } from "../lib/validation";
import { DOCUMENT_STATUS_META, confidenceTone } from "../lib/statusStyles";
import type {
  ExtractionEngine,
  MedicalRecordFormInput,
  PatientDocument,
} from "../types";
import {
  Badge,
  Banner,
  Breadcrumb,
  Button,
  Card,
  EmptyState,
  fadeUp,
  pageContainer,
} from "../components/ui";

const MEDICAL_FIELDS: { key: keyof MedicalRecordFormInput; label: string }[] = [
  { key: "allergies", label: "Allergies" },
  { key: "chronicConditions", label: "Maladies chroniques" },
  { key: "medicalHistory", label: "Antécédents" },
  { key: "currentTreatments", label: "Traitements en cours" },
  { key: "vaccinations", label: "Vaccinations" },
];

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fieldsToForm(
  fields: PatientDocument["extractedFields"],
): Record<string, string> {
  return Object.fromEntries(
    MEDICAL_FIELDS.map(({ key }) => [key, fields[key]?.value ?? ""]),
  );
}

interface DocumentPageState {
  document?: PatientDocument;
}

export function DocumentPage() {
  const { patientId, documentId } = useParams<{
    patientId: string;
    documentId: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = (location.state as DocumentPageState | null) ?? {};
  const stateDocument = state.document;

  const [doc, setDoc] = useState<PatientDocument | null>(
    stateDocument ?? (documentId ? getMockDocument(documentId) ?? null : null),
  );
  const [form, setForm] = useState<Record<string, string>>(() =>
    fieldsToForm(doc?.extractedFields ?? {}),
  );
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof MedicalRecordFormInput, string>>
  >({});
  const [isEditing, setIsEditing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSignConfirmOpen, setIsSignConfirmOpen] = useState(false);
  const [isDemoData, setIsDemoData] = useState(!stateDocument);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const nextEngineToTry: ExtractionEngine | null = doc ? nextEngine(doc.engine) : null;
  const isValidated = doc?.status === "valide";
  const isSigned = doc?.status === "signe";

  async function handleRetry() {
    if (!doc || !patientId || !nextEngineToTry) return;
    setIsExtracting(true);
    setActionError(null);
    try {
      const updated = await extractDocumentRequest(
        patientId,
        doc.id,
        nextEngineToTry,
        doc.status,
      );
      setDoc(updated);
      setForm(fieldsToForm(updated.extractedFields));
      setIsDemoData(false);
    } catch (err) {
      if (err instanceof WorkflowError && isDemoData) {
        const updated = createMockDocument(
          patientId,
          doc.fileName,
          doc.fileType,
          doc.fileUrl,
          nextEngineToTry,
          doc,
        );
        setDoc(updated);
        setForm(fieldsToForm(updated.extractedFields));
      } else {
        setActionError(
          err instanceof WorkflowError
            ? err.message
            : "Une erreur inattendue est survenue.",
        );
      }
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleAccept() {
    if (!doc || !patientId) return;

    const nextErrors: Partial<Record<keyof MedicalRecordFormInput, string>> = {};
    MEDICAL_FIELDS.forEach(({ key, label }) => {
      const error = validateMedicalField(form[key] ?? "", label);
      if (error) nextErrors[key] = error;
    });
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsAccepting(true);
    setActionError(null);
    try {
      const { document: updatedDoc } = await validateDocumentRequest(
        doc.id,
        patientId,
        form as MedicalRecordFormInput,
        doc.status,
        user?.id ?? "",
      );
      setDoc(updatedDoc);
      setIsEditing(false);
      setToastMessage("Document accepté, dossier médical mis à jour");
    } catch (err) {
      if (err instanceof WorkflowError && isDemoData) {
        setDoc((prev) => (prev ? { ...prev, status: "valide" } : prev));
        setIsEditing(false);
        setToastMessage("Document accepté, dossier médical mis à jour (démo)");
      } else {
        setActionError(
          err instanceof WorkflowError
            ? err.message
            : "Une erreur inattendue est survenue.",
        );
      }
    } finally {
      setIsAccepting(false);
    }
  }

  async function handleSign() {
    if (!doc || !patientId || !user) return;
    if (!user.id) {
      setActionError(
        "Session de connexion obsolète (identifiant utilisateur manquant) — déconnectez-vous puis reconnectez-vous et réessayez.",
      );
      return;
    }
    setIsSigning(true);
    setActionError(null);
    try {
      const updated = await signDocumentRequest(doc.id, patientId, user.id, doc.status);
      setDoc(updated);
      setIsSignConfirmOpen(false);
      setToastMessage("Document signé électroniquement");
    } catch (err) {
      if (err instanceof WorkflowError && isDemoData) {
        setDoc((prev) =>
          prev
            ? { ...prev, status: "signe", signedAt: new Date().toISOString() }
            : prev,
        );
        setIsSignConfirmOpen(false);
        setToastMessage("Document signé électroniquement (démo)");
      } else {
        setActionError(
          err instanceof WorkflowError
            ? err.message
            : "Une erreur inattendue est survenue.",
        );
      }
    } finally {
      setIsSigning(false);
    }
  }

  if (!doc) {
    return (
      <Card className="p-10">
        <EmptyState
          icon={FileText}
          title="Document introuvable"
          description="Ce document n'existe pas ou n'est plus disponible."
          action={
            <Button
              fullWidth={false}
              onClick={() => navigate(`/app/dossiers/${patientId ?? ""}`)}
            >
              Retour au dossier
            </Button>
          }
        />
      </Card>
    );
  }

  const isPdf = doc.fileType === "pdf";
  const statusMeta = DOCUMENT_STATUS_META[doc.status];

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
          Workflow Document non configuré — extraction en mode démonstration
          (voir VITE_DOCUMENT_EXTRACT_WEBHOOK_URL).
        </Banner>
      )}

      {isSigned && (
        <Banner tone="green" icon={<Lock size={16} />}>
          Document signé électroniquement
          {doc.signedAt ? ` le ${formatDateTime(doc.signedAt)}` : ""} —
          verrouillé, non modifiable.
        </Banner>
      )}

      <motion.div variants={fadeUp}>
        <Breadcrumb
          items={[
            { label: "Documents", to: "/app/documents" },
            { label: "Dossier", to: `/app/dossiers/${patientId ?? ""}` },
            { label: doc.fileName },
          ]}
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          variants={fadeUp}
          className="space-y-6"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink-900">
                <FileText size={16} className="text-hc-primary" />
                <span className="truncate">{doc.fileName}</span>
              </div>
              <a
                href={doc.fileUrl}
                download={doc.fileName}
                target="_blank"
                rel="noreferrer"
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-hc-primary transition-colors hover:bg-hc-primary/5"
              >
                <Download size={14} />
                Télécharger
              </a>
            </div>
            <div className="flex h-[520px] items-center justify-center bg-hc-bg p-4">
              {isPdf ? (
                <embed
                  src={doc.fileUrl}
                  type="application/pdf"
                  className="h-full w-full rounded-lg"
                />
              ) : (
                <img
                  src={doc.fileUrl}
                  alt={doc.fileName}
                  className="max-h-full max-w-full rounded-lg object-contain"
                />
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
            <h3 className="text-sm font-semibold text-ink-900">Métadonnées</h3>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Type
                </dt>
                <dd className="mt-1 uppercase text-ink-900">{doc.fileType}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Moteur d'extraction
                </dt>
                <dd className="mt-1 text-ink-900">
                  {doc.engine ? ENGINE_LABELS[doc.engine] : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Importé le
                </dt>
                <dd className="mt-1 text-ink-900">
                  {formatDateTime(doc.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Signé le
                </dt>
                <dd className="mt-1 text-ink-900">
                  {doc.signedAt ? formatDateTime(doc.signedAt) : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-hc-primary to-hc-secondary text-white shadow-sm shadow-hc-primary/30">
                <Cpu size={18} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink-900">
                  Champs extraits
                </h3>
                {doc.engine && (
                  <p className="text-xs text-ink-400">
                    Extrait avec {ENGINE_LABELS[doc.engine]}
                  </p>
                )}
              </div>
            </div>
            <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
          </div>

          {actionError && (
            <Banner tone="red" className="mt-4">
              {actionError}
            </Banner>
          )}

          <div className="mt-5 space-y-4">
            {MEDICAL_FIELDS.map(({ key, label }) => {
              const field = doc.extractedFields[key];
              return (
                <label key={key} className="block text-sm font-medium text-ink-900">
                  <div className="flex items-center justify-between">
                    {label}
                    {field ? (
                      <Badge tone={confidenceTone(field.confidence)}>
                        {Math.round(field.confidence * 100)}%
                      </Badge>
                    ) : (
                      <Badge tone="slate">non détecté</Badge>
                    )}
                  </div>
                  {isEditing ? (
                    <>
                      <textarea
                        value={form[key] ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        onBlur={() =>
                          setFormErrors((prev) => ({
                            ...prev,
                            [key]: validateMedicalField(form[key] ?? "", label) ?? undefined,
                          }))
                        }
                        rows={2}
                        className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-hc-primary focus:ring-2 focus:ring-hc-primary/20 ${
                          formErrors[key] ? "border-status-red-fg/50" : "border-slate-200"
                        }`}
                      />
                      {formErrors[key] && (
                        <span className="mt-1 block text-xs font-normal text-status-red-fg">
                          {formErrors[key]}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="mt-1.5 rounded-xl border border-slate-100 bg-hc-bg px-3 py-2.5 text-sm text-ink-900">
                      {form[key] || "Non renseigné"}
                    </div>
                  )}
                </label>
              );
            })}
          </div>

          {!isSigned && !isValidated && (
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                fullWidth={false}
                onClick={() => setIsEditing((prev) => !prev)}
              >
                {isEditing ? "Valider les modifications" : "Modifier"}
              </Button>

              <Button
                variant="outline"
                fullWidth={false}
                onClick={handleRetry}
                disabled={!nextEngineToTry || isExtracting || isAccepting}
                title={
                  !nextEngineToTry
                    ? `Nombre maximal de tentatives atteint (${MAX_EXTRACTION_ATTEMPTS})`
                    : undefined
                }
              >
                <RotateCcw size={14} />
                {isExtracting
                  ? "Nouvelle extraction..."
                  : nextEngineToTry
                    ? `Réessayer (${ENGINE_LABELS[nextEngineToTry]})`
                    : "Réessayer"}
              </Button>

              <Button
                fullWidth={false}
                onClick={handleAccept}
                disabled={isAccepting || isExtracting}
              >
                <Check size={14} />
                {isAccepting ? "Validation..." : "Accepter"}
              </Button>
            </div>
          )}

          {isValidated && (
            <div className="mt-6 flex justify-end">
              <Button
                shine
                fullWidth={false}
                onClick={() => setIsSignConfirmOpen(true)}
              >
                <PenLine size={14} />
                Signer électroniquement
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {isSignConfirmOpen && (
        <Modal title="Signature électronique" onClose={() => setIsSignConfirmOpen(false)}>
          {actionError && (
            <Banner tone="red" className="mb-4">
              {actionError}
            </Banner>
          )}
          <p className="text-sm text-ink-600">
            En signant, vous certifiez avoir vérifié les champs extraits de ce
            document{user ? ` en tant que ${user.name}` : ""}. Le document sera
            verrouillé et ne pourra plus être modifié.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              fullWidth={false}
              type="button"
              onClick={() => setIsSignConfirmOpen(false)}
            >
              Annuler
            </Button>
            <Button
              shine
              fullWidth={false}
              type="button"
              onClick={handleSign}
              disabled={isSigning}
            >
              <PenLine size={14} />
              {isSigning ? "Signature..." : "Confirmer la signature"}
            </Button>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
