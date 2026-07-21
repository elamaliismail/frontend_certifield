import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { EmptyState, fadeUp } from "../components/ui";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="flex min-h-[70vh] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white"
    >
      <EmptyState
        icon={Sparkles}
        title={title}
        description="Cet écran sera construit dans les prochaines journées du planning."
      />
    </motion.div>
  );
}
