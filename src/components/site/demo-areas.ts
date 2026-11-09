import { INCIDENTS, RUNS, TYPE_LABELS, formatPct, formatRange, latestDay, type IncidentType } from "@/lib/demo-data";

const SPOTS: Record<string, [number, number]> = {
  "INC-2026-018": [21.62, 39.7],
  "INC-2026-016": [18.27, 42.37],
  "INC-2026-015": [17.15, 42.63],
  "INC-2026-010": [21.5, 39.3],
  "INC-2026-012": [20.02, 41.45],
};

const BLOB: [number, number][] = [
  [0.09, -0.05], [0.12, 0.06], [0.04, 0.14], [-0.06, 0.12], [-0.11, 0.02], [-0.07, -0.1], [0.02, -0.13],
];

export interface DemoArea {
  id: string;
  name: string;
  type: IncidentType;
  typeLabel: string;
  range: string;
  pct: string;
  lat: number;
  lng: number;
  shape: [number, number][];
}

export const DEMO_AREAS: DemoArea[] = INCIDENTS.filter((i) => SPOTS[i.id]).map((i, k) => {
  const run = RUNS.find((r) => r.incidentId === i.id && r.status === "reviewed") ?? RUNS.find((r) => r.incidentId === i.id);
  const [lat, lng] = SPOTS[i.id]!;
  const s = 0.8 + (k % 3) * 0.25;
  return {
    id: i.id,
    name: i.name,
    type: i.type,
    typeLabel: TYPE_LABELS[i.type],
    range: formatRange(i.startDate, i.endDate),
    pct: run ? formatPct(latestDay(run).affectedPct) : "—",
    lat,
    lng,
    shape: BLOB.map(([a, b]) => [a * s, b * s] as [number, number]),
  };
});
