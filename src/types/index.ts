export type Role = "Administrateur" | "Clinicien" | "Opérateur";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export type PatientStatus = "actif" | "archivé";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  cin: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status: PatientStatus;
  createdAt: string;
}

export type PatientFormInput = Omit<Patient, "id" | "status" | "createdAt">;

export interface MedicalRecord {
  id: string;
  patientId: string;
  recordNumber: string;
  allergies?: string;
  chronicConditions?: string;
  medicalHistory?: string;
  currentTreatments?: string;
  vaccinations?: string;
  updatedAt: string;
}

export type MedicalRecordFormInput = Pick<
  MedicalRecord,
  "allergies" | "chronicConditions" | "medicalHistory" | "currentTreatments" | "vaccinations"
>;

// Reflète l'enum `document_status` de supabase/schema.sql.
export type DocumentStatus =
  | "importe"
  | "en_traitement"
  | "a_valider"
  | "a_corriger"
  | "valide"
  | "signe"
  | "archive";

export type ExtractionEngine = "jigsawstack" | "gemini" | "mistral";

export interface ExtractedField {
  value: string;
  confidence: number;
}

// Les clés correspondent exactement aux champs du Dossier Médical
// (voir MedicalRecordFormInput) : l'extraction structure directement dans
// ce schéma, "Accepter" n'a donc qu'à fusionner sans mapping intermédiaire.
export type ExtractedFields = Partial<
  Record<keyof MedicalRecordFormInput, ExtractedField>
>;

export interface PatientDocument {
  id: string;
  patientId: string;
  fileName: string;
  fileType: "image" | "pdf";
  fileUrl: string;
  status: DocumentStatus;
  ocrText?: string;
  extractedFields: ExtractedFields;
  engine?: ExtractionEngine;
  createdAt: string;
  signedAt?: string;
  // Uniquement renseignés par listAllDocumentsRequest (vue multi-patients) —
  // absents des réponses par patient (déjà connu du contexte de la page).
  patientFirstName?: string;
  patientLastName?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  consultationDate?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  doctorName?: string;
  createdAt: string;
}

export type ConsultationFormInput = Pick<
  Consultation,
  "consultationDate" | "diagnosis" | "prescription" | "notes"
>;

// Compte géré depuis la page Administration (CRUD réservé au rôle
// Administrateur) — distinct de `User` (session connectée) car `fullName`
// suit ici la casse renvoyée par /users côté mcp-server.
export interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface ManagedUserFormInput {
  fullName: string;
  email: string;
  role: Role;
  password?: string;
}

// Statistiques d'activité par utilisateur (page Administration / Dashboard
// admin) — voir GET /users/stats côté mcp-server.
export interface UserActivityStats {
  userId: string;
  fullName: string;
  role: Role;
  documentsUploaded: number;
  documentsSigned: number;
  consultationsCreated: number;
}

// Reflète l'enum `audit_action` de supabase/schema.sql.
export type AuditAction =
  | "creation"
  | "modification"
  | "validation"
  | "signature"
  | "consultation"
  | "suppression";

// Journal d'audit (page Administration) — voir GET /audit-logs côté
// mcp-server, alimenté par `_log_audit`.
export interface AuditLogEntry {
  id: string;
  userId?: string;
  userName?: string;
  patientId?: string;
  patientName?: string;
  documentId?: string;
  documentName?: string;
  action: AuditAction;
  entity: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface PatientQuestionResponse {
  answer: string;
  sources?: Array<{
    id?: string;
    title?: string;
    snippet?: string;
  }>;
}
