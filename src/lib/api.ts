import type {
  AuditLogEntry,
  Consultation,
  ConsultationFormInput,
  DocumentStatus,
  ExtractionEngine,
  LoginResponse,
  ManagedUser,
  ManagedUserFormInput,
  MedicalRecord,
  MedicalRecordFormInput,
  Patient,
  PatientDocument,
  PatientFormInput,
  PatientQuestionResponse,
  UserActivityStats,
} from "../types";

export class WorkflowError extends Error {}

interface WorkflowCallbackPayload {
  status: "pending" | "done";
  valid?: boolean;
  error?: string;
  [key: string]: unknown;
}

const OVERALL_TIMEOUT_MS = 60_000;

// Chaque endpoint métier (Auth, Patients, ...) est un contrat d'échange avec
// un workflow, pas une route codée à la main : on poste { ...payload,
// request_id } sur le webhook du workflow (qui répond immédiatement, 202 "in
// progress"), puis on interroge (long-polling) le serveur MCP relais sur
// /auth-result/<request_id> jusqu'à ce que le workflow ait rappelé
// /auth-callback avec le résultat final. Le relais est générique : le même
// couple callback/result sert pour tous les workflows, seul le webhook
// déclencheur change.
async function callWorkflow(
  webhookUrl: string | undefined,
  devProxyPath: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (!webhookUrl) {
    throw new WorkflowError(
      "URL de webhook non configurée (fichier .env).",
    );
  }
  if (!import.meta.env.VITE_AUTH_CALLBACK_URL) {
    throw new WorkflowError(
      "VITE_AUTH_CALLBACK_URL n'est pas configuré (fichier .env).",
    );
  }

  const requestId = crypto.randomUUID();

  // En dev, on passe par un proxy Vite (voir vite.config.ts) pour éviter le
  // CORS des webhooks. En prod, appel direct (nécessite que le webhook
  // autorise l'origine du site, ou un vrai reverse proxy devant lui).
  const url = import.meta.env.DEV ? devProxyPath : webhookUrl;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, request_id: requestId }),
    });
  } catch {
    throw new WorkflowError("Impossible de joindre le workflow.");
  }

  return awaitWorkflowResult(requestId);
}

async function awaitWorkflowResult(
  requestId: string,
): Promise<Record<string, unknown>> {
  const callbackBase = import.meta.env.VITE_AUTH_CALLBACK_URL.replace(
    /\/$/,
    "",
  );
  const deadline = Date.now() + OVERALL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    let response: Response;
    try {
      response = await fetch(`${callbackBase}/auth-result/${requestId}`, {
        // Évite la page d'avertissement "visiteur navigateur" du plan gratuit
        // ngrok, qui renvoie une page HTML sans en-têtes CORS (fetch échoue).
        headers: { "ngrok-skip-browser-warning": "true" },
      });
    } catch {
      throw new WorkflowError("Impossible de joindre le serveur de callback.");
    }

    if (response.status === 202) {
      continue; // toujours en attente (le serveur fait déjà du long-polling)
    }

    if (!response.ok) {
      throw new WorkflowError("Réponse du serveur de callback invalide.");
    }

    const data = (await response.json()) as WorkflowCallbackPayload;

    if (data.valid === false || data.error) {
      throw new WorkflowError(data.error ?? "Le workflow a renvoyé une erreur.");
    }
    return data;
  }

  throw new WorkflowError("Le workflow met trop de temps à répondre.");
}

// URL de base du serveur MCP pour les appels DIRECTS (hors webhook/workflow)
// — voir uploadDocumentFileRequest, listConsultationsRequest,
// createConsultationRequest.
function callbackBaseUrl(): string {
  if (!import.meta.env.VITE_AUTH_CALLBACK_URL) {
    throw new WorkflowError("VITE_AUTH_CALLBACK_URL n'est pas configuré (fichier .env).");
  }
  return import.meta.env.VITE_AUTH_CALLBACK_URL.replace(/\/$/, "");
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const data = await callWorkflow(
    import.meta.env.VITE_AUTH_WEBHOOK_URL,
    "/auth-webhook",
    { email, password },
  );

  if (!data.token || !data.user) {
    throw new WorkflowError("Réponse du workflow Auth invalide.");
  }
  return {
    token: data.token as string,
    user: data.user as LoginResponse["user"],
  };
}

export async function listPatientsRequest(): Promise<Patient[]> {
  const data = await callWorkflow(
    import.meta.env.VITE_PATIENTS_LIST_WEBHOOK_URL,
    "/patients-list-webhook",
    {},
  );

  if (!Array.isArray(data.patients)) {
    throw new WorkflowError("Réponse du workflow Patients (liste) invalide.");
  }
  return data.patients as Patient[];
}

// `actorId` = id de l'utilisateur connecté qui crée le patient, pour la
// traçabilité (`audit_logs`) — voir `create_patient` côté mcp-server. Envoyé
// dans tous les cas ; n'est effectivement journalisé avec un auteur connu
// que si le workflow Langflow relaie ce champ vers l'outil (comme pour
// `signedBy`/`doctorId` ailleurs) ; sinon l'évènement est quand même
// enregistré, juste sans auteur.
export async function createPatientRequest(
  input: PatientFormInput,
  actorId: string,
): Promise<Patient> {
  const data = await callWorkflow(
    import.meta.env.VITE_PATIENTS_CREATE_WEBHOOK_URL,
    "/patients-create-webhook",
    { ...input, actorId },
  );

  if (!data.patient) {
    throw new WorkflowError(
      "Réponse du workflow Patients (création) invalide.",
    );
  }
  return data.patient as Patient;
}

export async function getMedicalRecordRequest(
  patientId: string,
): Promise<{ patient: Patient; medicalRecord: MedicalRecord }> {
  const data = await callWorkflow(
    import.meta.env.VITE_MEDICAL_RECORD_WEBHOOK_URL,
    "/medical-record-webhook",
    { patientId },
  );

  if (!data.patient || !data.medicalRecord) {
    throw new WorkflowError(
      "Réponse du workflow Dossier médical invalide.",
    );
  }
  return {
    patient: data.patient as Patient,
    medicalRecord: data.medicalRecord as MedicalRecord,
  };
}

export async function updateMedicalRecordRequest(
  patientId: string,
  input: MedicalRecordFormInput,
  actorId: string,
): Promise<MedicalRecord> {
  const data = await callWorkflow(
    import.meta.env.VITE_MEDICAL_RECORD_UPDATE_WEBHOOK_URL,
    "/medical-record-update-webhook",
    { patientId, ...input, actorId },
  );

  if (!data.medicalRecord) {
    throw new WorkflowError(
      "Réponse du workflow Dossier médical (mise à jour) invalide.",
    );
  }
  return data.medicalRecord as MedicalRecord;
}

// Exporté pour que l'appelant (DossierPage) ne convertisse le fichier en
// base64 qu'une seule fois et garde le résultat en mémoire : les tentatives
// suivantes (Réessayer avec un autre moteur) réutilisent la même donnée sans
// redemander le fichier à l'utilisateur.
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.readAsDataURL(file);
  });
}

export async function listDocumentsRequest(
  patientId: string,
): Promise<PatientDocument[]> {
  const data = await callWorkflow(
    import.meta.env.VITE_DOCUMENTS_LIST_WEBHOOK_URL,
    "/documents-list-webhook",
    { patientId },
  );

  if (!Array.isArray(data.documents)) {
    throw new WorkflowError("Réponse du workflow Documents (liste) invalide.");
  }
  return data.documents as PatientDocument[];
}

// Documents de TOUS les patients (écrans "Documents" et "Validation" du
// menu) — à la différence de listDocumentsRequest, qui liste ceux d'UN
// patient déjà connu (dossier médical). `status` filtre la liste (ex.
// "a_valider" pour n'afficher que la file d'attente de validation).
export async function listAllDocumentsRequest(
  status?: DocumentStatus,
): Promise<PatientDocument[]> {
  const data = await callWorkflow(
    import.meta.env.VITE_DOCUMENTS_QUEUE_WEBHOOK_URL,
    "/documents-queue-webhook",
    { status: status ?? "" },
  );

  if (!Array.isArray(data.documents)) {
    throw new WorkflowError("Réponse du workflow Documents (file) invalide.");
  }
  return data.documents as PatientDocument[];
}

// Upload direct du fichier vers le serveur MCP (HORS webhook/workflow) —
// évite que le base64 du fichier transite par le workflow (et donc,
// potentiellement, par les tokens d'un Agent LLM). Le document est créé
// tout de suite côté Supabase ; l'extraction (ci-dessous) ne reçoit ensuite
// que son id.
export async function uploadDocumentFileRequest(
  patientId: string,
  file: File,
  uploaderId: string,
): Promise<PatientDocument> {
  const callbackBase = callbackBaseUrl();
  const fileBase64 = await fileToBase64(file);

  let response: Response;
  try {
    response = await fetch(`${callbackBase}/documents/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        patientId,
        fileName: file.name,
        fileType: file.type,
        fileBase64,
        uploaderId,
      }),
    });
  } catch {
    throw new WorkflowError("Impossible de joindre le serveur MCP pour l'upload.");
  }

  if (!response.ok) {
    throw new WorkflowError("Échec de l'upload du document.");
  }

  const data = (await response.json()) as { document?: PatientDocument; error?: string };
  if (!data.document) {
    throw new WorkflowError(data.error ?? "Réponse d'upload invalide.");
  }
  return data.document;
}

// Lance (ou relance) une extraction avec le moteur donné sur un document
// déjà uploadé (voir uploadDocumentFileRequest). 1er essai = jigsawstack
// (automatique à l'import), puis gemini et mistral sur "Réessayer" — voir
// DocumentPage.tsx. Ne transporte jamais le fichier lui-même : seulement
// son id.
export async function extractDocumentRequest(
  patientId: string,
  documentId: string,
  engine: ExtractionEngine,
  status: DocumentStatus,
): Promise<PatientDocument> {
  const data = await callWorkflow(
    import.meta.env.VITE_DOCUMENT_EXTRACT_WEBHOOK_URL,
    "/document-extract-webhook",
    { patientId, documentId, engine, status },
  );

  if (!data.document) {
    throw new WorkflowError("Réponse du workflow Document (extraction) invalide.");
  }
  return data.document as PatientDocument;
}

// Bouton "Accepter" : ajoute les champs (corrigés ou non) au dossier
// médical du patient et marque le document comme validé. `actorId` : voir
// createPatientRequest — même logique de traçabilité best-effort.
export async function validateDocumentRequest(
  documentId: string,
  patientId: string,
  fields: MedicalRecordFormInput,
  status: DocumentStatus,
  actorId: string,
): Promise<{ document: PatientDocument; medicalRecord: MedicalRecord }> {
  const data = await callWorkflow(
    import.meta.env.VITE_DOCUMENT_VALIDATE_WEBHOOK_URL,
    "/document-validate-webhook",
    { documentId, patientId, ...fields, status, actorId },
  );

  if (!data.document || !data.medicalRecord) {
    throw new WorkflowError("Réponse du workflow Document (validation) invalide.");
  }
  return {
    document: data.document as PatientDocument,
    medicalRecord: data.medicalRecord as MedicalRecord,
  };
}

// Bouton "Signer" (après "Accepter") : signature électronique finale,
// verrouille le document (statut "signe").
export async function signDocumentRequest(
  documentId: string,
  patientId: string,
  signedBy: string,
  status: DocumentStatus,
): Promise<PatientDocument> {
  const data = await callWorkflow(
    import.meta.env.VITE_DOCUMENT_SIGN_WEBHOOK_URL,
    "/document-sign-webhook",
    { documentId, patientId, signedBy, status },
  );

  if (!data.document) {
    throw new WorkflowError("Réponse du workflow Document (signature) invalide.");
  }
  return data.document as PatientDocument;
}

// Appelé DIRECTEMENT sur le serveur MCP (comme uploadDocumentFileRequest),
// sans passer par un webhook/workflow — une simple lecture ne bénéficie
// d'aucun raisonnement IA, donc pas besoin de la faire transiter par la
// plateforme Agentic AI.
export async function listConsultationsRequest(
  patientId: string,
): Promise<Consultation[]> {
  const callbackBase = callbackBaseUrl();

  let response: Response;
  try {
    response = await fetch(`${callbackBase}/consultations/${patientId}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
  } catch {
    throw new WorkflowError("Impossible de joindre le serveur MCP.");
  }

  if (!response.ok) {
    throw new WorkflowError("Échec de la récupération des consultations.");
  }

  const data = (await response.json()) as {
    consultations?: Consultation[];
    error?: string;
  };
  if (!Array.isArray(data.consultations)) {
    throw new WorkflowError(data.error ?? "Réponse consultations invalide.");
  }
  return data.consultations;
}

// `doctorId` = id de l'utilisateur connecté qui saisit la consultation
// (même logique que `signedBy` sur uploadDocumentFileRequest/signature).
// Même raisonnement que listConsultationsRequest : appel direct, pas de
// webhook/workflow pour une simple écriture sans IA.
export async function createConsultationRequest(
  patientId: string,
  doctorId: string,
  input: ConsultationFormInput,
): Promise<Consultation> {
  const callbackBase = callbackBaseUrl();

  let response: Response;
  try {
    response = await fetch(`${callbackBase}/consultations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ patientId, doctorId, ...input }),
    });
  } catch {
    throw new WorkflowError("Impossible de joindre le serveur MCP.");
  }

  if (!response.ok) {
    throw new WorkflowError("Échec de l'enregistrement de la consultation.");
  }

  const data = (await response.json()) as { consultation?: Consultation; error?: string };
  if (!data.consultation) {
    throw new WorkflowError(data.error ?? "Réponse consultation invalide.");
  }
  return data.consultation;
}

// ============ ADMINISTRATION — CRUD UTILISATEURS ============
// Appelé DIRECTEMENT sur le serveur MCP (comme listConsultationsRequest),
// sans webhook/workflow : gestion de comptes = simples lectures/écritures
// CRUD, aucun raisonnement IA nécessaire. Page réservée au rôle
// Administrateur côté front-end (voir UsersPage.tsx).

export async function listUsersRequest(): Promise<ManagedUser[]> {
  const callbackBase = callbackBaseUrl();

  let response: Response;
  try {
    response = await fetch(`${callbackBase}/users`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
  } catch {
    throw new WorkflowError("Impossible de joindre le serveur MCP.");
  }

  if (!response.ok) {
    throw new WorkflowError("Échec de la récupération des utilisateurs.");
  }

  const data = (await response.json()) as { users?: ManagedUser[]; error?: string };
  if (!Array.isArray(data.users)) {
    throw new WorkflowError(data.error ?? "Réponse utilisateurs invalide.");
  }
  return data.users;
}

export async function createUserRequest(
  input: ManagedUserFormInput,
  actorId: string,
): Promise<ManagedUser> {
  const callbackBase = callbackBaseUrl();

  let response: Response;
  try {
    response = await fetch(`${callbackBase}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ ...input, actorId }),
    });
  } catch {
    throw new WorkflowError("Impossible de joindre le serveur MCP.");
  }

  const data = (await response.json()) as { user?: ManagedUser; error?: string };
  if (!response.ok || !data.user) {
    throw new WorkflowError(data.error ?? "Échec de la création de l'utilisateur.");
  }
  return data.user;
}

export async function updateUserRequest(
  userId: string,
  input: Partial<ManagedUserFormInput>,
  actorId: string,
): Promise<ManagedUser> {
  const callbackBase = callbackBaseUrl();

  let response: Response;
  try {
    response = await fetch(`${callbackBase}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ ...input, actorId }),
    });
  } catch {
    throw new WorkflowError("Impossible de joindre le serveur MCP.");
  }

  const data = (await response.json()) as { user?: ManagedUser; error?: string };
  if (!response.ok || !data.user) {
    throw new WorkflowError(data.error ?? "Échec de la mise à jour de l'utilisateur.");
  }
  return data.user;
}

export async function deleteUserRequest(userId: string, actorId: string): Promise<void> {
  const callbackBase = callbackBaseUrl();

  let response: Response;
  try {
    response = await fetch(
      `${callbackBase}/users/${userId}?actorId=${encodeURIComponent(actorId)}`,
      {
        method: "DELETE",
        headers: { "ngrok-skip-browser-warning": "true" },
      },
    );
  } catch {
    throw new WorkflowError("Impossible de joindre le serveur MCP.");
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new WorkflowError(data.error ?? "Échec de la suppression de l'utilisateur.");
  }
}

// Statistiques d'activité par utilisateur (Clinicien/Opérateur) — voir
// GET /users/stats côté mcp-server. Appelé DIRECTEMENT, sans webhook.
export async function listUserStatsRequest(): Promise<UserActivityStats[]> {
  const callbackBase = callbackBaseUrl();

  let response: Response;
  try {
    response = await fetch(`${callbackBase}/users/stats`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
  } catch {
    throw new WorkflowError("Impossible de joindre le serveur MCP.");
  }

  if (!response.ok) {
    throw new WorkflowError("Échec de la récupération des statistiques.");
  }

  const data = (await response.json()) as { stats?: UserActivityStats[]; error?: string };
  if (!Array.isArray(data.stats)) {
    throw new WorkflowError(data.error ?? "Réponse statistiques invalide.");
  }
  return data.stats;
}

export async function listAuditLogsRequest(limit = 200): Promise<AuditLogEntry[]> {
  const callbackBase = callbackBaseUrl();

  let response: Response;
  try {
    response = await fetch(`${callbackBase}/audit-logs?limit=${limit}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
  } catch {
    throw new WorkflowError("Impossible de joindre le serveur MCP.");
  }

  if (!response.ok) {
    throw new WorkflowError("Ã‰chec de la rÃ©cupÃ©ration du journal d'audit.");
  }

  const data = (await response.json()) as { logs?: AuditLogEntry[]; error?: string };
  if (!Array.isArray(data.logs)) {
    throw new WorkflowError(data.error ?? "RÃ©ponse journal d'audit invalide.");
  }
  return data.logs;
}

export async function askPatientQuestionRequest(
  patientId: string,
  question: string,
  actorId: string,
): Promise<PatientQuestionResponse> {
  const data = await callWorkflow(
    import.meta.env.VITE_PATIENT_QA_WEBHOOK_URL,
    "/patient-qa-webhook",
    { patientId, question, actorId },
  );

  if (typeof data.answer !== "string" || !data.answer.trim()) {
    throw new WorkflowError("Réponse du workflow RAG patient invalide.");
  }

  return {
    answer: data.answer as string,
    sources: Array.isArray(data.sources)
      ? (data.sources as PatientQuestionResponse["sources"])
      : undefined,
  };
}
