import type { AnalysisRun, GeoImage, Incident, Report, Role } from "./demo-data";

/** Presentation access rules for the backend-free prototype, not server authorization. */
export function canViewReport(role: Role, report: Report, incidents: Incident[], runs: AnalysisRun[]) {
  const incident = incidents.find((item) => item.id === report.incidentId);
  const run = runs.find((item) => item.id === report.runId && item.incidentId === report.incidentId);
  if (!incident || !run || run.status !== "reviewed") return false;
  return role === "analyst" || (role === "responder" && incident.sharedWithResponders);
}

export function canAnalyzeImages(type: Incident["type"], images: GeoImage[], preId = "", postId = "") {
  if (!images.length || images.some((image) => image.status === "unsupported")) return false;
  if (type === "flood") return true;
  const pre = images.find((image) => image.id === preId);
  const post = images.find((image) => image.id === postId);
  if (!pre || !post || pre.id === post.id || pre.imageRole !== "pre" || post.imageRole !== "post") return false;
  return pre.acquisitionDate < post.acquisitionDate && images.every((image) =>
    image.id === pre.id || image.id === post.id || (image.imageRole === "later" && image.acquisitionDate >= post.acquisitionDate),
  );
}
/** Returns an Arabic error for an imagery request period, or null when valid. */
export function imageRequestPeriodError(fromDate: string, toDate: string, today: string) {
  if (!fromDate || !toDate) return "حدد تاريخ بداية الفترة ونهايتها.";
  if (fromDate > toDate) return "تاريخ بداية الفترة يجب أن يسبق تاريخ نهايتها أو يساويه.";
  if (toDate > today) return "لا يمكن طلب صور لتاريخ مستقبلي.";
  return null;
}
