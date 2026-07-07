"use client";

import { useEffect } from "react";
import { useSimulationStore } from "@/store/useSimulationStore";

const TICK_INTERVAL_MS = 1200;

/** Drives the simulation engine forward on a fixed interval while running. */
export function useSimulationTick() {
  const isRunning = useSimulationStore((s) => s.isRunning);
  const stepTick = useSimulationStore((s) => s.stepTick);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(stepTick, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isRunning, stepTick]);
}
