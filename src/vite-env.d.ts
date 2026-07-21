/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_WEBHOOK_URL: string;
  readonly VITE_AUTH_CALLBACK_URL: string;
  readonly VITE_PATIENTS_LIST_WEBHOOK_URL: string;
  readonly VITE_PATIENTS_CREATE_WEBHOOK_URL: string;
  readonly VITE_MEDICAL_RECORD_WEBHOOK_URL: string;
  readonly VITE_MEDICAL_RECORD_UPDATE_WEBHOOK_URL: string;
  readonly VITE_DOCUMENTS_LIST_WEBHOOK_URL: string;
  readonly VITE_DOCUMENT_EXTRACT_WEBHOOK_URL: string;
  readonly VITE_DOCUMENT_VALIDATE_WEBHOOK_URL: string;
  readonly VITE_DOCUMENTS_QUEUE_WEBHOOK_URL: string;
  readonly VITE_DOCUMENT_SIGN_WEBHOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
