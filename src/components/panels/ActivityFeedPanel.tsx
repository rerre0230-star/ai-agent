"use client";

import { useSimulationStore } from "@/store/useSimulationStore";
import { STATUS_META } from "@/lib/simulation/statusMeta";

export function ActivityFeedPanel() {
  const activityFeed = useSimulationStore((s) => s.activityFeed);

  return (
    <div className="flex h-full flex-col border-l border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-900/60">
      <div className="border-b border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Activity Feed
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
        {activityFeed.length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500">새 프로젝트를 생성하면 활동이 표시됩니다.</p>
        )}
        {activityFeed.map((item) => {
          const meta = STATUS_META[item.status];
          return (
            <div
              key={item.id}
              className="rounded-md bg-slate-100/70 px-2 py-1.5 text-[11px] leading-snug dark:bg-slate-800/60"
            >
              <span className="mr-1">{meta.icon}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">[{item.role}]</span>{" "}
              <span className="text-slate-600 dark:text-slate-300">{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
