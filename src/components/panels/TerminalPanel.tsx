"use client";

import { useEffect, useRef, useState } from "react";
import { useSimulationStore } from "@/store/useSimulationStore";
import type { LogItem } from "@/types/agent";

const LEVEL_COLOR: Record<LogItem["level"], string> = {
  info: "text-slate-300",
  success: "text-emerald-400",
  warn: "text-amber-400",
  error: "text-rose-400",
};

export function TerminalPanel() {
  const terminalLogs = useSimulationStore((s) => s.terminalLogs);
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  return (
    <div className="border-t border-slate-800 bg-slate-950">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-200"
      >
        <span>Terminal</span>
        <span>{collapsed ? "▲ 펼치기" : "▼ 접기"}</span>
      </button>
      {!collapsed && (
        <div ref={scrollRef} className="h-40 overflow-y-auto px-3 pb-2 font-mono text-[11px] leading-relaxed">
          {terminalLogs.length === 0 && <p className="text-slate-600">$ waiting for simulation to start...</p>}
          {terminalLogs.map((log) => (
            <p key={log.id} className={LEVEL_COLOR[log.level]}>
              <span className="text-slate-600">[{String(log.tick).padStart(3, "0")}]</span>{" "}
              <span className="text-slate-400">[{log.role}]</span> {log.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
