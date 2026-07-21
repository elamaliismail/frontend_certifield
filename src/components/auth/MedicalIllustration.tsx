import { motion, type Variants } from "framer-motion";
import {
  Activity,
  Calendar,
  FileHeart,
  Hospital,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";
import certifieldLogo from "../../assets/certifield-logo.png";
import type { FloatingIcon, Highlight } from "./types";

// Positions are kept in the right two-thirds / top of the panel so the
// floating icons never sit behind the headline + description column (which
// occupies the lower-left) and hurt legibility.
const FLOATING_ICONS: FloatingIcon[] = [
  { icon: Hospital, top: "12%", left: "60%", delay: 0, label: "Connected hospitals" },
  { icon: Stethoscope, top: "22%", left: "84%", delay: 0.6, label: "Clinical care" },
  { icon: Activity, top: "40%", left: "68%", delay: 1.2, label: "Live vitals" },
  { icon: FileHeart, top: "64%", left: "86%", delay: 0.9, label: "Medical records" },
  { icon: Calendar, top: "52%", left: "90%", delay: 1.6, label: "Appointments" },
  { icon: UserRound, top: "80%", left: "72%", delay: 0.3, label: "Patients" },
];

const HIGHLIGHTS: Highlight[] = [
  { icon: ShieldCheck, label: "HIPAA-ready security" },
  { icon: Activity, label: "Real-time analytics" },
  { icon: FileHeart, label: "Unified records" },
];

/** Animated ECG heartbeat line drawn along the panel. */
function EcgLine() {
  return (
    <svg
      viewBox="0 0 300 60"
      className="h-14 w-full text-white/70"
      fill="none"
      aria-hidden
    >
      <motion.path
        d="M0 30 H70 l8 -20 l10 40 l8 -30 l7 15 H150 l8 -22 l10 44 l8 -32 l7 14 H300"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * Left promotional panel for the authentication screen. Presents the platform
 * brand over an animated medical-network background. Hidden on mobile by the
 * parent layout.
 */
export function MedicalIllustration() {
  return (
    <section
      aria-label="Certifield platform overview"
      className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-hc-primary to-hc-secondary p-12 text-white lg:flex"
    >
      <AnimatedBackground />

      {/* Floating healthcare icons */}
      {FLOATING_ICONS.map(({ icon: Icon, top, left, delay, label }) => (
        <motion.div
          key={label}
          aria-hidden
          className="pointer-events-none absolute flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm"
          style={{ top, left }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { duration: 0.6, delay },
            scale: { duration: 0.6, delay },
            y: { duration: 4, delay, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Icon size={20} strokeWidth={1.75} />
        </motion.div>
      ))}

      {/* Logo */}
      <motion.div
        className="relative z-10 flex items-center gap-3"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-sm ring-1 ring-white/40">
          <img
            src={certifieldLogo}
            alt=""
            className="h-full w-full object-contain"
          />
        </span>
        <span className="text-lg font-semibold tracking-tight">Certifield</span>
      </motion.div>

      {/* Headline block */}
      <motion.div
        className="relative z-10 max-w-md"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="mb-6">
          <EcgLine />
        </motion.div>
        <motion.h1
          variants={item}
          className="text-4xl font-semibold leading-tight tracking-tight"
        >
          Certifield
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-3 text-lg font-medium text-white/90"
        >
          Chaque champ est certifié.
        </motion.p>
        <motion.p variants={item} className="mt-4 max-w-sm text-sm leading-relaxed text-white/90">
          Manage patients, appointments, prescriptions, medical records and
          healthcare analytics from one intelligent platform.
        </motion.p>
      </motion.div>

      {/* Highlights */}
      <motion.ul
        className="relative z-10 flex flex-wrap gap-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {HIGHLIGHTS.map(({ icon: Icon, label }) => (
          <motion.li
            key={label}
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm"
          >
            <Icon size={14} strokeWidth={2} />
            {label}
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
