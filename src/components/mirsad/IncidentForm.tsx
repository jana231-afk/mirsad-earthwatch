import { useState, type FormEvent, type ReactNode } from "react";
import { Save, Waves, Flame, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AutoStatusNote } from "./bits";
import { UPCOMING_TYPES, daysBetween, type Incident, type IncidentType } from "@/lib/demo-data";

export interface IncidentFormValues {
  name: string;
  type: IncidentType;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  sharedWithResponders: boolean;
}

export function IncidentForm({ initial, onSubmit, onCancel }: { initial?: Incident; onSubmit: (v: IncidentFormValues) => void; onCancel: () => void }) {
  const [v, setV] = useState<IncidentFormValues>({
    name: initial?.name ?? "",
    type: initial?.type ?? "flood",
    location: initial?.location ?? "",
    startDate: initial?.startDate ?? "",
    endDate: initial?.endDate ?? "",
    description: initial?.description ?? "",
    sharedWithResponders: initial?.sharedWithResponders ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const duration = v.startDate && v.endDate && v.endDate >= v.startDate ? daysBetween(v.startDate, v.endDate) : 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!v.name.trim()) err["name"] = "اسم الحالة مطلوب";
    if (!v.location.trim()) err["location"] = "الموقع مطلوب";
    if (!v.startDate) err["startDate"] = "تاريخ البداية مطلوب";
    if (!v.endDate) err["endDate"] = "تاريخ النهاية مطلوب";
    if (v.startDate && v.endDate && v.endDate < v.startDate) err["endDate"] = "يجب ألا يسبق تاريخ النهاية تاريخ البداية";
    setErrors(err);
    if (Object.keys(err).length === 0) onSubmit({ ...v, name: v.name.trim(), location: v.location.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="اسم الحالة" error={errors["name"]}>
        <input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="مثال: سيول وادي الأخضر" className="field" maxLength={120} />
      </Field>

      <Field label="نوع الكارثة">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(["flood", "fire"] as IncidentType[]).map((t) => {
            const Icon = t === "flood" ? Waves : Flame;
            const active = v.type === t;
            return (
              <button
                type="button"
                key={t}
                onClick={() => setV({ ...v, type: t })}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-4 py-3 text-start text-sm transition-colors",
                  active ? (t === "flood" ? "border-water bg-water-soft" : "border-burn bg-burn-soft") : "bg-card hover:bg-muted",
                )}
              >
                <Icon className={cn("h-5 w-5", t === "flood" ? "text-water" : "text-burn")} />
                <span className="font-semibold">{t === "flood" ? "فيضان" : "حريق"}</span>
              </button>
            );
          })}
          {UPCOMING_TYPES.map((t) => (
            <button key={t} type="button" disabled className="flex cursor-not-allowed items-center gap-3 rounded-md border border-dashed bg-muted/40 px-4 py-3 text-start text-sm text-muted-foreground">
              <Hourglass className="h-4 w-4" />
              <span>{t}</span>
              <span className="ms-auto rounded bg-secondary px-1.5 py-0.5 text-[11px]">قريباً</span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="الموقع" error={errors["location"]}>
        <input value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} placeholder="المدينة، المنطقة" className="field" maxLength={120} />
      </Field>

      <div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="تاريخ البداية (من)" error={errors["startDate"]}>
            <input type="date" value={v.startDate} onChange={(e) => setV({ ...v, startDate: e.target.value, endDate: v.endDate || e.target.value })} className="field" />
          </Field>
          <Field label="تاريخ النهاية (إلى)" error={errors["endDate"]}>
            <input type="date" value={v.endDate} min={v.startDate || undefined} onChange={(e) => setV({ ...v, endDate: e.target.value })} className="field" />
          </Field>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          إذا استمرت الكارثة يوماً واحداً اجعل التاريخين متساويين.
          {duration > 0 && <span className="ms-2 font-medium text-foreground">المدة: {duration === 1 ? "يوم واحد" : `${duration} أيام`}</span>}
        </p>
      </div>

      <Field label="الوصف">
        <textarea value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} rows={4} maxLength={1000} placeholder="وصف موجز للحالة ومنطقة الاهتمام…" className="field h-auto py-2" />
      </Field>

      <label className="flex items-start gap-2.5 rounded-md border bg-muted/40 p-3 text-sm">
        <input type="checkbox" checked={v.sharedWithResponders} onChange={(e) => setV({ ...v, sharedWithResponders: e.target.checked })} className="mt-0.5 h-4 w-4 accent-primary" />
        <span>
          <span className="font-medium">إتاحة الحالة للمستجيبين الميدانيين</span>
          <span className="block text-xs text-muted-foreground">يرى المستجيبون النتائج المراجَعة فقط لهذه الحالة.</span>
        </span>
      </label>

      <AutoStatusNote />

      <div className="flex gap-2 border-t pt-5">
        <Button type="submit" size="lg"><Save /> حفظ الحالة</Button>
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>إلغاء</Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="block text-sm font-medium">{label}</div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
