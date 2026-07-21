// Numéro marocain : indicatif international (+212 / 00212) ou 0, suivi de 5, 6 ou 7
// puis 8 chiffres. Couvre mobile (06/07) et fixe (05).
export const MOROCCO_PHONE_REGEX = /^(?:\+212|00212|0)[567]\d{8}$/;

// CIN marocaine : 1 ou 2 lettres suivies de 5 à 8 chiffres (ex: AB123456, A123456).
export const CIN_REGEX = /^[A-Za-z]{1,2}[0-9]{5,8}$/;

export const NAME_REGEX = /^[A-Za-zÀ-ÿ' -]{2,50}$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string, required = true): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? "L'e-mail est requis." : null;
  if (!EMAIL_REGEX.test(trimmed)) return "Adresse e-mail invalide.";
  return null;
}

export function validatePhone(value: string, required = false): string | null {
  const trimmed = value.trim().replace(/\s/g, "");
  if (!trimmed) return required ? "Le téléphone est requis." : null;
  if (!MOROCCO_PHONE_REGEX.test(trimmed)) {
    return "Numéro invalide. Format attendu : 06XXXXXXXX, 07XXXXXXXX ou +2126XXXXXXXX.";
  }
  return null;
}

export function validateCIN(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Le CIN est requis.";
  if (!CIN_REGEX.test(trimmed)) {
    return "CIN invalide (ex : AB123456).";
  }
  return null;
}

export function validateName(value: string, label: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} est requis.`;
  if (!NAME_REGEX.test(trimmed)) {
    return `${label} ne doit contenir que des lettres.`;
  }
  return null;
}

export function validateBirthDate(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date invalide.";
  if (date > new Date()) return "La date de naissance ne peut pas être dans le futur.";
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  if (date < minDate) return "Date de naissance invalide.";
  return null;
}

export function validateAddress(value: string): string | null {
  if (value && value.trim().length > 200) {
    return "Adresse trop longue (200 caractères max).";
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Le mot de passe est requis.";
  if (value.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
  return null;
}

export function validateMedicalField(value: string, label: string): string | null {
  if (value && value.trim().length > 500) {
    return `${label} : 500 caractères maximum.`;
  }
  return null;
}

const ACCEPTED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

export function validateDocumentFile(file: File): string | null {
  if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) {
    return "Format non supporté. Formats acceptés : JPG, PNG, WEBP, PDF.";
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return "Fichier trop volumineux (10 Mo maximum).";
  }
  return null;
}
