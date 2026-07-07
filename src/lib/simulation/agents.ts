import type { AgentDefinition } from "@/types/agent";

/**
 * Desks are laid out in a ring around the origin; (0,0) is reserved for the
 * central meeting room so every agent has a similar walking distance to it.
 */
export const AGENT_ROSTER: AgentDefinition[] = [
  { id: "ceo", role: "CEO", name: "Ava", desk: { x: -1, y: -3 }, color: "#7c3aed", accent: "#ede9fe" },
  { id: "pm", role: "PM", name: "Noah", desk: { x: 1, y: -3 }, color: "#2563eb", accent: "#dbeafe" },
  { id: "research", role: "Research", name: "Mia", desk: { x: -3, y: -1 }, color: "#0d9488", accent: "#ccfbf1" },
  { id: "design", role: "Design", name: "Yuna", desk: { x: 3, y: -1 }, color: "#db2777", accent: "#fce7f3", department: "Design" },
  { id: "frontend", role: "Frontend", name: "Leo", desk: { x: -3, y: 1 }, color: "#0284c7", accent: "#e0f2fe", department: "Frontend" },
  { id: "backend", role: "Backend", name: "Kai", desk: { x: 3, y: 1 }, color: "#059669", accent: "#d1fae5", department: "Backend" },
  { id: "ai", role: "AI", name: "Zoe", desk: { x: -1, y: 3 }, color: "#4f46e5", accent: "#e0e7ff" },
  { id: "qa", role: "QA", name: "Eli", desk: { x: 1, y: 3 }, color: "#d97706", accent: "#fef3c7", department: "QA" },
  { id: "devops", role: "DevOps", name: "Ryu", desk: { x: -3, y: 3 }, color: "#ea580c", accent: "#ffedd5", department: "Deploy" },
  { id: "docs", role: "Documentation", name: "Nina", desk: { x: 3, y: 3 }, color: "#475569", accent: "#e2e8f0" },
];

export const MEETING_ROOM_CENTER = { x: 0, y: 0 };

export function meetingSeatFor(index: number, total: number): { x: number; y: number } {
  const radius = 1.15;
  const angle = (index / total) * Math.PI * 2;
  return {
    x: MEETING_ROOM_CENTER.x + Math.cos(angle) * radius,
    y: MEETING_ROOM_CENTER.y + Math.sin(angle) * radius,
  };
}
