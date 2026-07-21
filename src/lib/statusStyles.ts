import type { BadgeTone } from "../components/ui/Badge";
import type {
  AuditAction,
  DocumentStatus,
  PatientStatus,
  Role,
} from "../types";

interface BadgeMeta {
  label: string;
  tone: BadgeTone;
}

export const DOCUMENT_STATUS_META: Record<DocumentStatus, BadgeMeta> = {
  importe: { label: "Importé", tone: "slate" },
  en_traitement: { label: "En traitement", tone: "blue" },
  a_valider: { label: "À valider", tone: "amber" },
  a_corriger: { label: "À corriger", tone: "red" },
  valide: { label: "Validé", tone: "green" },
  signe: { label: "Signé", tone: "green" },
  archive: { label: "Archivé", tone: "slate" },
};

export const PATIENT_STATUS_META: Record<PatientStatus, BadgeMeta> = {
  actif: { label: "Actif", tone: "green" },
  archivé: { label: "Archivé", tone: "slate" },
};

export const ROLE_META: Record<Role, BadgeMeta> = {
  Administrateur: { label: "Administrateur", tone: "blue" },
  Clinicien: { label: "Clinicien", tone: "green" },
  Opérateur: { label: "Opérateur", tone: "amber" },
};

export const AUDIT_ACTION_META: Record<AuditAction, BadgeMeta> = {
  creation: { label: "Création", tone: "green" },
  modification: { label: "Modification", tone: "blue" },
  validation: { label: "Validation", tone: "amber" },
  signature: { label: "Signature", tone: "green" },
  consultation: { label: "Consultation", tone: "slate" },
  suppression: { label: "Suppression", tone: "red" },
};

/** Tone for a numeric confidence score (0–1) used by extraction fields. */
export function confidenceTone(score: number): BadgeTone {
  if (score >= 0.9) return "green";
  if (score >= 0.7) return "amber";
  return "red";
}
