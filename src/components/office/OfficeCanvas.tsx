"use client";

import { usePanZoom } from "@/hooks/usePanZoom";
import { useSimulationStore } from "@/store/useSimulationStore";
import { DeskTile } from "./DeskTile";
import { MeetingRoom } from "./MeetingRoom";

export function OfficeCanvas() {
  const agents = useSimulationStore((s) => s.agents);
  const {
    scale,
    offset,
    isDragging,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    zoomIn,
    zoomOut,
    reset,
  } = usePanZoom();

  const meetingAgents = agents.filter((a) => a.status === "Meeting");

  return (
    <div
      className="office-floor-pattern relative h-full w-full touch-none overflow-hidden bg-office-floor dark:bg-office-floordark"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{ transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
      >
        <MeetingRoom active={meetingAgents.length > 0} />
        {agents.map((agent) => {
          const meetingIndex = meetingAgents.findIndex((a) => a.id === agent.id);
          return (
            <DeskTile
              key={agent.id}
              agent={agent}
              meetingIndex={meetingIndex === -1 ? 0 : meetingIndex}
              meetingTotal={meetingAgents.length || 1}
            />
          );
        })}
      </div>

      <div className="absolute bottom-3 right-3 flex gap-1 rounded-lg bg-white/80 p-1 shadow-md backdrop-blur dark:bg-slate-800/80">
        <button
          type="button"
          onClick={zoomOut}
          className="h-7 w-7 rounded-md text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          −
        </button>
        <button
          type="button"
          onClick={reset}
          className="h-7 w-7 rounded-md text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          ⟳
        </button>
        <button
          type="button"
          onClick={zoomIn}
          className="h-7 w-7 rounded-md text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          +
        </button>
      </div>
    </div>
  );
}
