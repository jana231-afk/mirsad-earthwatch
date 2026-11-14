import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, Panel, RoleGate, EmptyState, th, td } from "@/components/mirsad/bits";
import { demoActions, latestReviewedRun, nextId, nowStamp, useDemo } from "@/lib/demo-store";
import { REPORT_TYPE_DESCRIPTIONS, REPORT_TYPE_LABELS, formatDate, type ReportType } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { canViewReport } from "@/lib/demo-rules";

export const Route = createFileRoute("/_console/reports/")({
  validateSearch: (s: Record<string, unknown>): { incident?: string | undefined } => ({
    incident: typeof s["incident"] === "string" ? s["incident"] : undefined,
  }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "التقارير · مِرصاد" },
      { name: "description", content: "تقارير الكارثة وتقارير التطور اليومي بصيغة PDF." },
      { property: "og:title", content: "التقارير · مِرصاد" },
      { property: "og:description", content: "إنشاء ومعاينة وتحميل تقارير التقييم." },
    ],
  }),
  component: () => (<RoleGate allow={["analyst", "responder"]}><Reports /></RoleGate>),
});

function Reports() {
  const search = Route.useSearch();
  const { reports, incidents, runs, role } = useDemo();
  const [type, setType] = useState<"all" | ReportType>("all");
  const [open, setOpen] = useState(false);
  useEffect(() => { if (search.incident && role === "analyst") setOpen(true); }, [search.incident, role]);
  const rows = reports
    .filter((r) => type === "all" || r.type === type)
    .filter((r) => canViewReport(role, r, incidents, runs));
  return (
    <>
      <PageHeader title="التقارير" description="تقارير PDF للتحليلات التي تمت مراجعتها."
        actions={<>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="field w-48" aria-label="نوع التقرير">
            <option value="all">كل الأنواع</option><option value="disaster">تقرير الكارثة</option><option value="progress">تقرير التطور اليومي</option>
          </select>
          {role === "analyst" && <Button onClick={() => setOpen(true)}><Plus /> إنشاء تقرير</Button>}
        </>} />
      <Panel bodyClassName="p-0">
        {rows.length === 0 ? <div className="p-5"><EmptyState title="لا توجد تقارير" /></div> : (
          <div className="overflow-x-auto"><table className="w-full">
            <thead className="border-b bg-muted/50"><tr>{["رقم التقرير", "نوع التقرير", "الحالة", "الأيام المشمولة", "تاريخ الإنشاء", "أنشأه", ""].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {rows.map((r) => {
                const inc = incidents.find((i) => i.id === r.incidentId);
                const imgsDates = r.imageIds.length;
                return (
                  <tr key={r.id} className="hover:bg-muted/40">
                    <td className={`${td} ltr text-start font-mono text-xs`}>{r.id}</td>
                    <td className={td}><Badge variant={r.type === "progress" ? "processing" : "active"}>{REPORT_TYPE_LABELS[r.type]}</Badge></td>
                    <td className={`${td} font-medium`}>{inc?.name}</td>
                    <td className={td}>{imgsDates === 1 ? "يوم واحد" : `${imgsDates} أيام`}</td>
                    <td className={`${td} whitespace-nowrap`}>{formatDate(r.createdAt)}</td>
                    <td className={td}>{r.createdBy}</td>
                    <td className={`${td} text-end`}><div className="inline-flex gap-1.5">
                      <Button asChild size="sm" variant="outline"><Link to="/reports/$reportId" params={{ reportId: r.id }}><FileText /> معاينة</Link></Button>
                      <Button asChild size="sm" variant="soft"><Link to="/reports/$reportId" params={{ reportId: r.id }} search={{ download: true }}><Download /> تحميل PDF</Link></Button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </Panel>
      {role === "analyst" && <CreateDialog open={open} onOpenChange={setOpen} initialIncident={search.incident} />}
    </>
  );
}

function CreateDialog({ open, onOpenChange, initialIncident }: { open: boolean; onOpenChange: (o: boolean) => void; initialIncident?: string | undefined }) {
  const navigate = useNavigate();
  const { incidents, runs, reports, userName } = useDemo();
  const eligible = incidents.filter((i) => latestReviewedRun(runs, i.id));
  const [type, setType] = useState<ReportType>("disaster");
  const [incId, setIncId] = useState(initialIncident && eligible.some((i) => i.id === initialIncident) ? initialIncident : eligible[0]?.id ?? "");
  const reviewedRuns = runs.filter((r) => r.incidentId === incId && r.status === "reviewed");
  const [runId, setRunId] = useState("");
  const run = reviewedRuns.find((r) => r.id === runId) ?? reviewedRuns[0];
  const [sel, setSel] = useState<string[]>([]);
  useEffect(() => { if (initialIncident && eligible.some((i) => i.id === initialIncident)) setIncId(initialIncident); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [initialIncident]);
  useEffect(() => { const last = run?.days.at(-1); setSel(run ? (type === "disaster" ? (last ? [last.imageId] : []) : run.days.map((d) => d.imageId)) : []); }, [run?.id, type]); // eslint-disable-line react-hooks/exhaustive-deps
  const min = type === "progress" ? 2 : 1;
  const ok = !!run && sel.length >= min;
  const create = () => {
    if (!run || !ok) return;
    const id = nextId("RPT", reports);
    demoActions.addReport({ id, type, incidentId: incId, runId: run.id, imageIds: run.days.filter((d) => sel.includes(d.imageId)).map((d) => d.imageId), createdAt: nowStamp(), createdBy: userName });
    onOpenChange(false);
    navigate({ to: "/reports/$reportId", params: { reportId: id }, search: {} });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-2xl">
        <DialogHeader><DialogTitle className="text-start">إنشاء تقرير</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-sm font-medium">1. نوع التقرير</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["disaster", "progress"] as ReportType[]).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)} className={cn("rounded-md border p-4 text-start", type === t ? "border-primary bg-primary-soft" : "hover:bg-muted")}>
                  <div className="font-semibold">{REPORT_TYPE_LABELS[t]}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{REPORT_TYPE_DESCRIPTIONS[t]}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm"><span className="font-medium">2. الحالة</span>
              <select className="field" value={incId} onChange={(e) => { setIncId(e.target.value); setRunId(""); }}>{eligible.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
            </label>
            <label className="space-y-1.5 text-sm"><span className="font-medium">التحليل المراجَع</span>
              <select className="field" value={run?.id ?? ""} onChange={(e) => setRunId(e.target.value)}>{reviewedRuns.map((r) => <option key={r.id} value={r.id}>{r.id} – {r.days.length} صور</option>)}</select>
            </label>
          </div>
          {run && (
            <div>
              <div className="mb-2 text-sm font-medium">3. الصور / التواريخ المشمولة</div>
              <div className="flex flex-wrap gap-2">
                {run.days.map((d) => (
                  <label key={d.imageId} className={cn("flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm", sel.includes(d.imageId) && "border-primary bg-primary-soft")}>
                    <input type="checkbox" className="accent-primary" checked={sel.includes(d.imageId)} onChange={() => setSel((s) => s.includes(d.imageId) ? s.filter((x) => x !== d.imageId) : [...s, d.imageId])} />
                    {formatDate(d.date)}
                  </label>
                ))}
              </div>
              {type === "progress" && run.days.length < 2 && <p className="mt-2 text-xs text-destructive">يتطلب تقرير التطور اليومي تحليلاً يضم صورتين على الأقل.</p>}
              {!ok && run.days.length >= min && <p className="mt-2 text-xs text-muted-foreground">اختر {min === 2 ? "تاريخين" : "تاريخاً"} على الأقل.</p>}
            </div>
          )}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button disabled={!ok} onClick={create}><FileText /> إنشاء ومعاينة</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
