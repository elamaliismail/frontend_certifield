import { useState, type FormEvent } from "react";
import type { ConsultationFormInput } from "../types";
import { Button } from "./ui";

interface ConsultationFormProps {
  onSubmit: (input: ConsultationFormInput) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

const EMPTY_FORM: ConsultationFormInput = {
  consultationDate: new Date().toISOString().slice(0, 10),
  diagnosis: "",
  prescription: "",
  notes: "",
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-hc-primary focus:ring-2 focus:ring-hc-primary/20";

export function ConsultationForm({
  onSubmit,
  onCancel,
  submitting,
}: ConsultationFormProps) {
  const [form, setForm] = useState<ConsultationFormInput>(EMPTY_FORM);

  function update<K extends keyof ConsultationFormInput>(
    key: K,
    value: ConsultationFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-ink-900">
        Date de consultation
        <input
          type="date"
          value={form.consultationDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => update("consultationDate", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-medium text-ink-900">
        Diagnostic
        <textarea
          value={form.diagnosis}
          onChange={(e) => update("diagnosis", e.target.value)}
          rows={2}
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-medium text-ink-900">
        Prescription
        <textarea
          value={form.prescription}
          onChange={(e) => update("prescription", e.target.value)}
          rows={2}
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-medium text-ink-900">
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={2}
          className={inputClass}
        />
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" fullWidth={false} type="button" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" fullWidth={false} disabled={submitting}>
          {submitting ? "Enregistrement..." : "Ajouter la consultation"}
        </Button>
      </div>
    </form>
  );
}
