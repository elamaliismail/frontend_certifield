import { MOCK_PATIENTS } from "./mockPatients";
import type {
  DocumentStatus,
  ExtractedFields,
  ExtractionEngine,
  PatientDocument,
} from "../types";

const PLACEHOLDER_PREVIEW =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">' +
      '<rect width="100%" height="100%" fill="#f1f5f9"/>' +
      '<text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#94a3b8" text-anchor="middle">Aperçu du document</text>' +
      "</svg>",
  );

const SEEDED_DOCUMENTS: Record<string, PatientDocument[]> = {
  pat_1032: [
    {
      id: "doc_2451",
      patientId: "pat_1032",
      fileName: "compte-rendu-consultation.pdf",
      fileType: "pdf",
      fileUrl: PLACEHOLDER_PREVIEW,
      status: "a_valider",
      ocrText: "Compte rendu de consultation du 10/07/2026...",
      engine: "gemini",
      extractedFields: {
        chronicConditions: { value: "Hypertension artérielle", confidence: 0.88 },
        currentTreatments: { value: "Amlodipine 5mg, 1x/jour", confidence: 0.83 },
        medicalHistory: {
          value: "Tension 145/92 relevée le 10/07/2026, suivi par Dr. Bennani",
          confidence: 0.86,
        },
      },
      createdAt: "2026-07-10T09:20:00.000Z",
    },
  ],
  pat_1041: [
    {
      id: "doc_2478",
      patientId: "pat_1041",
      fileName: "resultats-labo.jpg",
      fileType: "image",
      fileUrl: PLACEHOLDER_PREVIEW,
      status: "valide",
      ocrText: "Résultats de laboratoire du 02/07/2026...",
      engine: "jigsawstack",
      extractedFields: {
        medicalHistory: {
          value: "Bilan lipidique normal, contrôlé par Dr. Amrani",
          confidence: 0.7,
        },
      },
      createdAt: "2026-07-02T14:05:00.000Z",
    },
  ],
};

export function getMockDocuments(patientId: string): PatientDocument[] {
  return SEEDED_DOCUMENTS[patientId] ?? [];
}

export function getMockDocument(documentId: string): PatientDocument | undefined {
  return Object.values(SEEDED_DOCUMENTS)
    .flat()
    .find((doc) => doc.id === documentId);
}

// Alimente les écrans "Documents" et "Validation" du menu (multi-patients)
// en mode démonstration.
export function getMockAllDocuments(status?: DocumentStatus): PatientDocument[] {
  const documents = Object.values(SEEDED_DOCUMENTS)
    .flat()
    .map((doc) => {
      const patient = MOCK_PATIENTS.find((p) => p.id === doc.patientId);
      return {
        ...doc,
        patientFirstName: patient?.firstName,
        patientLastName: patient?.lastName,
      };
    });
  return status ? documents.filter((doc) => doc.status === status) : documents;
}

// Simule une qualité d'extraction croissante d'un moteur à l'autre, pour que
// le flux Accepter/Réessayer/Modifier soit testable sans clés API réelles :
// JigsawStack (OCR seul) trouve peu de choses, Gemini/Mistral (LLM vision)
// structurent mieux et avec une confiance plus élevée.
function simulateFields(engine: ExtractionEngine): ExtractedFields {
  switch (engine) {
    case "jigsawstack":
      return {
        medicalHistory: {
          value: "Texte partiellement reconnu — à vérifier",
          confidence: 0.5,
        },
      };
    case "gemini":
      return {
        medicalHistory: {
          value: "Antécédents mentionnés dans le document (à confirmer)",
          confidence: 0.85,
        },
        currentTreatments: {
          value: "Traitement identifié dans le document (à confirmer)",
          confidence: 0.8,
        },
      };
    case "mistral":
      return {
        medicalHistory: {
          value: "Antécédents mentionnés dans le document (à confirmer)",
          confidence: 0.82,
        },
        currentTreatments: {
          value: "Traitement identifié dans le document (à confirmer)",
          confidence: 0.79,
        },
        allergies: {
          value: "Aucune allergie mentionnée dans le document",
          confidence: 0.75,
        },
      };
  }
}

export function createMockDocument(
  patientId: string,
  fileName: string,
  fileType: "image" | "pdf",
  previewUrl: string,
  engine: ExtractionEngine = "jigsawstack",
  existing?: PatientDocument,
): PatientDocument {
  return {
    id: existing?.id ?? `local_doc_${crypto.randomUUID()}`,
    patientId,
    fileName,
    fileType,
    fileUrl: previewUrl || existing?.fileUrl || PLACEHOLDER_PREVIEW,
    status: "a_valider",
    engine,
    extractedFields: simulateFields(engine),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}
