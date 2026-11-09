/**
 * Tiny in-browser store for the interactive prototype (demo only).
 * In production these actions map to Flask endpoints backed by SQLite.
 */
import { useSyncExternalStore } from "react";
import {
  INCIDENTS,
  IMAGES,
  REPORTS,
  RUNS,
  USERS,
  type AnalysisRun,
  type GeoImage,
  type Incident,
  type Report,
  type Role,
  type User,
} from "./demo-data";

export interface DemoState {
  role: Role;
  userName: string;
  incidents: Incident[];
  images: GeoImage[];
  runs: AnalysisRun[];
  reports: Report[];
  users: User[];
}

const initial: DemoState = {
  role: "analyst",
  userName: "نورة العتيبي",
  incidents: INCIDENTS,
  images: IMAGES,
  runs: RUNS,
  reports: REPORTS,
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
        if (s.role === "admin" || s.role === "analyst" || s.role === "responder") {
          state = { ...state, role: s.role, userName: s.userName };
          queueMicrotask(emit);
        }
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

export function nowStamp() {
  const now = new Date();
  const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return `${d} ${now.toTimeString().slice(0, 5)}`;
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
  addImages(images: GeoImage[]) {
    set({ images: [...images, ...state.images] });
  },
  addRun(run: AnalysisRun) {
    set({ runs: [run, ...state.runs] });
  },
  reviewRun(id: string, status: "reviewed" | "correction", notes: string, reviewer: string) {
    set({
      runs: state.runs.map((r) =>
        r.id === id ? { ...r, status, reviewNotes: notes, reviewer, reviewedAt: nowStamp() } : r,
      ),
    });
  },
  addReport(report: Report) {
    set({ reports: [report, ...state.reports] });
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

/** Images of an incident sorted by acquisition date (oldest first). */
export function incidentImages(images: GeoImage[], incidentId: string) {
  return images
    .filter((m) => m.incidentId === incidentId)
    .sort((a, b) => a.acquisitionDate.localeCompare(b.acquisitionDate));
}

export function nextId(prefix: string, existing: { id: string }[]) {
  const max = existing.reduce((m, x) => {
    const n = Number(x.id.split("-").pop());
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}
