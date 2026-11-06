/**
 * Tiny in-browser store for the interactive prototype (demo only).
 * In production these actions map to Flask endpoints backed by SQLite.
 */
import { useSyncExternalStore } from "react";
import {
  INCIDENTS,
  IMAGES,
  RUNS,
  USERS,
  type AnalysisRun,
  type Incident,
  type Role,
  type SatImage,
  type User,
} from "./demo-data";

export interface DemoState {
  role: Role;
  userName: string;
  incidents: Incident[];
  images: SatImage[];
  runs: AnalysisRun[];
  users: User[];
}

const initial: DemoState = {
  role: "analyst",
  userName: "نورة العتيبي",
  incidents: INCIDENTS,
  images: IMAGES,
  runs: RUNS,
  users: USERS,
};

let state: DemoState = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function set(patch: Partial<DemoState>) {
  state = { ...state, ...patch };
  if (patch.role || patch.userName) {
    try {
      window.localStorage.setItem(
        "mirsad-demo-session",
        JSON.stringify({ role: state.role, userName: state.userName }),
      );
    } catch {
      /* ignore */
    }
  }
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (!hydrated) {
    hydrated = true;
    try {
      const raw = window.localStorage.getItem("mirsad-demo-session");
      if (raw) {
        const s = JSON.parse(raw) as { role: Role; userName: string };
        state = { ...state, role: s.role, userName: s.userName };
        queueMicrotask(emit);
      }
    } catch {
      /* ignore */
    }
  }
  return () => listeners.delete(l);
}

export function useDemo(): DemoState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}

export const demoActions = {
  login(role: Role, userName: string) {
    set({ role, userName });
  },
  addIncident(incident: Incident) {
    set({ incidents: [incident, ...state.incidents] });
  },
  updateIncident(id: string, patch: Partial<Incident>) {
    set({ incidents: state.incidents.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  },
  addImage(image: SatImage) {
    set({ images: [image, ...state.images] });
  },
  addRun(run: AnalysisRun) {
    set({ runs: [run, ...state.runs] });
  },
  reviewRun(id: string, status: "reviewed" | "correction", notes: string, reviewer: string) {
    const now = new Date();
    const stamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    set({
      runs: state.runs.map((r) =>
        r.id === id ? { ...r, status, reviewNotes: notes, reviewer, reviewedAt: stamp } : r,
      ),
    });
  },
  addUser(user: User) {
    set({ users: [...state.users, user] });
  },
  updateUser(id: string, patch: Partial<User>) {
    set({ users: state.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) });
  },
};

/** Latest run with status "reviewed" for an incident — the only result Field Responders see. */
export function latestReviewedRun(runs: AnalysisRun[], incidentId: string) {
  return runs
    .filter((r) => r.incidentId === incidentId && r.status === "reviewed")
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
}
