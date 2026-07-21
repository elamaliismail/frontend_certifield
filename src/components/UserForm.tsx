import { useState, type FormEvent } from "react";
import type { ManagedUser, ManagedUserFormInput, Role } from "../types";
import { validateEmail, validateName, validatePassword } from "../lib/validation";
import { Button } from "./ui";

interface UserFormProps {
  initialUser?: ManagedUser;
  onSubmit: (input: ManagedUserFormInput) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

const ROLES: Role[] = ["Administrateur", "Clinicien", "Opérateur"];

type FormErrors = Partial<Record<"fullName" | "email" | "role" | "password", string>>;

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-hc-primary focus:ring-2 focus:ring-hc-primary/20";

const errorInputClass =
  "mt-1.5 w-full rounded-xl border border-status-red-fg/50 px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-status-red-fg focus:ring-2 focus:ring-status-red-fg/20";

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

export function UserForm({ initialUser, onSubmit, onCancel, submitting }: UserFormProps) {
  const isEditing = Boolean(initialUser);
  const [fullName, setFullName] = useState(initialUser?.fullName ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [role, setRole] = useState<Role>(initialUser?.role ?? "Clinicien");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleBlur(key: "fullName" | "email" | "password") {
    let error: string | null = null;
    if (key === "fullName") error = validateName(fullName, "Le nom complet");
    if (key === "email") error = validateEmail(email);
    if (key === "password" && (!isEditing || password)) {
      error = validatePassword(password);
    }
    setErrors((prev) => ({ ...prev, [key]: error ?? undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const nextErrors: FormErrors = {
      fullName: validateName(fullName, "Le nom complet") ?? undefined,
      email: validateEmail(email) ?? undefined,
      password:
        !isEditing || password ? validatePassword(password) ?? undefined : undefined,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const input: ManagedUserFormInput = { fullName, email, role };
    if (password) input.password = password;
    await onSubmit(input);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Nom complet" required error={errors.fullName}>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={() => handleBlur("fullName")}
          className={errors.fullName ? errorInputClass : inputClass}
        />
      </Field>

      <Field label="E-mail" required error={errors.email}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur("email")}
          className={errors.email ? errorInputClass : inputClass}
        />
      </Field>

      <Field label="Rôle" required>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className={inputClass}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label={isEditing ? "Mot de passe" : "Mot de passe"}
        required={!isEditing}
        error={errors.password}
      >
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur("password")}
          placeholder={isEditing ? "Laisser vide pour ne pas changer" : undefined}
          className={errors.password ? errorInputClass : inputClass}
        />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" fullWidth={false} type="button" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" fullWidth={false} disabled={submitting}>
          {submitting
            ? "Enregistrement..."
            : isEditing
              ? "Enregistrer les modifications"
              : "Créer l'utilisateur"}
        </Button>
      </div>
    </form>
  );
}
