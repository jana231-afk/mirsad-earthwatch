import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleGate, EmptyState, Notice } from "@/components/mirsad/bits";
import { LogoMark } from "@/components/mirsad/Logo";
import { MapViewer, MapLegend } from "@/components/mirsad/MapViewer";
import { AREA_DISCLAIMER } from "@/components/mirsad/RunSummary";
import { useDemo } from "@/lib/demo-store";
import { RUN_STATUS_LABELS, TYPE_LABELS, formatKm2 } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/reports/$runId")({
  validateSearch: (s: Record<string, unknown>): { download?: boolean } => ({
    download: s.download === true || s.download === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "معاينة التقرير · MIRSAD" },
      { name: "description", content: "Preview of the MIRSAD PDF disaster assessment report with map, affected area and methodology." },
      { property: "og:title", content: "Assessment Report · MIRSAD" },
      { property: "og:description", content: "PDF report preview for a reviewed analysis." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst", "responder"]}>
      <ReportPage />
    </RoleGate>
  ),
});

function ReportPage() {
  const { runId } = Route.useParams();
  const { download } = Route.useSearch();
  const { runs, incidents, images, role } = useDemo();
  const run = runs.find((r) => r.id === runId);
  const inc = run && incidents.find((i) => i.id === run.incidentId);
  const reviewed = run?.status === "reviewed";

  useEffect(() => {
    if (download && reviewed) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [download, reviewed]);

  if (!run || !inc) return <EmptyState title="التقرير غير موجود" />;
  if (role === "responder" && (!reviewed || !inc.sharedWithResponders))
    return <EmptyState title="التقرير غير متاح">لا تتوفر نتيجة معتمدة لهذه الحادثة.</EmptyState>;

  const runImages = images.filter((m) => run.imageIds.includes(m.id));
  const post = runImages.find((m) => m.imageRole !== "pre-event") ?? runImages[0];
  const pre = runImages.find((m) => m.imageRole === "pre-event");
  const generated = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">معاينة التقرير <span className="ltr ms-2 text-sm font-medium text-muted-foreground">PDF Report Preview</span></h1>
          <p className="text-sm text-muted-foreground">يُنشأ ملف PDF في النظام الفعلي بواسطة ReportLab على الخادم.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            {role === "responder" ? (
              <Link to="/field/$id" params={{ id: inc.id }}><ArrowRight /> رجوع</Link>
            ) : (
              <Link to="/reports"><ArrowRight /> كل التقارير</Link>
            )}
          </Button>
          <Button onClick={() => window.print()} disabled={!reviewed} size="lg">
            <Download /> تنزيل PDF · Download
          </Button>
        </div>
      </div>
      {!reviewed && (
        <div className="no-print mb-5">
          <Notice tone="warning" title="مسودة غير معتمدة">لا يمكن تنزيل التقرير قبل اعتماد التحليل من المحلل.</Notice>
        </div>
      )}

      <article className="print-sheet relative mx-auto max-w-[860px] overflow-hidden rounded-lg border bg-card p-10 shadow-panel">
        {!reviewed && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="-rotate-12 text-7xl font-black tracking-widest text-destructive/10">مسودة · DRAFT</span>
          </div>
        )}

        <header className="flex items-start justify-between gap-6 border-b-2 border-navy pb-5">
          <div className="flex items-center gap-3">
            <LogoMark className="h-12 w-12" />
            <div>
              <div className="text-xl font-bold">مِرصاد <span className="ltr text-sm tracking-[0.2em] text-muted-foreground">MIRSAD</span></div>
              <div className="text-xs text-muted-foreground">نظام رسم وتقييم الكوارث بالذكاء الاصطناعي</div>
            </div>
          </div>
          <div className="text-end text-xs">
            <div className="text-base font-bold">تقرير تقييم الكارثة</div>
            <div className="ltr text-muted-foreground">Disaster Assessment Report</div>
            <div className="mt-2 font-mono">RPT-{run.id.slice(4)}</div>
            <div className="text-muted-foreground">تاريخ الإنشاء: <span className="ltr font-mono">{generated}</span></div>
          </div>
        </header>

        <Section n="1" title="بيانات الحادثة" en="Incident details">
          <Grid
            rows={[
              ["اسم الحادثة", inc.name],
              ["رقم الحادثة", inc.id],
              ["نوع الحادثة", `${TYPE_LABELS[inc.type].ar} · ${TYPE_LABELS[inc.type].en}`],
              ["الموقع", inc.location + (inc.region ? ` — ${inc.region}` : "")],
              ["تاريخ الحادثة", inc.date],
              ["حالة الحادثة", inc.status === "open" ? "مفتوحة" : "مغلقة"],
            ]}
          />
        </Section>

        <Section n="2" title="معلومات صورة القمر الصناعي" en="Satellite image information">
          {post && (
            <Grid
              rows={[
                ["اسم الملف", post.fileName],
                ["المستشعر", post.sensor],
                ["تاريخ الالتقاط", `${post.acquisitionDate}${post.acquisitionDateSource === "manual" ? " (مُدخل يدوياً)" : ""}`],
                ["نظام الإحداثيات", post.crs],
                ["الدقة المكانية", post.resolution],
                ["عدد النطاقات", String(post.bands)],
                ...(pre ? ([["صورة قبل الحدث", `${pre.fileName} (${pre.acquisitionDate})`]] as [string, string][]) : []),
              ]}
            />
          )}
        </Section>

        <Section n="3" title="خريطة التحليل" en="Analysis map">
          <MapViewer base={run.layers.base} mask={run.layers.mask} nodata={run.layers.nodata} kind={inc.type} showControls={false} showLegend={false} showLayerPanel={false} />
          <MapLegend kind={inc.type} hasNodata={!!run.layers.nodata} className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 space-y-0" />
        </Section>

        <Section n="4" title="نتائج المساحة" en="Area results">
          <div className="grid grid-cols-4 gap-3">
            <Big label="المساحة المتأثرة" value={formatKm2(run.affectedKm2)} unit="km²" />
            <Big label="نسبة المساحة المتأثرة" value={run.affectedPct.toFixed(2)} unit="%" />
            <Big label="المساحة الصالحة المحللة" value={formatKm2(run.validKm2)} unit="km²" />
            <Big label="مساحة NoData" value={formatKm2(run.nodataKm2)} unit="km²" />
          </div>
        </Section>

        <div className="grid grid-cols-2 gap-6">
          <Section n="5" title="معلومات النموذج" en="Model information">
            <Grid
              cols={1}
              rows={[
                ["اسم النموذج", run.model],
                ["الإصدار", run.modelVersion + (run.experimental ? " — تجريبي" : "")],
                ["تاريخ التحليل", run.startedAt],
              ]}
            />
          </Section>
          <Section n="6" title="حالة مراجعة المحلل" en="Analyst review status">
            <Grid
              cols={1}
              rows={[
                ["الحالة", RUN_STATUS_LABELS[run.status].ar],
                ["المراجع", run.reviewer ?? "—"],
                ["تاريخ المراجعة", run.reviewedAt ?? "—"],
              ]}
            />
            {run.reviewNotes && <p className="mt-2 rounded bg-muted/60 p-2.5 text-xs leading-relaxed">{run.reviewNotes}</p>}
          </Section>
        </div>

        <Section n="7" title="المنهجية والقيود" en="Methodology & limitations">
          <ul className="list-disc space-y-1.5 ps-5 text-xs leading-relaxed text-foreground/85">
            <li>رُفعت الصورة يدوياً بصيغة GeoTIFF وتم التحقق من نظام الإحداثيات والأبعاد والنطاقات وقيم NoData.</li>
            <li>قُسمت الصورة إلى مربعات 256×256 بكسل وطُبّق نموذج {run.model} (U-Net) لإنتاج قناع ثنائي.</li>
            <li>حُسبت المساحة بضرب عدد البكسلات المصنفة في مساحة البكسل وفق دقة الصورة، مع استبعاد بكسلات NoData.</li>
            <li>{AREA_DISCLAIMER}</li>
            <li>لا يقدّر النظام عمق المياه أو أضرار المباني أو أعداد السكان المتأثرين، ولا يتنبأ بالكوارث.</li>
            <li>قد تتأثر الدقة بالسحب والظلال وجودة الصورة وتاريخ التقاطها مقارنة بذروة الحدث.</li>
            {run.experimental && <li>نموذج المناطق المحترقة تجريبي ولم يتم التحقق من مسار بياناته بشكل كامل بعد.</li>}
          </ul>
        </Section>

        <footer className="mt-8 flex justify-between border-t pt-4 text-[10px] text-muted-foreground">
          <span>تم إنشاء هذا التقرير بواسطة نظام مرصاد — مشروع تخرج · بيانات تجريبية</span>
          <span className="ltr font-mono">Generated {generated} · Page 1/1</span>
        </footer>
      </article>
    </>
  );
}

function Section({ n, title, en, children }: { n: string; title: string; en: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 break-inside-avoid">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy">
        <span className="grid h-5 w-5 place-items-center rounded bg-navy font-mono text-[11px] text-navy-foreground">{n}</span>
        {title}
        <span className="ltr text-[11px] font-normal text-muted-foreground">{en}</span>
      </h3>
      {children}
    </section>
  );
}

function Grid({ rows, cols = 2 }: { rows: [string, string][]; cols?: 1 | 2 }) {
  return (
    <dl className={`grid gap-x-6 text-xs ${cols === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 border-b border-dashed py-1.5">
          <dt className="shrink-0 text-muted-foreground">{k}</dt>
          <dd className="min-w-0 truncate text-end font-medium" title={v}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Big({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded border bg-muted/40 p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="ltr mt-1 text-end font-mono text-lg font-semibold">
        {value} <span className="text-[11px] font-normal text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
