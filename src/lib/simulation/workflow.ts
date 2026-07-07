import type { AgentRole, AgentStatus } from "@/types/agent";

interface Transition {
  status: AgentStatus;
  weight: number;
}

/** Default status graph shared by every role; roles below override specific branches. */
const DEFAULT_TRANSITIONS: Partial<Record<AgentStatus, Transition[]>> = {
  Idle: [
    { status: "Thinking", weight: 3 },
    { status: "Idle", weight: 1 },
  ],
  Thinking: [{ status: "Working", weight: 1 }],
  Working: [
    { status: "Review", weight: 3 },
    { status: "Completed", weight: 2 },
  ],
  Review: [
    { status: "Completed", weight: 4 },
    { status: "Working", weight: 1 },
  ],
  Debugging: [{ status: "Working", weight: 1 }],
  Testing: [
    { status: "Completed", weight: 3 },
    { status: "Debugging", weight: 1 },
  ],
  Deploying: [{ status: "Completed", weight: 1 }],
  Completed: [{ status: "Idle", weight: 1 }],
  Error: [{ status: "Debugging", weight: 1 }],
};

const ROLE_OVERRIDES: Partial<Record<AgentRole, Partial<Record<AgentStatus, Transition[]>>>> = {
  QA: {
    Working: [
      { status: "Testing", weight: 4 },
      { status: "Review", weight: 1 },
    ],
    Testing: [
      { status: "Debugging", weight: 2 },
      { status: "Completed", weight: 2 },
    ],
  },
  DevOps: {
    Working: [
      { status: "Deploying", weight: 4 },
      { status: "Review", weight: 1 },
    ],
    Deploying: [
      { status: "Error", weight: 1 },
      { status: "Completed", weight: 4 },
    ],
  },
  Backend: {
    Working: [
      { status: "Review", weight: 2 },
      { status: "Debugging", weight: 1 },
      { status: "Completed", weight: 2 },
    ],
  },
  Frontend: {
    Working: [
      { status: "Review", weight: 2 },
      { status: "Debugging", weight: 1 },
      { status: "Completed", weight: 2 },
    ],
  },
  AI: {
    Working: [
      { status: "Review", weight: 2 },
      { status: "Testing", weight: 1 },
      { status: "Completed", weight: 2 },
    ],
  },
};

/** Roughly how many ticks a status lasts before the engine rolls the next transition. */
export const STATUS_DURATION_TICKS: Record<AgentStatus, [min: number, max: number]> = {
  Idle: [2, 5],
  Thinking: [1, 2],
  Working: [3, 6],
  Review: [1, 3],
  Meeting: [4, 4],
  Debugging: [2, 4],
  Testing: [2, 4],
  Deploying: [2, 3],
  Completed: [1, 2],
  Error: [1, 2],
};

export function pickNextStatus(role: AgentRole, current: AgentStatus): AgentStatus {
  const transitions = ROLE_OVERRIDES[role]?.[current] ?? DEFAULT_TRANSITIONS[current] ?? [{ status: "Idle", weight: 1 }];
  const totalWeight = transitions.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const transition of transitions) {
    roll -= transition.weight;
    if (roll <= 0) return transition.status;
  }
  return transitions[transitions.length - 1]!.status;
}

export function randomDuration(status: AgentStatus): number {
  const [min, max] = STATUS_DURATION_TICKS[status];
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** A global all-hands meeting fires roughly this often (in ticks). */
export const MEETING_INTERVAL_TICKS = { min: 18, max: 26 };
export const MEETING_DURATION_TICKS = 4;
