import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { WorkflowError } from "../../lib/api";
import { MedicalIllustration } from "./MedicalIllustration";
import { LoginForm } from "./LoginForm";
import type { LoginCredentials } from "./types";

/**
 * Full-page Certifield authentication experience. Composes the animated
 * medical illustration (left) with the sign-in form (right) and wires the form
 * to the app's authentication context.
 */
export function HealthcareLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit({ email, password }: LoginCredentials) {
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/app/dashboard");
    } catch (err) {
      setError(
        err instanceof WorkflowError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleForgotPassword() {
    setError(null);
    setNotice("Password recovery is coming soon — contact your administrator.");
  }

  return (
    <main className="flex min-h-screen bg-hc-bg">
      <MedicalIllustration />
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
        <LoginForm
          onSubmit={handleSubmit}
          onForgotPassword={handleForgotPassword}
          error={error}
          notice={notice}
          isSubmitting={isSubmitting}
        />
      </div>
    </main>
  );
}
