import { InfoRow } from "./bits";
import { formatKm2, type AnalysisRun, type SatImage } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function AreaStats({ run, kind, className }: { run: AnalysisRun; kind: "flood" | "fire"; className?: string }) {
  const items = [
    { label: kind === "flood" ? "مساحة المياه المكتشفة" : "المساحة المحترقة المكتشفة", en: "Affected area", value: formatKm2(run.affectedKm2), unit: "km²", strong: true },
    { label: "نسبة المساحة المتأثرة", en: "Affected percentage", value: run.affectedPct.toFixed(2), unit: "%", strong: true },
    { label: "المساحة الصالحة المحللة", en: "Valid analyzed area", value: formatKm2(run.validKm2), unit: "km²" },
    { label: "مساحة NoData المستبعدة", en: "NoData excluded", value: formatKm2(run.nodataKm2), unit: "km²" },
  ];
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {items.map((i) => (
        <div key={i.en} className={cn("rounded-md border p-3", i.strong ? (kind === "flood" ? "bg-water-soft border-water/20" : "bg-burn-soft border-burn/20") : "bg-muted/40")}>
          <div className="text-xs text-muted-foreground">{i.label}</div>
          <div className="ltr text-[10px] text-start text-muted-foreground/80">{i.en}</div>
          <div className="ltr mt-1 text-end font-mono text-xl font-semibold">
            {i.value} <span className="text-xs font-normal text-muted-foreground">{i.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RunInfo({ run, images }: { run: AnalysisRun; images: SatImage[] }) {
  const post = images.find((m) => m.imageRole !== "pre-event") ?? images[0];
  return (
    <dl>
      <InfoRow label="رقم التحليل" value={run.id} mono />
      <InfoRow label="اسم النموذج" value={run.model} mono />
      <InfoRow label="إصدار النموذج" value={run.modelVersion} mono />
      <InfoRow label="تاريخ التحليل" value={run.startedAt} mono />
      <InfoRow label="مدة المعالجة" value={`${run.durationSec} s`} mono />
      {post && <InfoRow label="تاريخ التقاط الصورة" value={`${post.acquisitionDate}${post.acquisitionDateSource === "manual" ? " (يدوي)" : ""}`} mono />}
      {post && <InfoRow label="المستشعر" value={post.sensor} mono />}
      <InfoRow label="الصور المستخدمة" value={run.imageIds.join(" + ")} mono />
      <InfoRow label="شغّله" value={run.runBy} />
    </dl>
  );
}

export const AREA_DISCLAIMER =
  "تمثل المساحة المتأثرة مجموع البكسلات التي صنّفها النموذج كمياه أو منطقة محترقة ضمن المنطقة الصالحة من الصورة، ولا تعني تحديد الأضرار الفعلية على أرض الواقع.";
