import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Les webhooks des workflows (Agentic AI) refusent les requêtes
  // cross-origin du navigateur (CORS). En dev, on les proxifie côté serveur
  // Vite pour l'éviter — un couple (chemin local, variable d'env) par webhook.
  const webhookProxies: [string, string][] = [
    ['/auth-webhook', 'VITE_AUTH_WEBHOOK_URL'],
    ['/patients-list-webhook', 'VITE_PATIENTS_LIST_WEBHOOK_URL'],
    ['/patients-create-webhook', 'VITE_PATIENTS_CREATE_WEBHOOK_URL'],
    ['/medical-record-webhook', 'VITE_MEDICAL_RECORD_WEBHOOK_URL'],
    ['/medical-record-update-webhook', 'VITE_MEDICAL_RECORD_UPDATE_WEBHOOK_URL'],
    ['/documents-list-webhook', 'VITE_DOCUMENTS_LIST_WEBHOOK_URL'],
    ['/document-extract-webhook', 'VITE_DOCUMENT_EXTRACT_WEBHOOK_URL'],
    ['/document-validate-webhook', 'VITE_DOCUMENT_VALIDATE_WEBHOOK_URL'],
    ['/documents-queue-webhook', 'VITE_DOCUMENTS_QUEUE_WEBHOOK_URL'],
    ['/document-sign-webhook', 'VITE_DOCUMENT_SIGN_WEBHOOK_URL'],
    ['/patient-qa-webhook', 'VITE_PATIENT_QA_WEBHOOK_URL'],
  ]

  const proxy: Record<string, ProxyOptions> = {}
  for (const [path, envVar] of webhookProxies) {
    const webhookUrl = env[envVar]
    if (!webhookUrl) continue
    proxy[path] = {
      target: new URL(webhookUrl).origin,
      changeOrigin: true,
      rewrite: () => new URL(webhookUrl).pathname,
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
    proxy,
  },
  }
})
