"use client";

import { useEffect } from "react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { useSimulationTick } from "@/hooks/useSimulationTick";
import { OfficeCanvas } from "./office/OfficeCanvas";
import { TopBar } from "./panels/TopBar";
import { ActivityFeedPanel } from "./panels/ActivityFeedPanel";
import { TerminalPanel } from "./panels/TerminalPanel";
import { AgentProfilePanel } from "./panels/AgentProfilePanel";

export function AppShell() {
  useSimulationTick();
  const theme = useSimulationStore((s) => s.theme);
  const setTheme = useSimulationStore((s) => s.setTheme);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    }
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-office-floor text-slate-800 dark:bg-office-floordark dark:text-slate-100">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1">
          <OfficeCanvas />
        </main>
        <aside className="w-56 shrink-0 sm:w-64 lg:w-72">
          <ActivityFeedPanel />
        </aside>
      </div>
      <TerminalPanel />
      <AgentProfilePanel />
    </div>
  );
}
