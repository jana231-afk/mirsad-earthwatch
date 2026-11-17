/** DEMO ONLY — fictional sample areas for the public home-page map ("بيانات تجريبية"). */
export type HeroAreaId = "fire" | "flood";

export const HERO_CENTER: [number, number] = [18.25, 42.45];
/** Analysed area inside the boundary, used for the sample percentages. */
export const HERO_BOUNDARY_KM2 = 182;

export const HERO_AREAS: { id: HeroAreaId; type: "fire" | "flood"; name: string; place: string; center: [number, number]; radius: number; seed: number }[] = [
  { id: "fire", type: "fire", name: "حريق غابات (تجريبي)", place: "منطقة عسير — المرتفعات الشمالية", center: [18.3, 42.51], radius: 0.05, seed: 0.7 },
  { id: "flood", type: "flood", name: "فيضان وادٍ (تجريبي)", place: "منطقة عسير — مجرى الوادي الجنوبي", center: [18.2, 42.38], radius: 0.055, seed: 2.4 },
];

/** Sample periods: shape scale and area per period. Fire spreads, flood recedes. */
export const HERO_PERIODS: { label: string; scale: Record<HeroAreaId, number>; km2: Record<HeroAreaId, number> }[] = [
  { label: "12 نوفمبر", scale: { fire: 0.6, flood: 1 }, km2: { fire: 8.4, flood: 26.3 } },
  { label: "14 نوفمبر", scale: { fire: 0.82, flood: 0.82 }, km2: { fire: 14.9, flood: 19.1 } },
  { label: "16 نوفمبر", scale: { fire: 1, flood: 0.62 }, km2: { fire: 19.7, flood: 12.4 } },
];

/** Irregular closed shape around a centre (degrees). */
export function blob(center: [number, number], r: number, seed: number, n = 48): [number, number][] {
  const [lat, lng] = center;
  const k = Math.cos((lat * Math.PI) / 180);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + 0.2 * Math.sin(3 * a + seed) + 0.1 * Math.sin(5 * a + 2 * seed) + 0.05 * Math.sin(9 * a + seed));
    return [lat + rr * Math.sin(a) * 0.8, lng + (rr * Math.cos(a)) / k] as [number, number];
  });
}
