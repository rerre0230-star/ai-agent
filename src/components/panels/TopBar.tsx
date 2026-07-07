"use client";

import { useSimulationStore } from "@/store/useSimulationStore";
import type { Department } from "@/types/agent";
import { ProgressBar } from "./ProgressBar";

const DEPARTMENTS: { key: Department; colorClass: string }[] = [
  { key: "Frontend", colorClass: "bg-sky-500" },
  { key: "Backend", colorClass: "bg-emerald-500" },
  { key: "Design", colorClass: "bg-pink-500" },
  { key: "QA", colorClass: "bg-amber-500" },
  { key: "Deploy", colorClass: "bg-orange-500" },
];

export function TopBar() {
  const progress = useSimulationStore((s) => s.progress);
  const isRunning = useSimulationStore((s) => s.isRunning);
  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const theme = useSimulationStore((s) => s.theme);
  const toggleTheme = useSimulationStore((s) => s.toggleTheme);

  return (
    <header className="relative z-40 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 bg-white/80 px-4 py-2 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="flex items-center gap-2">
        <span className="text-lg">🏢</span>
        <h1 className="text-sm font-bold tracking-tight">AI Company Simulator</h1>
      </div>

      <button
        type="button"
        onClick={startSimulation}
        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {isRunning ? "🔄 재시작" : "▶ 새 프로젝트 생성"}
      </button>

      <div className="min-w-[160px] flex-1 basis-40">
        <ProgressBar label="Overall" value={progress.overall} colorClass="bg-slate-900 dark:bg-white" />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {DEPARTMENTS.map((d) => (
          <div key={d.key} className="w-28">
            <ProgressBar label={d.key} value={progress[d.key]} colorClass={d.colorClass} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className="ml-auto rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
      >
        {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
      </button>
    </header>
  );
}
