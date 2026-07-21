import type { LoginFieldErrors } from "./types";

/**
 * Lightweight `className` combiner. Filters out falsy values so callers can
 * write conditional classes inline without pulling in extra dependencies.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns an English error message, or `null` when the email is valid. */
export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Email is required.";
  if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address.";
  return null;
}

/** Returns an English error message, or `null` when the password is valid. */
export function validatePassword(value: string): string | null {
  if (!value) return "Password is required.";
  if (value.length < 6) return "Password must be at least 6 characters.";
  return null;
}

/** Validates the whole sign-in form in one pass. */
export function validateLoginForm(
  email: string,
  password: string,
): LoginFieldErrors {
  return {
    email: validateEmail(email) ?? undefined,
    password: validatePassword(password) ?? undefined,
  };
}

/** True when no field currently carries an error message. */
export function isFormValid(errors: LoginFieldErrors): boolean {
  return !errors.email && !errors.password;
}
