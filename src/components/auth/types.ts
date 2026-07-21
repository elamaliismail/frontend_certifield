import type { LucideIcon } from "lucide-react";

/** Credentials submitted by the sign-in form. */
export interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}

/** Per-field validation messages for the sign-in form. */
export interface LoginFieldErrors {
  email?: string;
  password?: string;
}

export interface LoginFormProps {
  /** Called with validated credentials when the user submits the form. */
  onSubmit: (credentials: LoginCredentials) => Promise<void> | void;
  /** Called when the user clicks "Forgot password". */
  onForgotPassword?: () => void;
  /** Global (non field-specific) error, e.g. from the auth backend. */
  error?: string | null;
  /** Neutral, informational message (e.g. a not-yet-wired action). */
  notice?: string | null;
  /** Whether a submission is in flight. */
  isSubmitting?: boolean;
}

/** A single floating icon rendered over the medical illustration. */
export interface FloatingIcon {
  icon: LucideIcon;
  /** CSS `top`/`left` anchor as percentage strings, e.g. "12%". */
  top: string;
  left: string;
  /** Animation delay in seconds, staggering the float loop. */
  delay: number;
  label: string;
}

/** A highlighted capability shown beneath the platform description. */
export interface Highlight {
  icon: LucideIcon;
  label: string;
}
