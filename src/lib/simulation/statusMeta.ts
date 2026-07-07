import type { AgentStatus } from "@/types/agent";

export interface StatusMeta {
  icon: string;
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const STATUS_META: Record<AgentStatus, StatusMeta> = {
  Idle: { icon: "💤", label: "Idle", badgeClass: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300", dotClass: "bg-slate-400" },
  Thinking: { icon: "💡", label: "Thinking...", badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300", dotClass: "bg-yellow-400" },
  Working: { icon: "⌨️", label: "Coding...", badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300", dotClass: "bg-blue-500" },
  Review: { icon: "📋", label: "Reviewing", badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300", dotClass: "bg-purple-500" },
  Meeting: { icon: "🧑‍🤝‍🧑", label: "In Meeting", badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300", dotClass: "bg-orange-500" },
  Debugging: { icon: "🐞", label: "Bug Found", badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300", dotClass: "bg-red-500" },
  Testing: { icon: "🧪", label: "Testing...", badgeClass: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300", dotClass: "bg-teal-500" },
  Deploying: { icon: "🚀", label: "Deploying...", badgeClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300", dotClass: "bg-indigo-500" },
  Completed: { icon: "✅", label: "Completed", badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300", dotClass: "bg-green-500" },
  Error: { icon: "❗", label: "Error", badgeClass: "bg-rose-200 text-rose-800 dark:bg-rose-900/70 dark:text-rose-200", dotClass: "bg-rose-600" },
};
