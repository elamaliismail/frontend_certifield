import type { ExtractionEngine } from "../types";

export const ENGINE_ORDER: ExtractionEngine[] = ["jigsawstack", "gemini", "mistral"];

export const ENGINE_LABELS: Record<ExtractionEngine, string> = {
  jigsawstack: "JigsawStack (OCR)",
  gemini: "Gemini 2.5 Flash",
  mistral: "Mistral",
};

export const MAX_EXTRACTION_ATTEMPTS = ENGINE_ORDER.length;

export function nextEngine(current?: ExtractionEngine): ExtractionEngine | null {
  if (!current) return ENGINE_ORDER[0];
  const index = ENGINE_ORDER.indexOf(current);
  if (index === -1 || index === ENGINE_ORDER.length - 1) return null;
  return ENGINE_ORDER[index + 1];
}
