import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleGate, EmptyState, Notice } from "@/components/mirsad/bits";
import { LogoMark } from "@/components/mirsad/Logo";
import { MapViewer, MapLegend } from "@/components/mirsad/MapViewer";
import { AREA_DISCLAIMER } from "@/components/mirsad/RunSummary";
import { ComparisonChart, ComparisonTable, comparisonSummary } from "@/components/mirsad/DailyComparison";
import { useDemo } from "@/lib/demo-store";
import { canViewReport } from "@/lib/demo-rules";
import {
  LIMITATIONS, METHODOLOGY, REPORT_TYPE_LABELS, RUN_STATUS_LABELS, TYPE_LABELS, INCIDENT_STATUS_LABELS,
  dayLabel, formatDate, formatKm2, formatPct, formatRange, incidentStatus, type DayResult,
} from "@/lib/demo-data";

export const Route = createFileRoute("/_console/reports/$reportId")({
  validateSearch: (s: Record<string, unknown>): { download?: boolean | undefined } => ({
    download: s["download"] === true || s["download"] === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "معاينة التقرير · مِرصاد" },
      { name: "description", content: "معاينة تقرير التقييم قبل تحميله بصيغة PDF." },
      { property: "og:title", content: "معاينة التقرير · مِرصاد" },
      { property: "og:description", content: "تقرير الكارثة أو تقرير التطور اليومي." },
    ],
  }),
  component: () => (<RoleGate allow={["analyst", "responder"]}><ReportPage /></RoleGate>),
});

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-8 border-b-2 border-primary pb-1.5 text-base font-bold">{children}</h2>;
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <tr className="border-b"><td className="w-48 bg-muted/50 px-3 py-2 text-muted-foreground">{k}</td><td className="px-3 py-2 font-medium">{v}</td></tr>;
}

function ReportPage() {
  const { reportId } = Route.useParams();
  const { download } = Route.useSearch();
  const { reports, runs, incidents, images, role } = useDemo();
  const rep = reports.find((r) => r.id === reportId);
  const run = rep && runs.find((r) => r.id === rep.runId);
  const inc = rep && incidents.find((i) => i.id === rep.incidentId);
  const accessible = rep ? canViewReport(role, rep, incidents, runs) : false;
  useEffect(() => {
    if (download && accessible) { const t = setTimeout(() => window.print(), 400); return () => clearTimeout(t); }
    return undefined;
  }, [download, accessible]);
  if (!rep || !run || !inc) return <EmptyState title="التقرير غير موجود" />;
  if (!accessible) return <EmptyState title="التقرير غير متاح">يتطلب التقرير حالة مصرحاً بها ونتيجة تمت مراجعتها.</EmptyState>;
  const days: DayResult[] = run.days.filter((d) => rep.imageIds.includes(d.imageId));
  const last = days.at(-1);
  if (!last) return <EmptyState title="لا توجد صور مشمولة في التقرير" />;
  const imgs = images.filter((m) => run.imageIds.includes(m.id) && (rep.imageIds.includes(m.id) || m.imageRole === "pre"));

  return (
    <>
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost"><Link to="/reports" search={{}}><ArrowRight /> العودة إلى التقارير</Link></Button>
        <Button onClick={() => window.print()}><Download /> تحميل PDF</Button>
      </div>
      <article className="print-sheet mx-auto max-w-[860px] rounded-lg border bg-card p-4 sm:p-10 shadow-panel">
        <header className="flex items-start justify-between gap-4 border-b pb-5">
          <div className="flex items-center gap-3">
            <LogoMark className="h-12 w-12" />
            <div><div className="text-lg font-bold">مِرصاد – نظام رسم وتقييم الكوارث</div><div className="text-sm text-muted-foreground">{REPORT_TYPE_LABELS[rep.type]}</div></div>
          </div>
          <div className="text-end text-xs text-muted-foreground">
            <div>رقم التقرير: <span className="ltr font-mono">{rep.id}</span></div>
            <div>تاريخ الإصدار: {formatDate(rep.createdAt)}</div>
            <div>بيانات تجريبية</div>
          </div>
        </header>
        <h1 className="mt-6 text-2xl font-bold">{REPORT_TYPE_LABELS[rep.type]}: {inc.name}</h1>

        <H>بيانات الحالة</H>
        <table className="w-full border text-sm"><tbody>
          <Row k="نوع الكارثة" v={TYPE_LABELS[inc.type]} />
          <Row k="الموقع" v={`${inc.location} – ${inc.region}`} />
          <Row k="فترة الحالة (من – إلى)" v={formatRange(inc.startDate, inc.endDate)} />
          <Row k="الحالة" v={INCIDENT_STATUS_LABELS[incidentStatus(inc, images)]} />
        </tbody></table>

        {rep.type === "disaster" ? (
          <>
            <H>معلومات الصور</H>
            <table className="w-full border text-xs"><thead className="bg-muted/50"><tr>{["الملف", "التاريخ", "النوع", "CRS", "الأبعاد", "النطاقات", "NoData"].map((h) => <th key={h} className="px-2 py-2 text-start">{h}</th>)}</tr></thead>
              <tbody>{imgs.map((m) => <tr key={m.id} className="border-t"><td className="ltr px-2 py-2 text-start font-mono">{m.fileName}</td><td className="px-2 py-2">{formatDate(m.acquisitionDate)}</td><td className="px-2 py-2">{m.sensor}</td><td className="ltr px-2 py-2 text-start">{m.crs}</td><td className="ltr px-2 py-2 text-start">{m.width}×{m.height}</td><td className="px-2 py-2">{m.bands}</td><td className="px-2 py-2">{m.nodata}</td></tr>)}</tbody>
            </table>
            <H>خريطة التحليل – {formatDate(last.date)}</H>
            <MapViewer {...last.layers} kind={inc.type} showControls={false} showLayerPanel={false} showLegend={false} />
            <MapLegend kind={inc.type} hasNodata={!!last.layers.nodata} className="mt-3 flex flex-wrap gap-x-6 space-y-0" />
            <H>النتائج</H>
            <table className="w-full border text-sm"><tbody>
              <Row k="المساحة المتأثرة" v={<span className="ltr font-mono">{formatKm2(last.affectedKm2)} km²</span>} />
              <Row k="النسبة المئوية" v={<span className="ltr font-mono">{formatPct(last.affectedPct)}</span>} />
              <Row k="المساحة المحللة الصالحة" v={<span className="ltr font-mono">{formatKm2(last.validKm2)} km²</span>} />
            </tbody></table>
          </>
        ) : (
          <>
            {days.map((d, i) => (
              <section key={d.imageId} className="break-inside-avoid">
                <H>{dayLabel(i)} – {formatDate(d.date)}</H>
                <div className="grid grid-cols-[1fr_200px] gap-4">
                  <MapViewer {...d.layers} kind={inc.type} showControls={false} showLayerPanel={false} showLegend={false} />
                  <div className="space-y-3 text-sm">
                    <div className="rounded border p-3"><div className="text-xs text-muted-foreground">المساحة المتأثرة</div><div className="ltr text-end font-mono text-lg font-semibold">{formatKm2(d.affectedKm2)} km²</div></div>
                    <div className="rounded border p-3"><div className="text-xs text-muted-foreground">النسبة المئوية</div><div className="ltr text-end font-mono text-lg font-semibold">{formatPct(d.affectedPct)}</div></div>
                  </div>
                </div>
              </section>
            ))}
            <H>المقارنة بين الأيام</H>
            <ComparisonChart days={days} kind={inc.type} />
            <div className="mt-4"><ComparisonTable days={days} compact /></div>
            <H>ملخص التطور</H>
            <p className="text-sm leading-relaxed">{comparisonSummary(days, inc.type)}</p>
          </>
        )}

        <H>معلومات النموذج والمراجعة</H>
        <table className="w-full border text-sm"><tbody>
          <Row k="النموذج" v={<>{run.model} <span className="ltr">{run.modelVersion}</span>{run.experimental && " (تجريبي – قيد التحقق)"}</>} />
          <Row k="تاريخ التحليل" v={formatDate(run.startedAt)} />
          <Row k="حالة المراجعة" v={RUN_STATUS_LABELS[run.status]} />
          <Row k="المراجع" v={`${run.reviewer ?? "—"}${run.reviewedAt ? ` – ${formatDate(run.reviewedAt)}` : ""}`} />
          {run.reviewNotes && <Row k="ملاحظات المراجعة" v={run.reviewNotes} />}
        </tbody></table>

        <H>المنهجية</H>
        <p className="text-sm leading-relaxed text-muted-foreground">{METHODOLOGY}</p>
        <H>القيود</H>
        <ul className="list-disc space-y-1 ps-5 text-sm text-muted-foreground">{LIMITATIONS.map((l) => <li key={l}>{l}</li>)}</ul>
        <div className="mt-6"><Notice>{AREA_DISCLAIMER}</Notice></div>
        <footer className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground">بيانات تجريبية – مشروع تخرج 2026 · مِرصاد</footer>
      </article>
    </>
  );
}
