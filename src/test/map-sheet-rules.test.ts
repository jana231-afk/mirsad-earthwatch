import { describe, expect, it } from "vitest";
import { INCIDENTS, RUNS } from "@/lib/demo-data";
import { canExportAnalysis } from "@/lib/demo-rules";
import { exportMime, exportResults, validComparison } from "@/lib/map-sheet-rules";

const incident = INCIDENTS.find((i) => i.id === "INC-2026-018");
const run = RUNS.find((r) => r.id === "RUN-0047");
if (!incident || !run) throw new Error("Missing export fixtures");

describe("approved map image export", () => {
  it("allows GIS analysts to export approved results", () => {
    expect(canExportAnalysis("analyst", incident, run)).toBe(true);
  });
  it("allows responders to export shared approved results", () => {
    expect(canExportAnalysis("responder", incident, run)).toBe(true);
    expect(canExportAnalysis("responder", { ...incident, sharedWithResponders: false }, run)).toBe(false);
  });
  it("excludes every unapproved status", () => {
    for (const status of ["pending", "correction", "processing", "failed"] as const) {
      expect(canExportAnalysis("analyst", incident, { ...run, status })).toBe(false);
      expect(canExportAnalysis("responder", incident, { ...run, status })).toBe(false);
    }
  });
  it("does not grant administrators export access", () => {
    expect(canExportAnalysis("admin", incident, run)).toBe(false);
  });
  it("uses approved image dates in order, excluding superseded correction results", () => {
    const results = exportResults("analyst", incident, RUNS);
    expect(results.map((r) => r.day.date)).toEqual(["2026-11-06", "2026-11-07", "2026-11-08"]);
    expect(results.map((r) => r.run.id)).toEqual(["RUN-0047", "RUN-0047", "RUN-0047"]);
  });
  it("permits only two or three distinct comparison dates", () => {
    const results = exportResults("analyst", incident, RUNS);
    expect(validComparison(results.slice(0, 1))).toBe(false);
    expect(validComparison(results.slice(0, 2))).toBe(true);
    expect(validComparison(results)).toBe(true);
    expect(validComparison([...results, ...results])).toBe(false);
    expect(validComparison([...results.slice(0, 1), ...results.slice(0, 1)])).toBe(false);
  });
  it("outputs PNG and JPG with the corresponding image MIME types", () => {
    expect(exportMime("png")).toBe("image/png");
    expect(exportMime("jpg")).toBe("image/jpeg");
  });
});