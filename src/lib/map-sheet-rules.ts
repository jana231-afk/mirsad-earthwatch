import type { AnalysisRun, DayResult, Incident, Role } from "./demo-data";
import { canExportAnalysis } from "./demo-rules";

export interface ExportResult { key: string; day: DayResult; run: AnalysisRun }

export function exportResults(role: Role, incident: Incident, runs: AnalysisRun[]): ExportResult[] {
  const byDate = new Map<string, ExportResult>();
  for (const run of runs.filter((r) => canExportAnalysis(role, incident, r)).sort((a, b) => a.startedAt.localeCompare(b.startedAt))) {
    for (const day of run.days) byDate.set(day.date, { key: `${run.id}:${day.imageId}`, day, run });
  }
  return [...byDate.values()].sort((a, b) => a.day.date.localeCompare(b.day.date));
}

export function validComparison(results: ExportResult[]) {
  return results.length >= 2 && results.length <= 3 && new Set(results.map((r) => r.day.date)).size === results.length;
}

export function exportMime(format: "png" | "jpg") {
  return format === "jpg" ? "image/jpeg" : "image/png";
}