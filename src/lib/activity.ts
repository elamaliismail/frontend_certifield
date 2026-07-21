import type { PatientDocument } from "../types";

export interface ActivityEvent {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  patientId: string;
  documentId: string;
}

function patientLabel(doc: PatientDocument): string {
  const name = `${doc.patientFirstName ?? ""} ${doc.patientLastName ?? ""}`.trim();
  return name || "Patient inconnu";
}

// Dérive un fil d'activité à partir des documents (pas de table
// `audit_logs` alimentée pour l'instant côté workflows) : signature,
// import, champs à corriger. Trié du plus récent au plus ancien.
export function buildActivityFeed(documents: PatientDocument[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const doc of documents) {
    const patient = patientLabel(doc);

    if (doc.signedAt) {
      events.push({
        id: `${doc.id}-signed`,
        title: "Document signé",
        detail: `${doc.fileName} — ${patient}`,
        timestamp: doc.signedAt,
        patientId: doc.patientId,
        documentId: doc.id,
      });
    }

    events.push({
      id: `${doc.id}-imported`,
      title: "Nouveau document importé",
      detail: `${doc.fileName} — ${patient}`,
      timestamp: doc.createdAt,
      patientId: doc.patientId,
      documentId: doc.id,
    });

    if (doc.status === "a_corriger") {
      events.push({
        id: `${doc.id}-tocorrect`,
        title: "Champs à corriger",
        detail: `${doc.fileName} — ${patient}`,
        timestamp: doc.createdAt,
        patientId: doc.patientId,
        documentId: doc.id,
      });
    }
  }

  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}
