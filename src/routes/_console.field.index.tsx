import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, RoleGate, TypeBadge, IncidentStatusBadge, Notice, EmptyState } from "@/components/mirsad/bits";
import { ImageThumb } from "@/components/mirsad/MapViewer";
import { latestReviewedRun, useDemo } from "@/lib/demo-store";
import { formatKm2 } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/field/")({
  head: () => ({
    meta: [
      { title: "الحوادث المصرح بها · MIRSAD" },
      { name: "description", content: "Read-only list of incidents authorized for field responders, with reviewed analysis results." },
      { property: "og:title", content: "Authorized Incidents · MIRSAD" },
      { property: "og:description", content: "Field responder view of reviewed disaster assessments." },
    ],
  }),
  component: () => (
    <RoleGate allow={["responder"]}>
      <FieldList />
    </RoleGate>
  ),
});

function FieldList() {
  const { incidents, runs } = useDemo();
  const list = incidents.filter((i) => i.sharedWithResponders);
  return (
    <>
      <PageHeader title="الحوادث المصرح بها" en="Authorized Incidents" description="تعرض هذه الصفحة النتائج التي راجعها واعتمدها محللو نظم المعلومات الجغرافية فقط." />
      <div className="mb-6">
        <Notice tone="info" icon={<Lock className="h-4 w-4" />}>
          وضع القراءة فقط · Read-only — لا يمكن رفع الصور أو تشغيل النماذج أو تعديل النتائج من هذا الحساب.
        </Notice>
      </div>
      {list.length === 0 ? (
        <EmptyState title="لا توجد حوادث مصرح بها حالياً" />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((i) => {
            const run = latestReviewedRun(runs, i.id);
            return (
              <div key={i.id} className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-card">
                {run ? (
                  <ImageThumb src={run.layers.base} className="rounded-none border-0 border-b" />
                ) : (
                  <div className="grid aspect-[4/3] place-items-center border-b bg-muted text-sm text-muted-foreground">لا توجد نتيجة معتمدة</div>
                )}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <div className="font-semibold">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.location} · <span className="ltr font-mono">{i.date}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <TypeBadge type={i.type} />
                    <IncidentStatusBadge status={i.status} />
                  </div>
                  {run && (
                    <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                      <span className="text-muted-foreground">المساحة المتأثرة: </span>
                      <span className="ltr font-mono font-semibold">{formatKm2(run.affectedKm2)} km² · {run.affectedPct.toFixed(2)}%</span>
                    </div>
                  )}
                  <Button asChild variant="outline" className="mt-auto">
                    <Link to="/field/$id" params={{ id: i.id }}>
                      <Eye /> عرض التفاصيل
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
