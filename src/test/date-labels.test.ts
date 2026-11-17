import { describe, expect, it } from "vitest";
import { INCIDENTS, imageLabel, imagesPeriod, incidentDateText, incidentStatus, joinLocation, weekdayName } from "@/lib/demo-data";

describe("incident dates and location", () => {
  it("an ongoing incident (no end date) stays active", () => {
    const inc = { ...INCIDENTS[0]!, endDate: undefined };
    expect(incidentStatus(inc, [], "2030-01-01")).toBe("active");
  });
  it("adding a past end date closes the incident", () => {
    const inc = { ...INCIDENTS[0]!, id: "X", startDate: "2026-11-12", endDate: "2026-11-14" };
    expect(incidentStatus(inc, [], "2026-11-17")).toBe("closed");
  });
  it("demo data has at least 3 active and some closed incidents", () => {
    const s = INCIDENTS.map((i) => incidentStatus(i, [], "2026-11-17"));
    expect(s.filter((x) => x === "active").length).toBeGreaterThanOrEqual(3);
    expect(s.filter((x) => x === "closed").length).toBeGreaterThan(0);
  });
  it("incident date row text", () => {
    expect(incidentDateText({ startDate: "2026-11-10" })).toBe("10 نوفمبر 2026 — مستمرة");
    expect(incidentDateText({ startDate: "2026-11-06", endDate: "2026-11-13" })).toBe("من 6 نوفمبر 2026 إلى 13 نوفمبر 2026");
  });
  it("weekday of 12 Nov 2026 is Thursday", () => {
    expect(weekdayName("2026-11-12")).toBe("الخميس");
  });
  it("location joins region, city and district", () => {
    expect(joinLocation("منطقة مكة المكرمة", "جدة", "حي الروضة")).toBe("منطقة مكة المكرمة — جدة — حي الروضة");
  });
});

describe("image labels", () => {
  it("numbers images only when there are more than two", () => {
    expect(imageLabel(0, 3, "2026-11-06")).toBe("الصورة 1 — 6 نوفمبر 2026");
    expect(imageLabel(1, 2, "2026-11-10")).toBe("10 نوفمبر 2026");
    expect(imageLabel(0, 1, "2026-11-10")).toBe("10 نوفمبر 2026");
  });
  it("report period uses first and last image dates (same date twice for one day)", () => {
    expect(imagesPeriod(["2026-11-13", "2026-11-06", "2026-11-10"])).toBe("من 6 نوفمبر 2026 إلى 13 نوفمبر 2026");
    expect(imagesPeriod(["2026-11-06"])).toBe("من 6 نوفمبر 2026 إلى 6 نوفمبر 2026");
  });
});
