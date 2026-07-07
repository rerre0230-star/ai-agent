import type { AgentRole, AgentStatus } from "@/types/agent";

export const TASKS_BY_ROLE: Record<AgentRole, string[]> = {
  CEO: ["quarterly goals", "the product roadmap", "OKR priorities", "the launch plan"],
  PM: ["sprint planning", "requirement breakdown", "the project timeline", "task assignments"],
  Research: ["competitor APIs", "auth provider options", "market analysis", "API rate limits"],
  Design: ["the dashboard wireframe", "the design system", "icon set", "color palette"],
  Frontend: ["the Dashboard component", "React Query hooks", "the office canvas UI", "responsive layout"],
  Backend: ["the /api/users endpoint", "the database schema", "the auth middleware", "Redis caching"],
  AI: ["the prompt template", "the RAG pipeline", "embedding evaluation", "the agent memory system"],
  QA: ["the regression suite", "E2E test coverage", "bug triage", "the QA checklist"],
  DevOps: ["the Docker image", "the CI pipeline", "the staging server", "the deploy config"],
  Documentation: ["the API docs", "the changelog", "architecture docs", "the README"],
};

const ACTIVITY_TEMPLATES: Partial<Record<AgentRole, Partial<Record<AgentStatus, string[]>>>> = {
  PM: {
    Thinking: ["{name} is analyzing requirements"],
    Working: ["{name} assigned a new task", "{name} is updating {task}"],
    Completed: ["{name} confirmed sprint progress"],
    Meeting: ["{name} called an all-hands meeting"],
  },
  Backend: {
    Working: ["{name} is building {task}"],
    Review: ["{name} requested a code review for {task}"],
    Completed: ["{name} completed the API for {task}"],
    Debugging: ["{name} is fixing a bug in {task}"],
  },
  Frontend: {
    Working: ["{name} is creating {task}"],
    Review: ["{name} requested design feedback"],
    Completed: ["{name} shipped {task}"],
    Debugging: ["{name} is fixing a rendering bug"],
  },
  Design: {
    Working: ["{name} is designing {task}"],
    Completed: ["{name} updated the Figma file"],
    Review: ["{name} shared mockups for review"],
  },
  QA: {
    Testing: ["{name} is running tests on {task}"],
    Debugging: ["{name} found a bug in {task}"],
    Completed: ["{name} verified {task}"],
  },
  DevOps: {
    Working: ["{name} is preparing {task}"],
    Deploying: ["{name} started a deploy"],
    Completed: ["{name} finished the deploy"],
    Error: ["{name} hit a deploy failure"],
  },
  Documentation: {
    Working: ["{name} is documenting {task}"],
    Completed: ["{name} updated the docs"],
  },
  Research: {
    Working: ["{name} is researching {task}"],
    Completed: ["{name} shared research findings"],
  },
  AI: {
    Working: ["{name} is tuning {task}"],
    Testing: ["{name} is evaluating model output"],
    Completed: ["{name} shipped an AI improvement"],
  },
  CEO: {
    Thinking: ["{name} is reviewing {task}"],
    Review: ["{name} is approving the latest release"],
    Completed: ["{name} approved the roadmap"],
  },
};

const TERMINAL_TEMPLATES: Partial<Record<AgentRole, Partial<Record<AgentStatus, string[]>>>> = {
  PM: { Working: ["Task Assigned", "Updating sprint board..."], Meeting: ["Calling all-hands meeting..."] },
  Backend: { Working: ["Generating API...", "Writing migration..."], Testing: ["Running unit tests..."] },
  Frontend: { Working: ["Creating Component...", "Compiling styles..."] },
  Design: { Working: ["Exporting Design...", "Updating Figma..."] },
  QA: { Testing: ["Running test suite..."], Debugging: ["Found 3 Bugs"] },
  DevOps: { Working: ["Docker Build...", "Provisioning server..."], Deploying: ["Deploying to staging..."] },
  Documentation: { Working: ["Updating changelog...", "Writing docs..."] },
  Research: { Working: ["Fetching API docs...", "Analyzing competitors..."] },
  AI: { Working: ["Tuning prompt...", "Running eval suite..."] },
  CEO: { Thinking: ["Reviewing roadmap..."] },
};

const GENERIC_ACTIVITY: Record<AgentStatus, string[]> = {
  Idle: ["{name} is back at their desk"],
  Thinking: ["{name} is thinking about {task}"],
  Working: ["{name} is working on {task}"],
  Review: ["{name} is reviewing {task}"],
  Meeting: ["{name} joined the meeting"],
  Debugging: ["{name} is debugging an issue"],
  Testing: ["{name} is testing {task}"],
  Deploying: ["{name} is deploying changes"],
  Completed: ["{name} completed {task}"],
  Error: ["{name} ran into an error"],
};

const GENERIC_TERMINAL: Record<AgentStatus, string[]> = {
  Idle: ["Idle"],
  Thinking: ["Thinking..."],
  Working: ["Working..."],
  Review: ["Reviewing..."],
  Meeting: ["In meeting..."],
  Debugging: ["Debugging..."],
  Testing: ["Testing..."],
  Deploying: ["Deploying..."],
  Completed: ["Done"],
  Error: ["Error encountered"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function fillTemplate(template: string, name: string, task: string): string {
  return template.replace("{name}", name).replace("{task}", task);
}

export function buildActivityText(role: AgentRole, status: AgentStatus, name: string, task: string): string {
  const templates = ACTIVITY_TEMPLATES[role]?.[status] ?? GENERIC_ACTIVITY[status];
  return fillTemplate(pick(templates), name, task);
}

export function buildTerminalText(role: AgentRole, status: AgentStatus, task: string): string {
  const templates = TERMINAL_TEMPLATES[role]?.[status] ?? GENERIC_TERMINAL[status];
  return fillTemplate(pick(templates), "", task);
}

export function pickTask(role: AgentRole): string {
  return pick(TASKS_BY_ROLE[role]);
}

const COMMIT_VERBS = ["fix", "feat", "chore", "refactor", "docs", "test"];
const COMMIT_SUBJECTS = [
  "update dashboard layout",
  "add API validation",
  "resolve auth edge case",
  "improve query performance",
  "clean up unused styles",
  "add missing test coverage",
  "update deployment config",
  "sync docs with latest API",
];

export function generateCommitMessage(): string {
  return `${pick(COMMIT_VERBS)}: ${pick(COMMIT_SUBJECTS)}`;
}

export function generateCommitHash(): string {
  return Math.random().toString(16).slice(2, 9);
}

export const MEETING_LOG_LINES = [
  "회의 시작 — 전체 Agent 소집",
  "진행 상황 공유 중...",
  "이슈 및 블로커 논의 중...",
  "회의록 생성 완료",
  "업무 재분배 완료",
];
