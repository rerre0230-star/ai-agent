import { gridToScreen } from "@/lib/isometric";
import { MEETING_ROOM_CENTER } from "@/lib/simulation/agents";

export function MeetingRoom({ active }: { active: boolean }) {
  const { left, top } = gridToScreen(MEETING_ROOM_CENTER);

  return (
    <div
      className={`absolute flex items-center justify-center rounded-full border-2 border-dashed transition-colors duration-300 ${
        active
          ? "border-orange-400 bg-orange-100/70 dark:bg-orange-500/10"
          : "border-slate-300 bg-white/40 dark:border-slate-700 dark:bg-slate-800/30"
      }`}
      style={{ left: left - 90, top: top - 50, width: 180, height: 100, zIndex: 1 }}
    >
      <span className="select-none text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Meeting Room
      </span>
    </div>
  );
}
