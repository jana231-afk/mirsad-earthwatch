import { InfoRow } from "./bits";
import { formatDate, formatKm2, formatPct, type AnalysisRun, type DayResult, type GeoImage } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

/** Area statistics for one analysed image (one day). */
export function AreaStats({ day, kind, className }: { day: DayResult; kind: "flood" | "fire"; className?: string | undefined }) {
  const items = [
    { label: kind === "flood" ? "المساحة المتأثرة (مياه)" : "المساحة المتأثرة (محروقة)", value: formatKm2(day.affectedKm2), unit: "km²", strong: true },
    { label: "النسبة المئوية", value: formatPct(day.affectedPct), unit: "", strong: true },
    { label: "المساحة المحللة الصالحة", value: formatKm2(day.validKm2), unit: "km²" },
    { label: "مساحة بدون بيانات (مستبعدة)", value: formatKm2(day.nodataKm2), unit: "km²" },
  ];
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {items.map((i) => (
        <div
          key={i.label}
          className={cn(
            "rounded-md border p-3",
            i.strong ? (kind === "flood" ? "border-water/20 bg-water-soft" : "border-burn/20 bg-burn-soft") : "bg-muted/40",
          )}
        >
          <div className="text-xs text-muted-foreground">{i.label}</div>
          <div className="mt-1 flex items-baseline justify-end gap-1">
            <span className="ltr font-mono text-xl font-semibold">{i.value}</span>
            {i.unit && <span className="ltr text-xs text-muted-foreground">{i.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Analysis information list (model, version, dates). */
export function RunInfo({ run, images, day }: { run: AnalysisRun; images: GeoImage[]; day?: DayResult | undefined }) {
  const img = day ? images.find((m) => m.id === day.imageId) : undefined;
  return (
    <dl>
      <InfoRow label="رقم التحليل" value={run.id} mono />
      <InfoRow label="اسم النموذج" value={run.model} />
      <InfoRow label="إصدار النموذج" value={run.modelVersion} mono />
      <InfoRow label="تاريخ التحليل" value={run.startedAt} mono />
      <InfoRow label="مدة المعالجة" value={`${run.durationSec} ثانية`} />
      {day && (
        <InfoRow
          label="تاريخ الصورة"
          value={`${formatDate(day.date)}${img?.acquisitionDateSource === "manual" ? " (مُدخل يدوياً)" : ""}`}
        />
      )}
      {img && <InfoRow label="نوع الصورة" value={img.sensor} />}
      <InfoRow label="عدد الصور المحللة" value={`${run.days.length}`} />
      <InfoRow label="شغّله" value={run.runBy} />
    </dl>
  );
}

export const AREA_DISCLAIMER =
  "تمثل المساحة المتأثرة مجموع البكسلات التي صنّفها النموذج كمياه أو منطقة محروقة ضمن الجزء الصالح من الصورة، ولا تعني تحديد الأضرار الفعلية على أرض الواقع.";
