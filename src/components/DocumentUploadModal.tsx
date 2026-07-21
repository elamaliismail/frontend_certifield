import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { validateDocumentFile } from "../lib/validation";
import { Banner, Button } from "./ui";

interface DocumentUploadModalProps {
  onUpload: (file: File) => void | Promise<void>;
  onClose: () => void;
  submitting?: boolean;
}

export function DocumentUploadModal({
  onUpload,
  onClose,
  submitting,
}: DocumentUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(selected: File | null) {
    if (!selected) return;
    const validationError = validateDocumentFile(selected);
    if (validationError) {
      setError(validationError);
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setError(null);
    setFile(selected);
    setPreviewUrl(
      selected.type.startsWith("image/") ? URL.createObjectURL(selected) : null,
    );
  }

  async function handleSubmit() {
    if (!file || submitting) return;
    await onUpload(file);
  }

  return (
    <div className="space-y-4">
      <label
        className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-hc-bg p-8 text-center transition-colors hover:border-hc-primary hover:bg-hc-primary/5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0] ?? null);
        }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-hc-primary to-hc-secondary text-white shadow-sm shadow-hc-primary/30">
          <Upload size={22} />
        </span>
        <span className="text-sm font-medium text-ink-900">
          Cliquez ou glissez un fichier ici
        </span>
        <span className="text-xs text-ink-400">JPG, PNG, WEBP ou PDF — 10 Mo max</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {error && <Banner tone="red">{error}</Banner>}

      {file && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-ink-400">
              <FileText size={24} />
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-ink-900">
              {file.name}
            </div>
            <div className="text-xs text-ink-400">
              {(file.size / 1024).toFixed(0)} Ko
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" fullWidth={false} type="button" onClick={onClose}>
          Annuler
        </Button>
        <Button
          type="button"
          fullWidth={false}
          disabled={!file || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Analyse OCR / IA en cours..." : "Importer et analyser"}
        </Button>
      </div>
    </div>
  );
}
