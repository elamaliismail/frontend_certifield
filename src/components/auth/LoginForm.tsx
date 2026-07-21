import { useState, type FormEvent } from "react";
import { motion, type Variants } from "framer-motion";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Checkbox } from "../ui/Checkbox";
import certifieldLogo from "../../assets/certifield-logo.png";
import type { LoginFieldErrors, LoginFormProps } from "./types";
import { isFormValid, validateEmail, validatePassword, validateLoginForm } from "./utils";

const container: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.07 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

/**
 * The right-hand authentication card: brand header and the email/password
 * form. Owns its own field state and validation; the parent supplies
 * `onSubmit` and connects it to the real auth flow.
 */
export function LoginForm({
  onSubmit,
  onForgotPassword,
  error,
  notice,
  isSubmitting = false,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isSubmitting) return;

    const errors = validateLoginForm(email, password);
    setFieldErrors(errors);
    if (!isFormValid(errors)) return;

    await onSubmit({ email: email.trim(), password, remember });
  }

  return (
    <motion.div
      className="w-full max-w-md"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Mobile logo (illustration is hidden on small screens) */}
      <motion.div variants={item} className="mb-8 flex items-center gap-3 lg:hidden">
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
          <img
            src={certifieldLogo}
            alt=""
            className="h-full w-full object-contain"
          />
        </span>
        <span className="text-lg font-semibold text-ink-900">Certifield</span>
      </motion.div>

      <motion.h2
        variants={item}
        className="text-2xl font-semibold tracking-tight text-ink-900"
      >
        Welcome to Certifield
      </motion.h2>
      <motion.p variants={item} className="mt-1 text-sm text-ink-600">
        Access your secure healthcare workspace
      </motion.p>

      {error && (
        <motion.div
          variants={item}
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl bg-status-red-bg px-3 py-2.5 text-sm text-status-red-fg"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </motion.div>
      )}

      {notice && !error && (
        <motion.div
          variants={item}
          role="status"
          className="mt-5 flex items-start gap-2 rounded-xl bg-status-blue-bg px-3 py-2.5 text-sm text-status-blue-fg"
        >
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>{notice}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <motion.div variants={item}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@hospital.com"
            icon={<Mail size={16} />}
            value={email}
            error={fieldErrors.email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() =>
              setFieldErrors((prev) => ({
                ...prev,
                email: validateEmail(email) ?? undefined,
              }))
            }
          />
        </motion.div>

        <motion.div variants={item}>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            icon={<Lock size={16} />}
            value={password}
            error={fieldErrors.password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() =>
              setFieldErrors((prev) => ({
                ...prev,
                password: validatePassword(password) ?? undefined,
              }))
            }
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="rounded-md p-1 text-ink-400 transition-colors hover:text-ink-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-hc-primary/40"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </motion.div>

        <motion.div
          variants={item}
          className="flex items-center justify-between"
        >
          <Checkbox
            label="Remember me"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <button
            type="button"
            onClick={onForgotPassword}
            className="rounded-md text-sm font-medium text-hc-primary transition-colors hover:text-hc-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-hc-primary/40"
          >
            Forgot password?
          </button>
        </motion.div>

        <motion.div variants={item}>
          <Button type="submit" shine disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </motion.div>
      </form>

      <motion.p
        variants={item}
        className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-400"
      >
        <ShieldCheck size={14} aria-hidden />
        Protected by enterprise-grade encryption.
      </motion.p>
    </motion.div>
  );
}
