import { useState, type FormEvent } from "react";
import type { PatientFormInput } from "../types";
import { Button } from "./ui";
import {
  validateAddress,
  validateBirthDate,
  validateCIN,
  validateEmail,
  validateName,
  validatePhone,
} from "../lib/validation";

interface PatientFormProps {
  onSubmit: (input: PatientFormInput) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

const EMPTY_FORM: PatientFormInput = {
  firstName: "",
  lastName: "",
  cin: "",
  birthDate: "",
  phone: "",
  email: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
};

type FormErrors = Partial<Record<keyof PatientFormInput, string>>;

function validateField(
  key: keyof PatientFormInput,
  value: string,
): string | null {
  switch (key) {
    case "firstName":
      return validateName(value, "Le prénom");
    case "lastName":
      return validateName(value, "Le nom");
    case "cin":
      return validateCIN(value);
    case "birthDate":
      return validateBirthDate(value);
    case "phone":
      return validatePhone(value, false);
    case "email":
      return validateEmail(value, false);
    case "address":
      return validateAddress(value);
    case "emergencyContactName":
      return value ? validateName(value, "Le contact d'urgence") : null;
    case "emergencyContactPhone":
      return validatePhone(value, false);
    default:
      return null;
  }
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-ink-900">
      {label}
      {required && <span className="text-status-red-fg"> *</span>}
      {children}
      {error && (
        <span className="mt-1 block text-xs font-normal text-status-red-fg">
          {error}
        </span>
      )}
    </label>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-hc-primary focus:ring-2 focus:ring-hc-primary/20";

const errorInputClass =
  "mt-1.5 w-full rounded-xl border border-status-red-fg/50 px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-status-red-fg focus:ring-2 focus:ring-status-red-fg/20";

export function PatientForm({
  onSubmit,
  onCancel,
  submitting,
}: PatientFormProps) {
  const [form, setForm] = useState<PatientFormInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  function update<K extends keyof PatientFormInput>(
    key: K,
    value: PatientFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleBlur(key: keyof PatientFormInput) {
    const error = validateField(key, form[key] ?? "");
    setErrors((prev) => ({ ...prev, [key]: error ?? undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const nextErrors: FormErrors = {};
    (Object.keys(form) as (keyof PatientFormInput)[]).forEach((key) => {
      const error = validateField(key, form[key] ?? "");
      if (error) nextErrors[key] = error;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Prénom" required error={errors.firstName}>
          <input
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            onBlur={() => handleBlur("firstName")}
            className={errors.firstName ? errorInputClass : inputClass}
          />
        </Field>
        <Field label="Nom" required error={errors.lastName}>
          <input
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            onBlur={() => handleBlur("lastName")}
            className={errors.lastName ? errorInputClass : inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="CIN" required error={errors.cin}>
          <input
            value={form.cin}
            onChange={(e) => update("cin", e.target.value.toUpperCase())}
            onBlur={() => handleBlur("cin")}
            placeholder="AB123456"
            className={errors.cin ? errorInputClass : inputClass}
          />
        </Field>
        <Field label="Date de naissance" error={errors.birthDate}>
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => update("birthDate", e.target.value)}
            onBlur={() => handleBlur("birthDate")}
            max={new Date().toISOString().slice(0, 10)}
            className={errors.birthDate ? errorInputClass : inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Téléphone" error={errors.phone}>
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            onBlur={() => handleBlur("phone")}
            placeholder="06XXXXXXXX"
            className={errors.phone ? errorInputClass : inputClass}
          />
        </Field>
        <Field label="E-mail" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={errors.email ? errorInputClass : inputClass}
          />
        </Field>
      </div>

      <Field label="Adresse" error={errors.address}>
        <input
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          onBlur={() => handleBlur("address")}
          className={errors.address ? errorInputClass : inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Contact d'urgence — nom"
          error={errors.emergencyContactName}
        >
          <input
            value={form.emergencyContactName}
            onChange={(e) => update("emergencyContactName", e.target.value)}
            onBlur={() => handleBlur("emergencyContactName")}
            className={
              errors.emergencyContactName ? errorInputClass : inputClass
            }
          />
        </Field>
        <Field
          label="Contact d'urgence — téléphone"
          error={errors.emergencyContactPhone}
        >
          <input
            value={form.emergencyContactPhone}
            onChange={(e) => update("emergencyContactPhone", e.target.value)}
            onBlur={() => handleBlur("emergencyContactPhone")}
            placeholder="06XXXXXXXX"
            className={
              errors.emergencyContactPhone ? errorInputClass : inputClass
            }
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" fullWidth={false} type="button" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" fullWidth={false} disabled={submitting}>
          {submitting ? "Enregistrement..." : "Créer le patient"}
        </Button>
      </div>
    </form>
  );
}
