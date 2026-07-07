"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSimulationStore } from "@/store/useSimulationStore";
import { STATUS_META } from "@/lib/simulation/statusMeta";

export function AgentProfilePanel() {
  const selectedAgentId = useSimulationStore((s) => s.selectedAgentId);
  const agents = useSimulationStore((s) => s.agents);
  const terminalLogs = useSimulationStore((s) => s.terminalLogs);
  const progress = useSimulationStore((s) => s.progress);
  const selectAgent = useSimulationStore((s) => s.selectAgent);

  const agent = agents.find((a) => a.id === selectedAgentId);
  const recentLogs = agent
    ? terminalLogs
        .filter((l) => l.role === agent.role)
        .slice(-6)
        .reverse()
    : [];
  const departmentProgress = agent?.department ? progress[agent.department] : null;

  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
          className="fixed right-0 top-0 z-30 h-screen w-72 overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <button
            type="button"
            onClick={() => selectAgent(null)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: agent.accent }}
            >
              {STATUS_META[agent.status].icon}
            </div>
            <div>
              <p className="font-bold">{agent.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{agent.role} Agent</p>
            </div>
          </div>

          <span
            className={`mt-3 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_META[agent.status].badgeClass}`}
          >
            {STATUS_META[agent.status].label}
          </span>

          <dl className="mt-4 space-y-3 text-xs">
            <div>
              <dt className="text-slate-400">현재 작업</dt>
              <dd className="font-medium text-slate-700 dark:text-slate-200">{agent.currentTask}</dd>
            </div>
            {departmentProgress !== null && (
              <div>
                <dt className="text-slate-400">부문 진행률 ({agent.department})</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{Math.round(departmentProgress)}%</dd>
              </div>
            )}
            <div>
              <dt className="text-slate-400">Last Commit</dt>
              <dd className="truncate font-mono text-[11px] text-slate-700 dark:text-slate-200">{agent.lastCommit}</dd>
            </div>
            <div className="flex gap-4">
              <div>
                <dt className="text-slate-400">예상 완료</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{agent.etaMinutes}분</dd>
              </div>
              <div>
                <dt className="text-slate-400">CPU 사용률</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{agent.cpu}%</dd>
              </div>
            </div>
          </dl>

          <div className="mt-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">최근 로그</p>
            <div className="space-y-1">
              {recentLogs.length === 0 && <p className="text-[11px] text-slate-400">기록 없음</p>}
              {recentLogs.map((log) => (
                <p key={log.id} className="text-[11px] text-slate-600 dark:text-slate-300">
                  [{String(log.tick).padStart(3, "0")}] {log.text}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
