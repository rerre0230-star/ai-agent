import type { AgentStatus } from "@/types/agent";

const ACTIVE_STATUSES: AgentStatus[] = ["Working", "Debugging", "Testing", "Deploying"];

export function AgentSprite({ color, status }: { color: string; status: AgentStatus }) {
  const isActive = ACTIVE_STATUSES.includes(status);

  return (
    <div className={`relative h-9 w-7 ${isActive ? "animate-typing" : ""}`}>
      <div className="pixelated absolute left-1/2 top-0 h-3 w-4 -translate-x-1/2 rounded-sm bg-[#f4c9a0]">
        <span className="absolute left-[3px] top-[5px] h-[2px] w-[2px] animate-blink bg-slate-800" />
        <span className="absolute right-[3px] top-[5px] h-[2px] w-[2px] animate-blink bg-slate-800" />
      </div>
      <div
        className="pixelated absolute left-1/2 top-3 h-5 w-6 -translate-x-1/2 rounded-sm shadow-sm"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
