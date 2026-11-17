import { useState, type FormEvent, type ReactNode } from "react";
import { Save, Waves, Flame, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UPCOMING_TYPES, daysBetween, joinLocation, todayISO, weekdayName, type Incident, type IncidentType } from "@/lib/demo-data";

export interface IncidentFormValues {
  name: string;
  type: IncidentType;
  location: string;
  region: string;
  city: string;
  district: string;
  startDate: string;
  endDate: string | undefined;
  description: string;
  sharedWithResponders: boolean;
}

export function IncidentForm({ initial, onSubmit, onCancel }: { initial?: Incident; onSubmit: (v: IncidentFormValues) => void; onCancel: () => void }) {
  const [v, setV] = useState<IncidentFormValues>({
    name: initial?.name ?? "",
    type: initial?.type ?? "flood",
    location: initial?.location ?? "",
    region: initial?.region ?? "",
    city: initial?.city ?? "",
    district: initial?.district ?? "",
    startDate: initial?.startDate ?? "",
    endDate: initial?.endDate ?? "",
    description: initial?.description ?? "",
    sharedWithResponders: initial?.sharedWithResponders ?? false,
  });
  /** Required choice: ongoing ("مستمرة") or ended ("أغلقت"). Not pre-selected for a new case. */
  const [state, setState] = useState<"" | "ongoing" | "ended">(initial ? (initial.endDate ? "ended" : "ongoing") : "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const today = todayISO();
  const duration = state === "ended" && v.startDate && v.endDate && v.endDate >= v.startDate ? daysBetween(v.startDate, v.endDate) : 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!v.name.trim()) err["name"] = "اسم الحالة مطلوب";
    if (!v.region.trim()) err["region"] = "المنطقة مطلوبة";
    if (!v.city.trim()) err["city"] = "المدينة مطلوبة";
    if (!state) err["state"] = "اختر حالة الكارثة";
    if (!v.startDate) err["startDate"] = "تاريخ البداية مطلوب";
    else if (v.startDate > today) err["startDate"] = "لا يمكن أن يكون تاريخ البداية في المستقبل";
    if (state === "ended") {
      if (!v.endDate) err["endDate"] = "تاريخ النهاية مطلوب";
      else if (v.startDate && v.endDate < v.startDate) err["endDate"] = "يجب ألا يسبق تاريخ النهاية تاريخ البداية";
      else if (v.endDate > today) err["endDate"] = "لا يمكن أن يكون تاريخ النهاية في المستقبل";
    }
    setErrors(err);
    if (Object.keys(err).length === 0) {
      const region = v.region.trim(), city = v.city.trim(), district = v.district.trim();
      onSubmit({ ...v, name: v.name.trim(), region, city, district, location: joinLocation(region, city, district), endDate: state === "ended" ? v.endDate : undefined });
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="اسم الحالة" error={errors["name"]}>
        <input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="مثال: سيول وادي الأخضر" className="field" maxLength={120} />
      </Field>

      <Field label="نوع الكارثة">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(["flood", "fire"] as IncidentType[]).map((t) => {
            const Icon = t === "flood" ? Waves : Flame;
            const active = v.type === t;
            return (
              <button
                type="button"
                key={t}
                onClick={() => setV({ ...v, type: t })}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-3 py-2 text-start text-sm transition-colors",
                  active ? (t === "flood" ? "border-water bg-water-soft" : "border-burn bg-burn-soft") : "bg-card hover:bg-muted",
                )}
              >
                <Icon className={cn("h-5 w-5", t === "flood" ? "text-water" : "text-burn")} />
                <span className="font-semibold">{t === "flood" ? "فيضان" : "حريق"}</span>
              </button>
            );
          })}
          {UPCOMING_TYPES.map((t) => (
            <button key={t} type="button" disabled className="flex cursor-not-allowed items-center gap-3 rounded-md border border-dashed bg-muted/40 px-3 py-2 text-start text-sm text-muted-foreground">
              <Hourglass className="h-4 w-4" />
              <span>{t}</span>
              <span className="ms-auto rounded bg-secondary px-1.5 py-0.5 text-[11px]">قريباً</span>
            </button>
          ))}
        </div>
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="المنطقة" error={errors["region"]}>
          <input value={v.region} onChange={(e) => setV({ ...v, region: e.target.value })} placeholder="مثال: منطقة مكة المكرمة" className="field" maxLength={60} list="mirsad-regions" />
          <datalist id="mirsad-regions">
            {REGIONS.map((r) => <option key={r} value={r} />)}
          </datalist>
        </Field>
        <Field label="المدينة" error={errors["city"]}>
          <input value={v.city} onChange={(e) => setV({ ...v, city: e.target.value })} placeholder="مثال: جدة" className="field" maxLength={60} />
        </Field>
        <Field label="الحي أو الشارع" error={errors["district"]}>
          <input value={v.district} onChange={(e) => setV({ ...v, district: e.target.value })} placeholder="مثال: حي الروضة" className="field" maxLength={80} />
        </Field>
      </div>

      <Field label="حالة الكارثة" error={errors["state"]}>
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {([["ongoing", "مستمرة"], ["ended", "أغلقت"]] as const).map(([k, label]) => (
            <label key={k} className={cn("flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm", state === k ? "border-primary bg-primary-soft font-semibold" : "bg-card hover:bg-muted")}>
              <input type="radio" name="incident-state" value={k} checked={state === k} onChange={() => setState(k)} className="h-4 w-4 accent-primary" />
              {label}
            </label>
          ))}
        </div>
      </Field>

      {state && (
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="تاريخ البداية" error={errors["startDate"]}>
              <input type="date" value={v.startDate} max={today} onChange={(e) => setV({ ...v, startDate: e.target.value })} className="field" />
              {v.startDate && <Weekday iso={v.startDate} />}
            </Field>
            {state === "ended" && (
              <Field label="تاريخ النهاية" error={errors["endDate"]}>
                <input type="date" value={v.endDate ?? ""} min={v.startDate || undefined} max={today} onChange={(e) => setV({ ...v, endDate: e.target.value })} className="field" />
                {v.endDate && <Weekday iso={v.endDate} />}
              </Field>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {state === "ongoing" ? "تُحفظ الحالة «نشطة» دون تاريخ نهاية. اختر اليوم الذي بدأت فيه الكارثة فعلياً، لا يوم الإدخال." : "تُحفظ الحالة «مغلقة». إذا استمرت الكارثة يوماً واحداً اجعل التاريخين متساويين."}
            {duration > 0 && <span className="ms-2 font-medium text-foreground">المدة: {duration === 1 ? "يوم واحد" : `${duration} أيام`}</span>}
          </p>
        </div>
      )}

      <Field label="الوصف">
        <textarea value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} rows={3} maxLength={1000} placeholder="وصف موجز للحالة ومنطقة الاهتمام…" className="field h-auto py-2" />
      </Field>

      <label className="flex items-start gap-2.5 rounded-md border bg-muted/40 p-3 text-sm">
        <input type="checkbox" checked={v.sharedWithResponders} onChange={(e) => setV({ ...v, sharedWithResponders: e.target.checked })} className="mt-0.5 h-4 w-4 accent-primary" />
        <span>
          <span className="font-medium">إتاحة الحالة للمستجيبين الميدانيين</span>
          <span className="block text-xs text-muted-foreground">يرى المستجيبون النتائج المراجَعة فقط لهذه الحالة.</span>
        </span>
      </label>

      <div className="flex gap-2 border-t pt-4">
        <Button type="submit" size="lg"><Save /> حفظ الحالة</Button>
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>إلغاء</Button>
      </div>
    </form>
  );
}

const REGIONS = ["منطقة الرياض", "منطقة مكة المكرمة", "منطقة المدينة المنورة", "منطقة القصيم", "المنطقة الشرقية", "منطقة عسير", "منطقة تبوك", "منطقة حائل", "منطقة الحدود الشمالية", "منطقة جازان", "منطقة نجران", "منطقة الباحة", "منطقة الجوف"];

function Weekday({ iso }: { iso: string }) {
  return <p className="text-xs text-muted-foreground">يوم {weekdayName(iso)}</p>;
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="block text-sm font-medium">{label}</div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
