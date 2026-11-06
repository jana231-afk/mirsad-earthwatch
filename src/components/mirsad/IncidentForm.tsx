import { useState, type FormEvent } from "react";
import { Save, Waves, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Incident, IncidentType, IncidentStatus } from "@/lib/demo-data";

export interface IncidentFormValues {
  name: string;
  type: IncidentType;
  location: string;
  date: string;
  description: string;
  status: IncidentStatus;
  sharedWithResponders: boolean;
}

export function IncidentForm({
  initial,
  onSubmit,
  onCancel,
  isEdit,
}: {
  initial?: Incident;
  onSubmit: (v: IncidentFormValues) => void;
  onCancel: () => void;
  isEdit?: boolean;
}) {
  const [v, setV] = useState<IncidentFormValues>({
    name: initial?.name ?? "",
    type: initial?.type ?? "flood",
    location: initial?.location ?? "",
    date: initial?.date ?? "",
    description: initial?.description ?? "",
    status: initial?.status ?? "open",
    sharedWithResponders: initial?.sharedWithResponders ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!v.name.trim()) err['name'] = "اسم الحادثة مطلوب";
    if (!v.location.trim()) err['location'] = "الموقع مطلوب";
    if (!v.date) err['date'] = "تاريخ الحادثة مطلوب";
    setErrors(err);
    if (Object.keys(err).length === 0) onSubmit(v);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="اسم الحادثة" en="Incident name" error={errors['name']}>
        <input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="مثال: سيول وادي الأخضر" className="field" maxLength={120} />
      </Field>

      <Field label="نوع الحادثة" en="Incident type">
        <div className="grid grid-cols-2 gap-3">
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
                <span>
                  <span className="block font-semibold">{t === "flood" ? "فيضان" : "حريق"}</span>
                  <span className="ltr block text-xs text-muted-foreground">{t === "flood" ? "Flood" : "Fire / Burned area"}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="الموقع" en="Location" error={errors['location']}>
          <input value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} placeholder="المدينة، المنطقة" className="field" maxLength={120} />
        </Field>
        <Field label="تاريخ الحادثة" en="Incident date" error={errors['date']}>
          <input type="date" value={v.date} onChange={(e) => setV({ ...v, date: e.target.value })} className="field ltr" />
        </Field>
      </div>

      <Field label="الوصف" en="Description">
        <textarea
          value={v.description}
          onChange={(e) => setV({ ...v, description: e.target.value })}
          rows={4}
          maxLength={1000}
          placeholder="وصف موجز للحادثة ومنطقة الاهتمام…"
          className="field h-auto py-2"
        />
      </Field>

      {isEdit && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="الحالة" en="Status">
            <select value={v.status} onChange={(e) => setV({ ...v, status: e.target.value as IncidentStatus })} className="field">
              <option value="open">مفتوحة · Open</option>
              <option value="closed">مغلقة · Closed</option>
            </select>
          </Field>
        </div>
      )}

      <label className="flex items-start gap-2.5 rounded-md border bg-muted/40 p-3 text-sm">
        <input
          type="checkbox"
          checked={v.sharedWithResponders}
          onChange={(e) => setV({ ...v, sharedWithResponders: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        <span>
          <span className="font-medium">إتاحة الحادثة للمستجيبين الميدانيين</span>
          <span className="block text-xs text-muted-foreground">
            يرى المستجيبون النتائج المعتمدة (Reviewed) فقط لهذه الحادثة.
          </span>
        </span>
      </label>

      <div className="flex gap-2 border-t pt-5">
        <Button type="submit" size="lg">
          <Save /> حفظ الحادثة
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

function Field({ label, en, error, children }: { label: string; en?: string | undefined; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {label} {en && <span className="ltr text-xs font-normal text-muted-foreground">{en}</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
