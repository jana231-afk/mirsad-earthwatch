import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { UploadCloud, FileImage, X, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Loader2, Save, Info } from "lucide-react";
import floodPost from "@/assets/flood-post.jpg";
import firePost from "@/assets/fire-post.jpg";
import firePre from "@/assets/fire-pre.jpg";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, Notice } from "@/components/mirsad/bits";
import { cn } from "@/lib/utils";
import { demoActions, useDemo } from "@/lib/demo-store";
import { SENSORS, type ImageRole } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/upload")({
  validateSearch: (s: Record<string, unknown>): { incident?: string | undefined } => ({
    incident: typeof s['incident'] === "string" ? s['incident'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "رفع صورة فضائية · MIRSAD" },
      { name: "description", content: "Upload a GeoTIFF satellite image and validate its CRS, dimensions, bands and NoData metadata." },
      { property: "og:title", content: "Upload Satellite Image · MIRSAD" },
      { property: "og:description", content: "GeoTIFF upload and metadata validation for disaster analysis." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <UploadPage />
    </RoleGate>
  ),
});

type Check = { label: string; en: string; value: string; ok: boolean | "warn" };
type Result = { supported: boolean; checks: Check[]; warnings: string[]; errors: string[] };

function formatSize(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function simulateValidation(file: File, sensor: string, manualDate: string): Result {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (!["tif", "tiff"].includes(ext)) {
    return {
      supported: false,
      checks: [
        { label: "قابلية قراءة الملف", en: "File readable", value: "تعذّرت القراءة كملف نقطي جغرافي", ok: false },
        { label: "نظام الإحداثيات", en: "CRS", value: "—", ok: false },
        { label: "أبعاد الصورة", en: "Dimensions", value: "—", ok: false },
        { label: "عدد النطاقات", en: "Bands", value: "—", ok: false },
        { label: "بيانات NoData", en: "NoData", value: "—", ok: false },
      ],
      warnings: [],
      errors: [`صيغة الملف (.${ext}) غير مدعومة. يقبل النظام ملفات GeoTIFF فقط (.tif / .tiff).`],
    };
  }
  const isS1 = sensor.startsWith("Sentinel-1");
  const isLandsat = sensor.startsWith("Landsat");
  const unknown = sensor.includes("Unknown");
  const hasDateInName = /20\d{6}/.test(file.name);
  const warnings: string[] = [];
  if (!hasDateInName && !manualDate) warnings.push("تاريخ الالتقاط غير موجود في البيانات الوصفية — يرجى إدخاله يدوياً قبل الحفظ.");
  if (!hasDateInName && manualDate) warnings.push(`تاريخ الالتقاط غير موجود في البيانات الوصفية — سيُستخدم التاريخ المُدخل يدوياً (${manualDate}).`);
  if (unknown) warnings.push("المستشعر غير معروف — تأكد من توافق ترتيب النطاقات مع مدخلات النموذج.");
  if (!isS1) warnings.push("تم اكتشاف بكسلات NoData (القيمة 0) بنسبة ≈3.0% — ستُستبعد من حساب المساحة.");
  return {
    supported: true,
    checks: [
      { label: "قابلية قراءة الملف", en: "File readable", value: "نعم · GeoTIFF (Rasterio)", ok: true },
      { label: "نظام الإحداثيات", en: "CRS", value: isLandsat ? "EPSG:32638 — UTM 38N" : "EPSG:32637 — UTM 37N", ok: true },
      { label: "أبعاد الصورة", en: "Dimensions", value: isLandsat ? "7,621 × 7,751 px · 30 m" : "10,980 × 10,980 px · 10 m", ok: true },
      { label: "عدد النطاقات", en: "Bands", value: isS1 ? "2 (VV, VH)" : isLandsat ? "7" : "4 (B2, B3, B4, B8)", ok: unknown ? "warn" : true },
      { label: "بيانات NoData", en: "NoData", value: isS1 ? "غير محددة · Not set" : "0 · ≈3.0%", ok: isS1 ? "warn" : "warn" },
      { label: "تاريخ الالتقاط", en: "Acquisition date", value: hasDateInName ? "من البيانات الوصفية" : manualDate ? `يدوي: ${manualDate}` : "مفقود · Missing", ok: hasDateInName ? true : "warn" },
    ],
    warnings,
    errors: [],
  };
}

function UploadPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { incidents, images } = useDemo();
  const openIncidents = incidents.filter((i) => i.status === "open");
  const [incidentId, setIncidentId] = useState(search.incident ?? openIncidents[0]?.id ?? "");
  const [imageRole, setImageRole] = useState<ImageRole>("post-event");
  const [sensor, setSensor] = useState<string>(SENSORS[0] ?? "");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [state, setState] = useState<"idle" | "validating" | "done">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const incident = incidents.find((i) => i.id === incidentId);

  const pick = (f: File | undefined | null) => {
    if (!f) return;
    setFile(f);
    setState("idle");
    setResult(null);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    pick(e.dataTransfer.files?.[0]);
  };

  const validate = () => {
    if (!file) return;
    setState("validating");
    setTimeout(() => {
      setResult(simulateValidation(file, sensor, date));
      setState("done");
    }, 1100);
  };

  const needsDate = result?.supported && !/20\d{6}/.test(file?.name ?? "") && !date;
  const canSave = !!result?.supported && !!incident && !needsDate;

  const save = () => {
    if (!file || !result || !incident) return;
    const n = images.length + 200;
    const id = `IMG-${n}`;
    const preview = incident.type === "flood" ? floodPost : imageRole === "pre-event" ? firePre : firePost;
    demoActions.addImage({
      id,
      incidentId: incident.id,
      fileName: file.name,
      sizeMB: Math.round((file.size / 1024 / 1024) * 10) / 10,
      sensor,
      imageRole,
      acquisitionDate: date || "2026-11-03",
      acquisitionDateSource: date ? "manual" : "metadata",
      crs: result.checks[1]?.value ?? "—",
      width: 10980,
      height: 10980,
      bands: 4,
      resolution: "10 m",
      nodata: result.checks[4]?.value ?? "—",
      status: result.warnings.length ? "warning" : "valid",
      warnings: result.warnings,
      uploadedAt: new Date().toISOString().slice(0, 10),
      preview,
    });
    toast.success("تم حفظ الصورة وربطها بالحادثة", { description: `${id} → ${incident.id}` });
    navigate({ to: "/incidents/$id", params: { id: incident.id } });
  };

  return (
    <>
      <PageHeader
        title="رفع صورة قمر صناعي"
        en="Upload Satellite Image"
        description="ارفع ملف GeoTIFF يدوياً وتحقق من بياناته الوصفية قبل ربطه بالحادثة."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Panel title="١. بيانات الصورة" en="Image details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium">الحادثة المرتبطة <span className="ltr text-xs text-muted-foreground">Incident</span></label>
                <select value={incidentId} onChange={(e) => setIncidentId(e.target.value)} className="field">
                  {openIncidents.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.id} — {i.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">نوع الصورة <span className="ltr text-xs text-muted-foreground">Image type</span></label>
                <select value={imageRole} onChange={(e) => setImageRole(e.target.value as ImageRole)} className="field">
                  <option value="post-event">بعد الحدث · Post-event</option>
                  <option value="pre-event">قبل الحدث · Pre-event</option>
                  <option value="single">صورة واحدة · Single</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">المستشعر (إن كان معروفاً) <span className="ltr text-xs text-muted-foreground">Sensor</span></label>
                <select value={sensor} onChange={(e) => setSensor(e.target.value)} className="field">
                  {SENSORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">تاريخ الالتقاط <span className="ltr text-xs text-muted-foreground">Acquisition date</span></label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field ltr" />
                <p className="text-xs text-muted-foreground">أدخله فقط إذا لم يكن متوفراً في البيانات الوصفية.</p>
              </div>
            </div>
          </Panel>

          <Panel title="٢. ملف GeoTIFF" en="File">
            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
                  drag ? "border-primary bg-primary-soft" : "border-input bg-muted/40",
                )}
              >
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-card text-primary shadow-card">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="font-semibold">اسحب الملف وأفلته هنا</div>
                <div className="ltr text-xs text-muted-foreground">Drag & drop a GeoTIFF file</div>
                <div className="my-3 text-xs text-muted-foreground">أو</div>
                <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                  استعراض الملفات · Browse
                </Button>
                <div className="mt-4 text-xs text-muted-foreground">
                  الصيغ المقبولة: <span className="ltr font-mono">.tif, .tiff</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-lg border bg-muted/40 p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-card text-navy shadow-card">
                  <FileImage className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="ltr truncate text-start font-mono text-sm font-medium" title={file.name}>{file.name}</div>
                  <div className="ltr text-start text-xs text-muted-foreground">{formatSize(file.size)}</div>
                </div>
                <Button type="button" variant="ghost" size="icon" aria-label="إزالة الملف" onClick={() => { setFile(null); setResult(null); setState("idle"); }}>
                  <X />
                </Button>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".tif,.tiff,image/tiff"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
              data-testid="geotiff-input"
            />
            <div className="mt-4 flex items-center gap-3">
              <Button onClick={validate} disabled={!file || state === "validating"} variant="navy">
                {state === "validating" ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                التحقق من الصورة · Validate
              </Button>
              <span className="text-xs text-muted-foreground">لا يتم تنزيل الصور تلقائياً — الرفع يدوي فقط.</span>
            </div>
          </Panel>
        </div>

        <Panel title="نتائج التحقق" en="Validation results" className="self-start">
          {state === "idle" && !result && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              اختر ملفاً ثم اضغط «التحقق من الصورة» لعرض النتائج.
            </div>
          )}
          {state === "validating" && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> جارٍ قراءة البيانات الوصفية…
            </div>
          )}
          {state === "done" && result && (
            <div className="space-y-4">
              <ul className="divide-y rounded-md border">
                {result.checks.map((c) => (
                  <li key={c.en} className="flex items-start gap-3 px-3 py-2.5 text-sm">
                    {c.ok === true ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    ) : c.ok === "warn" ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">
                        {c.label} <span className="ltr text-[11px] font-normal text-muted-foreground">{c.en}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{c.value}</div>
                    </div>
                  </li>
                ))}
              </ul>

              {result.errors.map((e) => (
                <Notice key={e} tone="danger" title="الصورة غير مدعومة · Unsupported" icon={<XCircle className="h-4 w-4" />}>{e}</Notice>
              ))}
              {result.warnings.map((w) => (
                <Notice key={w} tone="warning" icon={<AlertTriangle className="h-4 w-4" />}>{w}</Notice>
              ))}
              {result.supported && result.warnings.length === 0 && (
                <Notice tone="success" icon={<CheckCircle2 className="h-4 w-4" />}>الصورة صالحة للتحليل.</Notice>
              )}

              <Button onClick={save} disabled={!canSave} className="w-full" size="lg">
                <Save /> حفظ الصورة في الحادثة
              </Button>
              {needsDate && <p className="text-center text-xs text-destructive">أدخل تاريخ الالتقاط للمتابعة.</p>}
            </div>
          )}
          <div className="mt-5 flex gap-2 border-t pt-4 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            في هذا العرض التجريبي تتم محاكاة نتائج التحقق. في النظام الفعلي تُقرأ البيانات بواسطة Rasterio على الخادم.
          </div>
        </Panel>
      </div>
    </>
  );
}
