import type { MedicalRecord } from "../types";

// Quelques dossiers de démonstration plus fournis pour les patients seed
// (voir mockPatients.ts). Tout autre patient (créé en local, en mode démo)
// reçoit un dossier vierge généré à la volée par getMockMedicalRecord.
const SEEDED_RECORDS: Record<string, Partial<MedicalRecord>> = {
  pat_1032: {
    allergies: "Pénicilline",
    chronicConditions: "Hypertension artérielle",
    currentTreatments: "Amlodipine 5mg, 1x/jour",
  },
  pat_1041: {
    allergies: "Aucune allergie connue",
    vaccinations: "Vaccination à jour (dernier rappel tétanos 2024)",
  },
  pat_1058: {
    chronicConditions: "Diabète type 2",
    currentTreatments: "Metformine 500mg, 2x/jour",
    medicalHistory: "Pontage coronarien (2019)",
  },
};

export function getMockMedicalRecord(patientId: string): MedicalRecord {
  const seed = SEEDED_RECORDS[patientId] ?? {};
  return {
    id: `mr_${patientId}`,
    patientId,
    recordNumber: `DPN-${patientId.replace(/\D/g, "").padStart(6, "0") || "000000"}`,
    allergies: seed.allergies,
    chronicConditions: seed.chronicConditions,
    medicalHistory: seed.medicalHistory,
    currentTreatments: seed.currentTreatments,
    vaccinations: seed.vaccinations,
    updatedAt: new Date().toISOString(),
  };
}
