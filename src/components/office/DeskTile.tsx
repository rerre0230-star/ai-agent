"use client";

import { motion } from "framer-motion";
import { gridToScreen } from "@/lib/isometric";
import { meetingSeatFor } from "@/lib/simulation/agents";
import { useSimulationStore } from "@/store/useSimulationStore";
import type { Agent } from "@/types/agent";
import { AgentSprite } from "./AgentSprite";
import { StatusBubble } from "./StatusBubble";

interface DeskTileProps {
  agent: Agent;
  meetingIndex: number;
  meetingTotal: number;
}

export function DeskTile({ agent, meetingIndex, meetingTotal }: DeskTileProps) {
  const selectAgent = useSimulationStore((s) => s.selectAgent);
  const position = agent.status === "Meeting" ? meetingSeatFor(meetingIndex, meetingTotal) : agent.desk;
  const { left, top } = gridToScreen(position);
  const depth = Math.round((position.x + position.y) * 10) + 100;

  return (
    <motion.button
      type="button"
      onClick={() => selectAgent(agent.id)}
      className="absolute flex -translate-x-1/2 flex-col items-center focus:outline-none"
      style={{ width: 96, zIndex: depth }}
      initial={false}
      animate={{ left, top }}
      transition={{ type: "spring", stiffness: 90, damping: 16 }}
    >
      <StatusBubble status={agent.status} />
      <AgentSprite color={agent.color} status={agent.status} />
      <div className="relative mt-1 h-6 w-16 rounded-sm bg-amber-700 shadow-md dark:bg-amber-800">
        <div
          className="absolute -top-3 left-1/2 h-3 w-6 -translate-x-1/2 rounded-[2px] border-2"
          style={{ borderColor: agent.color, backgroundColor: "#0f172a" }}
        />
      </div>
      <div className="mt-1 h-2 w-6 rounded-full bg-slate-400/70 dark:bg-slate-600/70" />
      <span className="mt-1 rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm dark:bg-slate-800/80 dark:text-slate-200">
        {agent.name}
      </span>
    </motion.button>
  );
}
