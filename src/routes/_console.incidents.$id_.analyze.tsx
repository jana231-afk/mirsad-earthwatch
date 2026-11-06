import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Cpu, CheckCircle2, Loader2, Circle, FlaskConical, BarChart3, ClipboardCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  Panel,
  RoleGate,
  EmptyState,
  ExperimentalBadge,
  TypeBadge,
  Notice,
  InfoRow,
} from "@/components/mirsad/bits";
import { BinaryMask, ImageThumb } from "@/components/mirsad/MapViewer";
import { cn } from "@/lib/utils";
import { demoActions, useDemo } from "@/lib/demo-store";
import { FIRE_MODEL, FLOOD_MODEL, IMAGE_ROLE_LABELS, RUNS, formatKm2, type AnalysisRun } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/incidents/$id_/analyze")({
  head: () => ({
    meta: [
      { title: "تحليل الكارثة · MIRSAD" },
      { name: "description", content: "Run U-Net flood or burned-area segmentation on uploaded satellite images." },
      { property: "og:title", content: "Disaster Analysis · MIRSAD" },
      { property: "og:description", content: "Flood and burned-area segmentation with U-Net models." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <AnalyzePage />
    </RoleGate>
  ),
});

const STEPS = [
  { ar: "قراءة الصورة والتحقق من النطاقات", en: "Load raster (Rasterio)" },
  { ar: "تقسيم الصورة إلى مربعات 256×256 وتطبيع القيم", en: "Tiling & normalization" },
  { ar: "تشغيل نموذج التجزئة", en: "U-Net inference (PyTorch)" },
  { ar: "دمج القناع واستبعاد NoData وحساب المساحة", en: "Merge mask & compute area" },
];

function AnalyzePage() {
  const { id } = Route.useParams();
  const { incidents, images, runs, userName } = useDemo();
  const inc = incidents.find((i) => i.id === id);
  const imgs = useMemo(() => images.filter((m) => m.incidentId === id && m.status !== "unsupported"), [images, id]);
  const isFire = inc?.type === "fire";
  const preImgs = imgs.filter((m) => m.imageRole === "pre-event");
  const postImgs = imgs.filter((m) => m.imageRole !== "pre-event");

  const [imageId, setImageId] = useState(postImgs[0]?.id ?? "");
  const [preId, setPreId] = useState(preImgs[0]?.id ?? "");
  const [step, setStep] = useState(-1); // -1 idle, 0..3 running, 4 done
  const [run, setRun] = useState<AnalysisRun | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  if (!inc) return <EmptyState title="الحادثة غير موجودة" />;

  const model = isFire ? FIRE_MODEL : FLOOD_MODEL;
  const version = isFire ? "v0.3.0-exp" : "v1.2.0";
  const selected = imgs.find((m) => m.id === imageId);
  const selectedPre = imgs.find((m) => m.id === preId);

  const start = () => {
    if (!selected) return;
    setStep(0);
    setRun(null);
    let s = 0;
    timer.current = setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= STEPS.length) {
        if (timer.current) clearInterval(timer.current);
        const template = RUNS.find((r) => r.id === (isFire ? "RUN-0039" : "RUN-0042"))!;
        const maxN = Math.max(...runs.map((r) => Number(r.id.split("-")[1])));
        const now = new Date();
        const newRun: AnalysisRun = {
          ...template,
          id: `RUN-${String(maxN + 1).padStart(4, "0")}`,
          incidentId: inc.id,
          imageIds: isFire && selectedPre ? [selectedPre.id, selected.id] : [selected.id],
          modelVersion: version,
          startedAt: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
          status: "pending",
          runBy: userName,
          reviewer: undefined,
          reviewedAt: undefined,
          reviewNotes: undefined,
        };
        demoActions.addRun(newRun);
        setRun(newRun);
      }
    }, 800);
  };

  const running = step >= 0 && step < STEPS.length;

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "الحوادث", to: "/incidents" },
          { label: inc.name, to: "/incidents/$id", params: { id } },
          { label: "التحليل" },
        ]}
        title={isFire ? "تحليل المنطقة المحترقة" : "تحليل الفيضان"}
        en={isFire ? "Burned-Area Analysis" : "Flood Analysis"}
        description={
          <span className="flex items-center gap-2">
            <TypeBadge type={inc.type} /> {inc.name} · <span className="ltr font-mono text-xs">{inc.id}</span>
          </span>
        }
      />

      {isFire && (
        <div className="mb-6">
          <Notice tone="warning" title="تحليل تجريبي · Experimental" icon={<FlaskConical className="h-4 w-4" />}>
            نموذج تجزئة المناطق المحترقة تجريبي إلى أن يتم التحقق من مسار بيانات التدريب الخاص به. يُعرض الناتج كتقدير للمنطقة المحترقة فقط ولا يشمل كشف اللهب النشط.
          </Notice>
        </div>
      )}

      {imgs.length === 0 ? (
        <EmptyState title="لا توجد صور صالحة لهذه الحادثة">
          <Button asChild variant="navy" size="sm" className="mt-3">
            <Link to="/upload" search={{ incident: id }}>رفع صورة</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Panel title={isFire ? "الصور قبل الحدث وبعده" : "صورة القمر الصناعي المختارة"} en={isFire ? "Pre / post-event images" : "Selected image"}>
              <div className={cn("grid gap-4", isFire && "md:grid-cols-2")}>
                {isFire && (
                  <div className="space-y-2">
                    {selectedPre ? (
                      <ImageThumb src={selectedPre.preview} label="قبل الحدث · Pre-event" />
                    ) : (
                      <div className="grid aspect-[4/3] place-items-center rounded-lg border border-dashed bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                        <span><AlertTriangle className="mx-auto mb-2 h-5 w-5 text-warning" />لا تتوفر صورة قبل الحدث — سيُحلل النموذج صورة ما بعد الحدث فقط.</span>
                      </div>
                    )}
                    {preImgs.length > 0 && (
                      <select value={preId} onChange={(e) => setPreId(e.target.value)} className="field" disabled={running}>
                        {preImgs.map((m) => <option key={m.id} value={m.id}>{m.id} · {m.acquisitionDate}</option>)}
                      </select>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  {selected && <ImageThumb src={selected.preview} label={isFire ? "بعد الحدث · Post-event" : IMAGE_ROLE_LABELS[selected.imageRole]} />}
                  <select value={imageId} onChange={(e) => setImageId(e.target.value)} className="field" disabled={running}>
                    {postImgs.map((m) => <option key={m.id} value={m.id}>{m.id} · {m.sensor} · {m.acquisitionDate}</option>)}
                  </select>
                </div>
              </div>
              {selected && (
                <div className="ltr mt-3 truncate text-start font-mono text-xs text-muted-foreground">{selected.fileName}</div>
              )}
            </Panel>

            {step >= STEPS.length && run && (
              <Panel
                title={isFire ? "قناع المنطقة المحترقة الناتج" : "قناع المياه الناتج"}
                en={isFire ? "Burned-area mask" : "Water mask"}
                actions={<span className="ltr font-mono text-xs text-muted-foreground">{run.id}</span>}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <ImageThumb src={run.layers.base} label="الصورة الأصلية" />
                  <BinaryMask mask={run.layers.mask} nodata={run.layers.nodata} label={isFire ? "Burned = أبيض" : "Water = أبيض"} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MiniStat label="المساحة المتأثرة" value={`${formatKm2(run.affectedKm2)} km²`} />
                  <MiniStat label="النسبة" value={`${run.affectedPct.toFixed(2)}%`} />
                  <MiniStat label="المساحة الصالحة المحللة" value={`${formatKm2(run.validKm2)} km²`} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link to="/results/$runId" params={{ runId: run.id }}>
                      <BarChart3 /> عرض النتائج الكاملة
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/review/$runId" params={{ runId: run.id }}>
                      <ClipboardCheck /> الانتقال للمراجعة
                    </Link>
                  </Button>
                </div>
              </Panel>
            )}
          </div>

          <div className="space-y-6">
            <Panel title="النموذج المختار" en="Selected model">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                  <Cpu className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="ltr text-start font-semibold">{model}</div>
                  <div className="ltr text-start font-mono text-xs text-muted-foreground">{version}</div>
                  {isFire && <div className="mt-2"><ExperimentalBadge /></div>}
                </div>
              </div>
              <dl className="mt-4">
                <InfoRow label="البنية" value="U-Net (PyTorch)" mono />
                <InfoRow label="حجم المربع" value="256 × 256 px" mono />
                <InfoRow label="عتبة التصنيف" value="0.5" mono />
                <InfoRow label="المخرجات" value={isFire ? "قناع ثنائي: محترق / غير محترق" : "قناع ثنائي: ماء / غير ماء"} />
              </dl>
            </Panel>

            <Panel title="حالة المعالجة" en="Processing status">
              <ol className="space-y-3">
                {STEPS.map((s, i) => {
                  const done = step > i;
                  const active = step === i;
                  return (
                    <li key={s.en} className="flex items-start gap-3 text-sm">
                      {done ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      ) : active ? (
                        <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <div className={cn(!done && !active && "text-muted-foreground")}>
                        <div>{s.ar}</div>
                        <div className="ltr text-start text-[11px] text-muted-foreground">{s.en}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-4 h-1.5 rounded-full bg-secondary">
                <div className="h-1.5 rounded-full bg-primary transition-[width] duration-500" style={{ width: `${Math.max(0, Math.min(step, STEPS.length)) / STEPS.length * 100}%` }} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {step < 0 && "جاهز للتشغيل · Ready"}
                {running && "قيد المعالجة · Processing…"}
                {step >= STEPS.length && "اكتمل التحليل — بانتظار مراجعة المحلل · Completed"}
              </div>
              <Button onClick={start} disabled={running || !selected} size="lg" className="mt-4 w-full">
                {running ? <Loader2 className="animate-spin" /> : <Play className="rtl:rotate-180" />}
                {step >= STEPS.length ? "إعادة تشغيل التحليل" : "تشغيل التحليل · Run Analysis"}
              </Button>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/40 px-3 py-2.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="ltr text-end font-mono text-lg font-semibold">{value}</div>
    </div>
  );
}
