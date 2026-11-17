import { describe, expect, it } from "vitest";
import { INCIDENTS, IMAGES, REPORTS, RUNS, incidentStatus, formatRange } from "@/lib/demo-data";
import { canAnalyzeImages, canViewReport } from "@/lib/demo-rules";

const incident = INCIDENTS.find((item) => item.id === "INC-2026-018");
const report = REPORTS.find((item) => item.id === "RPT-0021");
if (!incident || !report) throw new Error("Required fixtures missing");

describe("automatic incident status", () => {
  it("stays active on the end date", () => {
    expect(incidentStatus(incident, [], "2026-11-10")).toBe("active");
  });
  it("closes a single-day incident after that day", () => {
    expect(incidentStatus({ ...incident, startDate: "2026-09-14", endDate: "2026-09-14" }, [], "2026-09-15")).toBe("closed");
  });
  it("reopens when a later image is added today", () => {
    const image = IMAGES.find((item) => item.id === "IMG-103");
    if (!image) throw new Error("Missing image");
    expect(incidentStatus(incident, [{ ...image, acquisitionDate: "2026-11-13", uploadedAt: "2026-11-13" }], "2026-11-13")).toBe("active");
  });
  it("keeps identical start and end dates for a one-day range", () => {
    expect(formatRange("2026-09-14", "2026-09-14")).toBe("14 – 14 سبتمبر 2026");
  });
});

describe("read-only report access", () => {
  it("allows a responder to see a shared reviewed report", () => {
    expect(canViewReport("responder", report, INCIDENTS, RUNS)).toBe(true);
  });
  it("denies unshared incidents", () => {
    expect(canViewReport("responder", report, INCIDENTS.map((item) => ({ ...item, sharedWithResponders: false })), RUNS)).toBe(false);
  });
  it("denies reports after their analysis needs correction", () => {
    expect(canViewReport("responder", report, INCIDENTS, RUNS.map((run) => ({ ...run, status: "correction" })))).toBe(false);
  });
  it("does not give administrators analysis report access", () => {
    expect(canViewReport("admin", report, INCIDENTS, RUNS)).toBe(false);
  });
});

describe("analysis image selection", () => {
  const images = IMAGES.filter((image) => image.incidentId === "INC-2026-016");
  it("requires both pre-event and post-event images for burned areas", () => {
    expect(canAnalyzeImages("fire", images, "IMG-095", "")).toBe(false);
    expect(canAnalyzeImages("fire", images, "IMG-095", "IMG-096")).toBe(true);
  });
  it("rejects a post-event image dated before the reference", () => {
    expect(canAnalyzeImages("fire", images.map((image) => image.id === "IMG-096" ? { ...image, acquisitionDate: "2026-09-01" } : image), "IMG-095", "IMG-096")).toBe(false);
  });
  it("requires at least one supported flood image", () => {
    expect(canAnalyzeImages("flood", [])).toBe(false);
    expect(canAnalyzeImages("flood", IMAGES.slice(0, 1))).toBe(true);
    expect(canAnalyzeImages("flood", IMAGES.slice(0, 1).map((image) => ({ ...image, status: "unsupported" })))).toBe(false);
  });
});
import { imageRequestPeriodError } from "@/lib/demo-rules";
describe("image request period", () => {
  it("rejects a start date after the end date", () => {
    expect(imageRequestPeriodError("2026-11-10", "2026-11-05", "2026-11-17")).not.toBeNull();
  });
  it("rejects future end dates", () => {
    expect(imageRequestPeriodError("2026-11-10", "2026-11-20", "2026-11-17")).not.toBeNull();
  });
  it("accepts a valid past period", () => {
    expect(imageRequestPeriodError("2026-11-01", "2026-11-17", "2026-11-17")).toBeNull();
  });
});
