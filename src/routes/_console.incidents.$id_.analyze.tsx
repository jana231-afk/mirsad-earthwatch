import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Play, Cpu, CheckCircle2, Loader2, Clock, Eye, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader, Panel, RoleGate, EmptyState, ExperimentalBadge, Notice, TypeBadge } from "@/components/mirsad/bits";
import { BinaryMask } from "@/components/mirsad/MapViewer";
import { demoActions, incidentImages, nextId, nowStamp, useDemo } from "@/lib/demo-store";
import { FIRE_MODEL, FLOOD_MODEL, IMAGE_ROLE_LABELS, formatDate, formatPct, simulateDays, type DayResult, type GeoImage } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { canAnalyzeImages } from "@/lib/demo-rules";

export const Route = createFileRoute("/_console/incidents/$id_/analyze")({
  head: () => ({
    meta: [
      { title: "تحليل الكارثة · مِرصاد" },
      { name: "description", content: "اختيار صور الحالة وتشغيل نموذج التقسيم الآلي للفيضانات أو المناطق المحروقة." },
      { property: "og:title", content: "تحليل الكارثة · مِرصاد" },
      { property: "og:description", content: "تشغيل التحليل الآلي على صورة أو عدة صور." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <AnalyzePage />
    </RoleGate>
  ),
});

type Phase = "idle" | "running" | "done";

function AnalyzePage() {
  const { id } = Route.useParams();
  const { incidents, images, runs, userName } = useDemo();
  const inc = incidents.find((i) => i.id === id);
  const imgs = incidentImages(images, id);
  const isFire = inc?.type === "fire";

  const [selected, setSelected] = useState<string[]>(() => (isFire ? [] : imgs.map((m) => m.id)));
  const [pre, setPre] = useState(() => imgs.find((m) => m.imageRole === "pre")?.id ?? "");
  const [post, setPost] = useState(() => imgs.find((m) => m.imageRole === "post")?.id ?? "");
  const [later, setLater] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ runId: string; days: DayResult[] } | null>(null);

  const toAnalyse: GeoImage[] = isFire
    ? imgs.filter((m) => m.id === pre || m.id === post || later.includes(m.id))
    : imgs.filter((m) => selected.includes(m.id));
  const steps = isFire ? toAnalyse.filter((m) => m.id !== pre).length : toAnalyse.length;

  useEffect(() => {
    if (phase !== "running" || !inc) return;
    if (progress >= steps) {
      const days = simulateDays(inc.type, toAnalyse.map((image) => isFire ? { ...image, imageRole: image.id === pre ? "pre" : image.id === post ? "post" : "later" } : image));
      const runId = nextId("RUN", runs);
      demoActions.addRun({
        id: runId,
        incidentId: id,
        imageIds: toAnalyse.map((m) => m.id),
        model: isFire ? FIRE_MODEL : FLOOD_MODEL,
        modelVersion: isFire ? "v0.3.0" : "v1.2.0",
        experimental: isFire,
        startedAt: nowStamp(),
        durationSec: steps * 92,
        status: "pending",
        days,
        runBy: userName,
      });
      setResult({ runId, days });
      setPhase("done");
      toast.success("اكتمل التحليل وهو بانتظار المراجعة");
      return;
    }
    const t = setTimeout(() => setProgress((p) => p + 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, progress]);

  if (!inc) return <EmptyState title="الحالة غير موجودة" />;

  const canRun = canAnalyzeImages(inc.type, toAnalyse, pre, post);
  const start = () => {
    if (!canRun) return;
    setProgress(0);
    setResult(null);
    setPhase("running");
  };
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const crumbs = [{ label: "الحالات", to: "/incidents" }, { label: inc.name, to: "/incidents/$id", params: { id } }, { label: "تحليل" }];

  if (imgs.length === 0)
    return (
      <>
        <PageHeader title="تحليل الكارثة" crumbs={crumbs} />
        <EmptyState title="لا توجد صور لهذه الحالة">
          <Link to="/upload" search={{ incident: id }} className="text-primary hover:underline">ارفع صورة أولاً</Link>
        </EmptyState>
      </>
    );

  const processingList = isFire ? toAnalyse.filter((m) => m.id !== pre) : toAnalyse;

  return (
    <>
      <PageHeader title="تحليل الكارثة" crumbs={crumbs} description={<span className="flex items-center gap-2">{inc.name} <TypeBadge type={inc.type} /></span>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Panel title={isFire ? "اختيار الصور (قبل الحدث وبعده)" : "اختيار الصور (صورة أو أكثر، مرتبة حسب التاريخ)"}>
            {isFire ? (
              <div className="space-y-5">
                <ImagePick label="صورة قبل الحدث (مطلوبة)" imgs={imgs.filter((m) => m.imageRole === "pre")} value={pre} onChange={setPre} disabled={phase === "running"} />
                <ImagePick label="صورة بعد الحدث (مطلوبة)" imgs={imgs.filter((m) => m.imageRole === "post")} value={post} onChange={setPost} disabled={phase === "running"} />
                <div>
                  <div className="mb-2 text-sm font-medium">صور لاحقة إضافية (اختياري)</div>
                  <ImageChecklist imgs={imgs.filter((m) => m.imageRole === "later")} selected={later} onToggle={(v) => setLater(toggle(later, v))} disabled={phase === "running"} />
                </div>
              </div>
            ) : (
              <ImageChecklist imgs={imgs} selected={selected} onToggle={(v) => setSelected(toggle(selected, v))} disabled={phase === "running"} />
            )}
          </Panel>

          {phase !== "idle" && (
            <Panel title="حالة المعالجة">
              <Progress value={(Math.min(progress, steps) / Math.max(steps, 1)) * 100} className="mb-4" />
              <ul className="space-y-2">
                {processingList.map((m, i) => {
                  const st = phase === "done" || i < progress ? "done" : i === progress ? "run" : "wait";
                  return (
                    <li key={m.id} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
                      {st === "done" ? <CheckCircle2 className="h-4 w-4 text-success" /> : st === "run" ? <Loader2 className="h-4 w-4 animate-spin text-info" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                      <span>صورة {formatDate(m.acquisitionDate)}</span>
                      <span className="ms-auto text-xs text-muted-foreground">{st === "done" ? "مكتمل" : st === "run" ? "قيد المعالجة" : "في الانتظار"}</span>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}

          {result && (
            <Panel
              title={isFire ? "قناع المناطق المحروقة لكل صورة" : "قناع المياه لكل صورة"}
              actions={<Button asChild size="sm"><Link to="/results/$runId" params={{ runId: result.runId }}><Eye /> عرض النتائج</Link></Button>}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.days.map((d) => (
                  <div key={d.imageId}>
                    <BinaryMask mask={d.layers.mask} nodata={d.layers.nodata} label={formatDate(d.date)} />
                    <div className="mt-1.5 text-center text-xs text-muted-foreground">النسبة المتأثرة <span className="ltr font-mono font-semibold text-foreground">{formatPct(d.affectedPct)}</span></div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel title="النموذج">
            <div className="flex items-start gap-3">
              <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-md", isFire ? "bg-burn-soft text-burn" : "bg-water-soft text-water")}><Cpu className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">{isFire ? FIRE_MODEL : FLOOD_MODEL}</div>
                <div className="ltr text-start text-xs text-muted-foreground">{isFire ? "v0.3.0" : "v1.2.0"}</div>
                {isFire && <div className="mt-2"><ExperimentalBadge /></div>}
              </div>
            </div>
            <Button className="mt-5 w-full" size="lg" disabled={!canRun || phase === "running"} onClick={start}>
              {phase === "running" ? <Loader2 className="animate-spin" /> : <Play className="rtl:rotate-180" />} تشغيل التحليل
            </Button>
            {!canRun && <p className="mt-2 text-xs text-muted-foreground">{isFire ? "اختر صورة قبل الحدث ثم صورة بتاريخ أحدث بعده، والصور اللاحقة بعد تاريخها." : "اختر صورة صالحة واحدة على الأقل."}</p>}
          </Panel>
          <Notice tone="info" icon={<Info className="h-4 w-4" />}>
            {isFire
              ? "يحدد النموذج المناطق المحروقة بمقارنة صورة ما قبل الحدث بالصور اللاحقة، ولا يكشف اللهب النشط ولا يتنبأ بانتشار الحريق."
              : "يحدد النموذج المياه في كل صورة على حدة، ولا يقدّر عمق المياه ولا يتنبأ بالفيضانات."}
          </Notice>
        </div>
      </div>
    </>
  );
}

function ImagePick({ label, imgs, value, onChange, disabled }: { label: string; imgs: GeoImage[]; value: string; onChange: (v: string) => void; disabled: boolean }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="field">
        <option value="">— اختر صورة —</option>
        {imgs.map((m) => (
          <option key={m.id} value={m.id}>{formatDate(m.acquisitionDate)} – {IMAGE_ROLE_LABELS[m.imageRole]} – {m.fileName}</option>
        ))}
      </select>
    </label>
  );
}

function ImageChecklist({ imgs, selected, onToggle, disabled }: { imgs: GeoImage[]; selected: string[]; onToggle: (id: string) => void; disabled: boolean }) {
  if (imgs.length === 0) return <p className="text-sm text-muted-foreground">لا توجد صور إضافية.</p>;
  return (
    <ul className="space-y-2">
      {imgs.map((m) => (
        <li key={m.id}>
          <label className={cn("flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm", selected.includes(m.id) && "border-primary bg-primary-soft")}>
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={selected.includes(m.id)} disabled={disabled} onChange={() => onToggle(m.id)} />
            <img src={m.preview} alt="" className="h-10 w-14 rounded object-cover" />
            <span className="flex-1">
              <span className="block font-medium">{formatDate(m.acquisitionDate)}</span>
              <span className="ltr block text-start font-mono text-xs text-muted-foreground">{m.fileName}</span>
            </span>
            <span className="text-xs text-muted-foreground">{m.sensor}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
