"use client";

import { AnimatePresence, motion } from "framer-motion";
import { STATUS_META } from "@/lib/simulation/statusMeta";
import type { AgentStatus } from "@/types/agent";

export function StatusBubble({ status }: { status: AgentStatus }) {
  const meta = STATUS_META[status];

  return (
    <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 6, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.85 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-1 whitespace-nowrap rounded-full border border-white/60 bg-white/90 px-2 py-0.5 text-[10px] font-semibold shadow-sm dark:border-slate-600 dark:bg-slate-800/90"
        >
          <span>{meta.icon}</span>
          <span className="text-slate-600 dark:text-slate-200">{meta.label}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
