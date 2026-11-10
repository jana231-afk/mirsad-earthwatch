import { cn } from "@/lib/utils";
import { dayLabel, formatDate, type DayResult } from "@/lib/demo-data";

export function DayTabs({ days, value, onChange }: { days: DayResult[]; value: number; onChange: (i: number) => void }) {
  if (days.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {days.map((d, i) => (
        <button key={d.imageId} role="tab" aria-selected={i === value} type="button" onClick={() => onChange(i)}
          className={cn("rounded-md border px-3 py-2 text-start text-sm", i === value ? "border-primary bg-primary-soft font-semibold" : "bg-card hover:bg-muted")}>
          <div>{dayLabel(i)}</div>
          <div className="text-xs text-muted-foreground">{formatDate(d.date)}</div>
        </button>
      ))}
    </div>
  );
}
