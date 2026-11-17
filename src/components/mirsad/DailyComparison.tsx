import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { dayChanges, imageLabel, formatDate, formatKm2, formatPct, type DayResult } from "@/lib/demo-data";
import { th, td } from "./bits";

/** Change chip vs the previous image: "↓ 9.6 نقطة" (percentage points, computed from the values). */
export function ChangeChip({ value, className }: { value: number | undefined; className?: string }) {
  if (value === undefined) return <span className="text-muted-foreground">—</span>;
  const up = value > 0.05;
  const down = value < -0.05;
  const Icon = up ? ArrowUp : down ? ArrowDown : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium",
        up ? "bg-destructive-soft text-destructive" : down ? "bg-success-soft text-success" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      <span>
        <span className="ltr font-mono">{Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 1 })}</span> نقطة
      </span>
    </span>
  );
}

/** "6 نوفمبر 37% ← 7 نوفمبر 27.5% ← …" summary line (labels from real image dates). */
export function ComparisonSequence({ days }: { days: DayResult[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {days.map((d, i) => (
        <span key={d.imageId} className="inline-flex items-center gap-2">
          {i > 0 && <span className="text-muted-foreground">←</span>}
          <span>
            {imageLabel(i, days.length, d.date)} <span className="ltr font-mono font-semibold">{formatPct(d.affectedPct)}</span>
          </span>
        </span>
      ))}
    </div>
  );
}

/** One-sentence summary of the increase/decrease between first and last day. */
export function comparisonSummary(days: DayResult[], kind: "flood" | "fire") {
  if (days.length < 2) return "تحتوي هذه النتيجة على صورة واحدة فقط، ولا تتوفر مقارنة بين الصور.";
  const first = days[0]!;
  const last = days[days.length - 1]!;
  const diff = last.affectedPct - first.affectedPct;
  const diffKm = last.affectedKm2 - first.affectedKm2;
  const what = kind === "flood" ? "المساحة المغمورة بالمياه" : "المساحة المحروقة";
  if (Math.abs(diff) < 0.05) return `بقيت ${what} شبه ثابتة بين ${formatDate(first.date)} و${formatDate(last.date)}.`;
  const dir = diff < 0 ? "انخفضت" : "ارتفعت";
  return `${dir} نسبة ${what} من ${formatPct(first.affectedPct)} في ${formatDate(first.date)} إلى ${formatPct(last.affectedPct)} في ${formatDate(last.date)}، أي بفارق ${formatPct(Math.abs(diff))} (${formatKm2(Math.abs(diffKm))} km²) خلال ${days.length} صور.`;
}

export function ComparisonTable({ days, compact }: { days: DayResult[]; compact?: boolean }) {
  const rows = dayChanges(days);
  // Columns: image, area, %, change vs previous image
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className={th}>{days.length > 2 ? "الصورة وتاريخ الالتقاط" : "تاريخ الصورة"}</th>
            <th className={th}>المساحة المتأثرة</th>
            <th className={th}>النسبة المئوية</th>
            <th className={th}>التغير عن الصورة السابقة</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => (
            <tr key={r.imageId}>
              <td className={cn(td, compact && "py-2")}>{imageLabel(i, rows.length, r.date)}</td>
              <td className={cn(td, compact && "py-2")}>
                <span className="ltr font-mono">{formatKm2(r.affectedKm2)}</span> <span className="ltr text-xs text-muted-foreground">km²</span>
              </td>
              <td className={cn(td, "ltr text-start font-mono font-semibold", compact && "py-2")}>{formatPct(r.affectedPct)}</td>
              <td className={cn(td, compact && "py-2")}>
                <ChangeChip value={r.changePct} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Simple bar chart of the affected percentage per day (plain HTML, prints well). */
export function ComparisonChart({
  days,
  kind,
  activeIndex,
  onSelect,
  className,
}: {
  days: DayResult[];
  kind: "flood" | "fire";
  activeIndex?: number | undefined;
  onSelect?: ((i: number) => void) | undefined;
  className?: string;
}) {
  const max = Math.max(10, ...days.map((d) => d.affectedPct));
  const scale = Math.ceil(max / 10) * 10;
  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex h-48 items-end gap-4 border-b border-s px-4 pt-6">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <div key={f} className="pointer-events-none absolute inset-x-0 border-t border-dashed" style={{ bottom: `${f * 100}%` }}>
            <span className="ltr absolute -top-2 start-1 bg-card px-1 font-mono text-[10px] text-muted-foreground">{Math.round(scale * f)}%</span>
          </div>
        ))}
        {days.map((d, i) => {
          const active = activeIndex === i;
          return (
            <button
              key={d.imageId}
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect?.(i)}
              className="group relative z-10 flex h-full flex-1 flex-col items-center justify-end disabled:cursor-default"
              aria-label={`${imageLabel(i, days.length, d.date)}: ${formatPct(d.affectedPct)}`}
            >
              <span className="ltr mb-1 font-mono text-xs font-semibold">{formatPct(d.affectedPct)}</span>
              <span
                className={cn(
                  "w-full max-w-16 rounded-t-sm transition-opacity",
                  kind === "flood" ? "bg-water" : "bg-burn",
                  activeIndex !== undefined && !active && "opacity-45 group-hover:opacity-75",
                )}
                style={{ height: `${(d.affectedPct / scale) * 100}%` }}
              />
            </button>
          );
        })}
      </div>
      <div className="flex gap-4 px-4 pt-2">
        {days.map((d, i) => (
          <div key={d.imageId} className="flex-1 text-center text-[11px] leading-tight">
            {days.length > 2 && <div className="font-medium">الصورة {i + 1}</div>}
            <div className={days.length > 2 ? "text-muted-foreground" : "font-medium"}>{formatDate(d.date)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
