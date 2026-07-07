import type { Agent, ActivityItem, LogItem, ProgressState } from "@/types/agent";
import { AGENT_ROSTER } from "./agents";
import {
  pickNextStatus,
  randomDuration,
  MEETING_INTERVAL_TICKS,
  MEETING_DURATION_TICKS,
} from "./workflow";
import {
  buildActivityText,
  buildTerminalText,
  pickTask,
  generateCommitMessage,
  generateCommitHash,
  MEETING_LOG_LINES,
} from "./messages";

const MAX_ACTIVITY_ITEMS = 60;
const MAX_TERMINAL_ITEMS = 200;

export interface MeetingState {
  active: boolean;
  ticksRemaining: number;
  nextMeetingTick: number;
  lineIndex: number;
}

export interface SimulationState {
  tick: number;
  agents: Agent[];
  activityFeed: ActivityItem[];
  terminalLogs: LogItem[];
  progress: ProgressState;
  meeting: MeetingState;
}

let idCounter = 0;
function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now().toString(36)}`;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function nextMeetingTickFrom(tick: number): number {
  return tick + Math.floor(randomBetween(MEETING_INTERVAL_TICKS.min, MEETING_INTERVAL_TICKS.max));
}

export function createInitialState(): SimulationState {
  const agents: Agent[] = AGENT_ROSTER.map((def) => ({
    ...def,
    status: "Idle",
    currentTask: pickTask(def.role),
    progress: 0,
    cpu: Math.round(randomBetween(8, 25)),
    lastCommit: `${generateCommitHash()} ${generateCommitMessage()}`,
    etaMinutes: Math.round(randomBetween(5, 40)),
    statusSince: 0,
    statusDurationTicks: randomDuration("Idle"),
  }));

  return {
    tick: 0,
    agents,
    activityFeed: [],
    terminalLogs: [],
    progress: { overall: 0, Frontend: 0, Backend: 0, Design: 0, QA: 0, Deploy: 0 },
    meeting: { active: false, ticksRemaining: 0, nextMeetingTick: nextMeetingTickFrom(0), lineIndex: 0 },
  };
}

function levelFor(status: Agent["status"]): LogItem["level"] {
  if (status === "Error") return "error";
  if (status === "Completed") return "success";
  if (status === "Debugging" || status === "Testing") return "warn";
  return "info";
}

function pushActivity(state: SimulationState, role: Agent["role"], agentName: string, status: Agent["status"], text: string) {
  const item: ActivityItem = { id: makeId("activity"), tick: state.tick, role, agentName, text, status };
  state.activityFeed = [item, ...state.activityFeed].slice(0, MAX_ACTIVITY_ITEMS);
}

function pushLog(state: SimulationState, role: Agent["role"], status: Agent["status"], text: string) {
  const item: LogItem = { id: makeId("log"), tick: state.tick, role, text, level: levelFor(status) };
  state.terminalLogs = [...state.terminalLogs, item].slice(-MAX_TERMINAL_ITEMS);
}

function bumpDepartmentProgress(progress: ProgressState, department: Agent["department"]) {
  if (!department) return;
  const gain = randomBetween(3, 8);
  progress[department] = Math.min(100, progress[department] + gain);
  const depts: Agent["department"][] = ["Frontend", "Backend", "Design", "QA", "Deploy"];
  const sum = depts.reduce((acc, d) => acc + (d ? progress[d] : 0), 0);
  progress.overall = Math.round(sum / depts.length);
}

function startMeeting(state: SimulationState) {
  state.meeting = { active: true, ticksRemaining: MEETING_DURATION_TICKS, nextMeetingTick: state.meeting.nextMeetingTick, lineIndex: 0 };
  const pm = state.agents.find((a) => a.role === "PM");
  for (const agent of state.agents) {
    agent.status = "Meeting";
    agent.statusSince = state.tick;
    agent.statusDurationTicks = MEETING_DURATION_TICKS;
  }
  pushActivity(state, "PM", pm?.name ?? "PM", "Meeting", `${pm?.name ?? "PM"} called an all-hands meeting`);
  pushLog(state, "PM", "Meeting", MEETING_LOG_LINES[0] ?? "회의 시작");
}

function advanceMeeting(state: SimulationState) {
  state.meeting.ticksRemaining -= 1;
  state.meeting.lineIndex = Math.min(state.meeting.lineIndex + 1, MEETING_LOG_LINES.length - 1);
  pushLog(state, "PM", "Meeting", MEETING_LOG_LINES[state.meeting.lineIndex] ?? "회의 진행 중");

  if (state.meeting.ticksRemaining <= 0) {
    for (const agent of state.agents) {
      agent.status = "Idle";
      agent.statusSince = state.tick;
      agent.statusDurationTicks = randomDuration("Idle");
    }
    state.meeting = {
      active: false,
      ticksRemaining: 0,
      nextMeetingTick: nextMeetingTickFrom(state.tick),
      lineIndex: 0,
    };
    pushLog(state, "PM", "Idle", "업무 재분배 완료 — 모두 자리로 복귀");
  }
}

function advanceAgent(state: SimulationState, agent: Agent) {
  if (state.tick - agent.statusSince < agent.statusDurationTicks) return;

  const nextStatus = pickNextStatus(agent.role, agent.status);
  agent.status = nextStatus;
  agent.statusSince = state.tick;
  agent.statusDurationTicks = randomDuration(nextStatus);

  if (nextStatus === "Working") {
    agent.currentTask = pickTask(agent.role);
  }

  const activityText = buildActivityText(agent.role, nextStatus, agent.name, agent.currentTask);
  pushActivity(state, agent.role, agent.name, nextStatus, activityText);
  pushLog(state, agent.role, nextStatus, buildTerminalText(agent.role, nextStatus, agent.currentTask));

  if (nextStatus === "Completed") {
    bumpDepartmentProgress(state.progress, agent.department);
    agent.lastCommit = `${generateCommitHash()} ${generateCommitMessage()}`;
    agent.etaMinutes = Math.round(randomBetween(5, 40));
  }
}

export function runTick(prev: SimulationState): SimulationState {
  const state: SimulationState = {
    ...prev,
    tick: prev.tick + 1,
    agents: prev.agents.map((a) => ({ ...a })),
    activityFeed: prev.activityFeed,
    terminalLogs: prev.terminalLogs,
    progress: { ...prev.progress },
    meeting: { ...prev.meeting },
  };

  if (state.meeting.active) {
    advanceMeeting(state);
  } else if (state.tick >= state.meeting.nextMeetingTick) {
    startMeeting(state);
  } else {
    for (const agent of state.agents) {
      advanceAgent(state, agent);
    }
  }

  for (const agent of state.agents) {
    const jitter = randomBetween(-6, 6);
    agent.cpu = Math.min(97, Math.max(4, Math.round(agent.cpu + jitter)));
  }

  return state;
}
