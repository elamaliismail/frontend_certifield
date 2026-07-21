import type { Consultation, ConsultationFormInput } from "../types";

const SEEDED_CONSULTATIONS: Record<string, Consultation[]> = {
  pat_1032: [
    {
      id: "cons_501",
      patientId: "pat_1032",
      consultationDate: "2026-06-15",
      diagnosis: "Hypertension artérielle stable",
      prescription: "Amlodipine 5mg, 1x/jour",
      notes: "Tension contrôlée, prochain contrôle dans 3 mois.",
      doctorName: "Dr. Bennani",
      createdAt: "2026-06-15T10:30:00.000Z",
    },
  ],
};

export function getMockConsultations(patientId: string): Consultation[] {
  return SEEDED_CONSULTATIONS[patientId] ?? [];
}

export function createMockConsultation(
  patientId: string,
  doctorName: string,
  input: ConsultationFormInput,
): Consultation {
  return {
    id: `local_cons_${crypto.randomUUID()}`,
    patientId,
    consultationDate: input.consultationDate || new Date().toISOString().slice(0, 10),
    diagnosis: input.diagnosis,
    prescription: input.prescription,
    notes: input.notes,
    doctorName,
    createdAt: new Date().toISOString(),
  };
}
