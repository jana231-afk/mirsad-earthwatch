import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { UploadCloud, Send, Clock, X, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, Notice } from "@/components/mirsad/bits";
import { cn } from "@/lib/utils";
import { demoActions, nextId, nowStamp, useDemo } from "@/lib/demo-store";
import { SENSORS, TYPE_LABELS, demoPreview, joinLocation, todayISO, type GeoImage, type ImageRole, type Incident } from "@/lib/demo-data";
import { imageRequestPeriodError } from "@/lib/demo-rules";

export const Route = createFileRoute("/_console/upload")({
  validateSearch: (s: Record<string, unknown>): { incident?: string | undefined } => ({
    incident: typeof s["incident"] === "string" ? s["incident"] : undefined,
  }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "رفع الصور وطلبها · مِرصاد" },
      { name: "description", content: "رفع صور GeoTIFF من الجهاز أو طلب صور من مزوّد البيانات للحالة." },
      { property: "og:title", content: "رفع الصور · مِرصاد" },
      { property: "og:description", content: "رفع الصور الجغرافية والتحقق من نظام الإحداثيات والأبعاد والنطاقات." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <UploadPage />
    </RoleGate>
  ),
});

type Check = { label: string; value: string; ok: boolean | "warn" };
type Item = { key: string; file: File; sensor: string; role: ImageRole; date: string; dateFromMeta: boolean; result?: undefined | { supported: boolean; checks: Check[]; warnings: string[] } };

function dateFromName(name: string) {
  const m = name.match(/(20\d{2})-?(\d{2})-?(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
}
const size = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(1)} KB`);

function validate(it: Item): NonNullable<Item["result"]> {
  const ext = it.file.name.toLowerCase().split(".").pop() ?? "";
  if (!["tif", "tiff"].includes(ext))
    return {
      supported: false,
      checks: ["قابلة للقراءة", "نظام الإحداثيات (CRS)", "الأبعاد", "عدد النطاقات", "قيم NoData"].map((l) => ({ label: l, value: "—", ok: false })),
      warnings: [`صيغة الملف (.${ext}) غير مدعومة. يقبل النظام ملفات GeoTIFF فقط.`],
    };
  const radar = it.sensor === "رادارية";
  const warnings: string[] = [];
  if (!it.dateFromMeta) warnings.push(it.date ? "تاريخ الالتقاط غير موجود في البيانات الوصفية، وسيُستخدم التاريخ المُدخل يدوياً." : "تاريخ الالتقاط غير موجود في البيانات الوصفية – يرجى إدخاله.");
  if (it.sensor === "غير معروف") warnings.push("نوع الصورة غير معروف، تأكد من توافق النطاقات مع النموذج.");
  if (!radar) warnings.push("توجد بكسلات بدون بيانات (نحو 3%) وستُستبعد من حساب المساحة.");
  return {
    supported: true,
    checks: [
      { label: "قابلة للقراءة", value: "نعم", ok: true },
      { label: "نظام الإحداثيات (CRS)", value: "EPSG:32637", ok: true },
      { label: "الأبعاد", value: "1280 × 960", ok: true },
      { label: "عدد النطاقات", value: radar ? "2" : "4", ok: true },
      { label: "قيم NoData", value: radar ? "غير محددة" : "0 (نحو 3%)", ok: "warn" },
    ],
    warnings,
  };
}

function UploadPage() {
  const search = Route.useSearch();
  const { incidents, images } = useDemo();
  const [incidentId, setIncidentId] = useState(search.incident ?? incidents[0]?.id ?? "");
  const inc = incidents.find((i) => i.id === incidentId);
  const [items, setItems] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState<"device" | "request">("device");
  const input = useRef<HTMLInputElement>(null);

  const add = (files: FileList | null) => {
    if (!files) return;
    const pickedFiles = Array.from(files);
    setSaved(false);
    setItems((prev) => [
      ...prev,
      ...pickedFiles.map((f, i) => {
        const d = dateFromName(f.name);
        return { key: `${f.name}-${Date.now()}-${i}`, file: f, sensor: "غير معروف", role: (inc?.type === "fire" ? "post" : "event") as ImageRole, date: d, dateFromMeta: false };
      }),
    ]);
  };
  const upd = (key: string, p: Partial<Item>) => setItems((l) => l.map((x) => (x.key === key ? { ...x, ...p, result: undefined } : x)));
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    add(e.dataTransfer.files);
  };
  const checkAll = () => setItems((l) => l.map((x) => ({ ...x, result: validate(x) })));
  const allChecked = items.length > 0 && items.every((x) => x.result);
  const saveable = items.filter((x) => x.result?.supported && x.date);

  const save = () => {
    if (!inc || !allChecked || !saveable.length) return;
    let pool: { id: string }[] = images;
    const list: GeoImage[] = saveable.flatMap((x) => {
      const result = x.result;
      if (!result?.supported || !x.date) return [];
      const id = nextId("IMG", pool);
      pool = [...pool, { id }];
      return [{
        id, incidentId: inc.id, fileName: x.file.name, sizeMB: +(x.file.size / 1048576).toFixed(1), sensor: x.sensor,
        imageRole: inc.type === "fire" ? x.role : "event", acquisitionDate: x.date, acquisitionDateSource: x.dateFromMeta ? "metadata" : "manual",
        crs: "EPSG:32637", width: 1280, height: 960, bands: x.sensor === "رادارية" ? 2 : 4, resolution: "10 م", nodata: "0",
        status: result.warnings.length ? "warning" : "valid", warnings: result.warnings, uploadedAt: todayISO(), preview: demoPreview(inc.type, x.role),
      }];
    });
    demoActions.addImages(list);
    toast.success(`تم حفظ ${list.length} صورة`);
    setItems([]);
    setSaved(true);
  };

  return (
    <>
      <PageHeader title="رفع الصور" description="اختر طريقة الحصول على الصور: رفعها من جهازك أو طلبها من مزوّد البيانات." />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel title="الحالة">
            <select value={incidentId} onChange={(e) => { setIncidentId(e.target.value); setItems([]); }} className="field">
              {incidents.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.id})</option>)}
            </select>
          </Panel>
          <div role="tablist" aria-label="طريقة الحصول على الصور" className="grid gap-3 sm:grid-cols-2">
            {([
              ["device", UploadCloud, "رفع الصور من الجهاز", "ملفات GeoTIFF موجودة لديك"],
              ["request", Send, "طلب صور من مزوّد البيانات", "إرسال طلب لفترة ومنطقة محددتين"],
            ] as const).map(([k, Icon, t, d]) => (
              <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)}
                className={cn("flex items-start gap-3 rounded-lg border-2 bg-card p-4 text-start transition-colors hover:border-primary/60", mode === k ? "border-primary bg-primary-soft" : "border-border")}>
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-md", mode === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}><Icon className="h-5 w-5" /></span>
                <span><span className="block font-semibold">{t}</span><span className="mt-0.5 block text-sm text-muted-foreground">{d}</span></span>
              </button>
            ))}
          </div>
          {mode === "request" ? (inc ? <RequestImages inc={inc} /> : null) : (<>
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={cn("rounded-lg border-2 border-dashed bg-card p-10 text-center", drag && "border-primary bg-primary-soft")}
          >
            <UploadCloud className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 font-medium">اسحب الملفات وأفلتها هنا</p>
            <p className="mt-1 text-sm text-muted-foreground">يمكن اختيار عدة ملفات GeoTIFF (.tif / .tiff) دفعة واحدة</p>
            <Button className="mt-4" variant="outline" onClick={() => input.current?.click()}>استعراض الملفات</Button>
            <input ref={input} type="file" multiple accept=".tif,.tiff" className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
          </div>

          {items.map((x) => (
            <Panel key={x.key} title={<span className="ltr break-all font-mono text-xs">{x.file.name}</span>} actions={<Button size="icon" variant="ghost" aria-label="إزالة" onClick={() => setItems((l) => l.filter((y) => y.key !== x.key))}><X className="h-4 w-4" /></Button>}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="text-sm"><div className="text-xs text-muted-foreground">الحجم</div><div className="ltr mt-2 text-start">{size(x.file.size)}</div></div>
                <label className="space-y-1 text-sm"><span className="text-xs text-muted-foreground">نوع الصورة</span>
                  <select className="field" value={x.sensor} onChange={(e) => upd(x.key, { sensor: e.target.value })}>{SENSORS.map((s) => <option key={s}>{s}</option>)}</select>
                </label>
                {inc?.type === "fire" && (
                  <label className="space-y-1 text-sm"><span className="text-xs text-muted-foreground">دور الصورة</span>
                    <select className="field" value={x.role} onChange={(e) => upd(x.key, { role: e.target.value as ImageRole })}>
                      <option value="pre">قبل الحدث</option><option value="post">بعد الحدث</option><option value="later">صورة لاحقة</option>
                    </select>
                  </label>
                )}
                <label className="space-y-1 text-sm"><span className="text-xs text-muted-foreground">تاريخ الالتقاط {x.dateFromMeta ? "(من البيانات الوصفية)" : "(مطلوب)"}</span>
                  <input type="date" className={cn("field", !x.date && "border-warning")} value={x.date} disabled={x.dateFromMeta} onChange={(e) => upd(x.key, { date: e.target.value })} />
                </label>
              </div>
              {!x.date && <p className="mt-3 flex items-center gap-1.5 text-xs text-warning-foreground"><AlertTriangle className="h-3.5 w-3.5" /> تاريخ الالتقاط غير موجود في البيانات الوصفية – يرجى إدخاله</p>}
              {x.result && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <div className="grid gap-2 sm:grid-cols-5">
                    {x.result.checks.map((c) => (
                      <div key={c.label} className="rounded-md border p-2 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {c.ok === true ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : c.ok === "warn" ? <AlertTriangle className="h-3.5 w-3.5 text-warning" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                          {c.label}
                        </div>
                        <div className="mt-1 font-medium">{c.value}</div>
                      </div>
                    ))}
                  </div>
                  {x.result.warnings.map((w) => <Notice key={w} tone={x.result?.supported ? "warning" : "danger"}>{w}</Notice>)}
                </div>
              )}
            </Panel>
          ))}

          {items.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button variant="navy" onClick={checkAll}><ShieldCheck /> التحقق من الصور</Button>
              <Button disabled={!allChecked || saveable.length === 0} onClick={save}><Save /> حفظ الصور ({saveable.length})</Button>
            </div>
          )}
          {saved && inc && (
            <Notice tone="success" title="تم حفظ الصور">
              <span className="flex flex-wrap gap-3">
                <Link to="/incidents/$id" params={{ id: inc.id }} className="text-primary hover:underline">عرض الحالة</Link>
                <Link to="/incidents/$id/analyze" params={{ id: inc.id }} className="text-primary hover:underline">بدء التحليل</Link>
              </span>
            </Notice>
          )}
          </>)}
        </div>
        <div className="space-y-4">
          <Notice tone="info" icon={<Info className="h-4 w-4" />} title="ملاحظات">
            يجب أن يكون لكل صورة تاريخ التقاط. إذا أُضيفت صورة بتاريخ لاحق إلى حالة مغلقة تعود الحالة «نشطة» تلقائياً. لا يقوم النظام بتنزيل الصور آلياً؛ الصور المطلوبة من المزوّد تمر بالتحقق نفسه عند وصولها.
          </Notice>
          <Notice tone="warning" title="بيانات تجريبية">نتائج التحقق والخريطة تمثيلية، وليست قراءة فعلية للملف. التاريخ المقترح من اسم الملف قابل للتعديل.</Notice>
        </div>
      </div>
    </>
  );
}

function RequestImages({ inc }: { inc: Incident }) {
  const { incidents, imageRequests, userName } = useDemo();
  const [area, setArea] = useState(joinLocation(inc.region, inc.city, inc.district));
  const [type, setType] = useState<Incident["type"]>(inc.type);
  const [fromDate, setFrom] = useState(inc.startDate);
  const [toDate, setTo] = useState(inc.endDate ?? todayISO());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(inc.id);
  if (key !== inc.id) {
    setKey(inc.id); setArea(joinLocation(inc.region, inc.city, inc.district)); setType(inc.type);
    setFrom(inc.startDate); setTo(inc.endDate ?? todayISO()); setError(null);
  }
  const submit = () => {
    const err = !area.trim() ? "حدد المنطقة الجغرافية المطلوبة." : imageRequestPeriodError(fromDate, toDate, todayISO());
    setError(err);
    if (err) return;
    demoActions.addImageRequest({
      id: nextId("REQ", imageRequests), incidentId: inc.id, area: area.trim(), fromDate, toDate, type, notes: notes.trim(),
      requestedAt: nowStamp(), requestedBy: userName, status: "awaiting_provider",
    });
    setNotes("");
    toast.success("تم إرسال طلب الصور، وهو بانتظار معالجة مزوّد البيانات");
  };
  const name = (id: string) => incidents.find((i) => i.id === id)?.name ?? id;
  return (
    <>
      <Panel title="طلب صور من مزوّد البيانات">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm sm:col-span-2"><span className="text-xs text-muted-foreground">المنطقة الجغرافية (من موقع الحالة، ويمكن تحديدها بدقة أكبر)</span>
            <input className="field" value={area} onChange={(e) => setArea(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm"><span className="text-xs text-muted-foreground">تاريخ بداية الفترة المطلوبة</span>
            <input type="date" className="field" value={fromDate} max={todayISO()} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm"><span className="text-xs text-muted-foreground">تاريخ نهاية الفترة المطلوبة</span>
            <input type="date" className="field" value={toDate} max={todayISO()} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm"><span className="text-xs text-muted-foreground">نوع الكارثة</span>
            <select className="field" value={type} onChange={(e) => setType(e.target.value as Incident["type"])}>
              <option value="flood">{TYPE_LABELS.flood}</option><option value="fire">حريق غابات</option>
            </select>
          </label>
          <label className="space-y-1 text-sm sm:col-span-2"><span className="text-xs text-muted-foreground">ملاحظات إضافية (اختياري)</span>
            <textarea className="field min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
        {error && <div className="mt-3"><Notice tone="danger">{error}</Notice></div>}
        <Button className="mt-4" onClick={submit}><Send /> إرسال طلب الصور</Button>
      </Panel>
      <Panel title="الطلبات المرسلة">
        {imageRequests.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد طلبات مرسلة بعد.</p> : (
          <ul className="divide-y">
            {imageRequests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <div className="font-medium">{name(r.incidentId)} · {r.type === "fire" ? "حريق غابات" : TYPE_LABELS.flood}</div>
                  <div className="text-xs text-muted-foreground">{r.area} · <span className="ltr">{r.fromDate}</span> إلى <span className="ltr">{r.toDate}</span> · <span className="ltr">{r.id}</span></div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-xs text-warning-foreground"><Clock className="h-3.5 w-3.5" /> بانتظار معالجة مزوّد البيانات</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">لا يوجد ربط فعلي مع مزوّد بيانات في هذا النموذج؛ يُسجَّل الطلب فقط ولا تُستلم صور.</p>
      </Panel>
    </>
  );
}
