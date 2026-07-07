import { create } from "zustand";
import type { Agent, ActivityItem, LogItem, ProgressState } from "@/types/agent";
import { createInitialState, runTick, type SimulationState } from "@/lib/simulation/engine";

interface SimulationStore {
  tick: number;
  agents: Agent[];
  activityFeed: ActivityItem[];
  terminalLogs: LogItem[];
  progress: ProgressState;
  isRunning: boolean;
  selectedAgentId: string | null;
  theme: "light" | "dark";
  startSimulation: () => void;
  stepTick: () => void;
  selectAgent: (id: string | null) => void;
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

function applyState(sim: SimulationState) {
  return {
    tick: sim.tick,
    agents: sim.agents,
    activityFeed: sim.activityFeed,
    terminalLogs: sim.terminalLogs,
    progress: sim.progress,
  };
}

let simState: SimulationState = createInitialState();

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  ...applyState(simState),
  isRunning: false,
  selectedAgentId: null,
  theme: "light",
  startSimulation: () => {
    simState = createInitialState();
    set({ ...applyState(simState), isRunning: true });
  },
  stepTick: () => {
    if (!get().isRunning) return;
    simState = runTick(simState);
    set(applyState(simState));
  },
  selectAgent: (id) => set({ selectedAgentId: id }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  setTheme: (theme) => set({ theme }),
}));
