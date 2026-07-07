export type AgentRole =
  | "CEO"
  | "PM"
  | "Research"
  | "Design"
  | "Frontend"
  | "Backend"
  | "AI"
  | "QA"
  | "DevOps"
  | "Documentation";

export type AgentStatus =
  | "Idle"
  | "Thinking"
  | "Working"
  | "Review"
  | "Meeting"
  | "Debugging"
  | "Testing"
  | "Deploying"
  | "Completed"
  | "Error";

export type Department = "Frontend" | "Backend" | "Design" | "QA" | "Deploy";

export interface GridPosition {
  x: number;
  y: number;
}

export interface AgentDefinition {
  id: string;
  role: AgentRole;
  name: string;
  desk: GridPosition;
  color: string;
  accent: string;
  department?: Department;
}

export interface AgentRuntimeState {
  id: string;
  status: AgentStatus;
  currentTask: string;
  progress: number;
  cpu: number;
  lastCommit: string;
  etaMinutes: number;
  statusSince: number;
  statusDurationTicks: number;
}

export interface Agent extends AgentDefinition, AgentRuntimeState {}

export interface ActivityItem {
  id: string;
  tick: number;
  role: AgentRole;
  agentName: string;
  text: string;
  status: AgentStatus;
}

export interface LogItem {
  id: string;
  tick: number;
  role: AgentRole;
  text: string;
  level: "info" | "warn" | "error" | "success";
}

export interface ProgressState {
  overall: number;
  Frontend: number;
  Backend: number;
  Design: number;
  QA: number;
  Deploy: number;
}
