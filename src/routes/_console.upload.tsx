import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { UploadCloud, X, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, Notice } from "@/components/mirsad/bits";
import { cn } from "@/lib/utils";
import { demoActions, nextId, useDemo } from "@/lib/demo-store";
import { SENSORS, demoPreview, todayISO, type GeoImage, type ImageRole } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/upload")({
  validateSearch: (s: Record<string, unknown>): { incident?: string | undefined } => ({
    incident: typeof s["incident"] === "string" ? s["incident"] : undefined,
  }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "رفع الصور · مِرصاد" },
      { name: "description", content: "رفع صورة جغرافية أو عدة صور بصيغة GeoTIFF والتحقق من بياناتها." },
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
      <PageHeader title="رفع الصور" description="ارفع صورة جغرافية واحدة أو عدة صور معاً بصيغة GeoTIFF، ثم تحقق منها قبل الحفظ." />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel title="الحالة">
            <select value={incidentId} onChange={(e) => { setIncidentId(e.target.value); setItems([]); }} className="field">
              {incidents.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.id})</option>)}
            </select>
          </Panel>
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
        </div>
        <div className="space-y-4">
          <Notice tone="info" icon={<Info className="h-4 w-4" />} title="ملاحظات">
            يجب أن يكون لكل صورة تاريخ التقاط. إذا أُضيفت صورة بتاريخ لاحق إلى حالة مغلقة تعود الحالة «نشطة» تلقائياً. لا يقوم النظام بتنزيل الصور آلياً.
          </Notice>
          <Notice tone="warning" title="بيانات تجريبية">نتائج التحقق والخريطة تمثيلية، وليست قراءة فعلية للملف. التاريخ المقترح من اسم الملف قابل للتعديل.</Notice>
        </div>
      </div>
    </>
  );
}
