import type { Variants } from "framer-motion";

/**
 * Shared Framer Motion variants so every page enters with the same subtle
 * fade-and-rise choreography introduced by the login experience.
 */
export const pageContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.06 },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};
