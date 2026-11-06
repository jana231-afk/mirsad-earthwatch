import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, Panel, RoleGate } from "@/components/mirsad/bits";
import { IncidentForm } from "@/components/mirsad/IncidentForm";
import { demoActions, useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/_console/incidents/new")({
  head: () => ({
    meta: [
      { title: "إنشاء حادثة جديدة · MIRSAD" },
      { name: "description", content: "Create a new flood or fire incident record in MIRSAD." },
      { property: "og:title", content: "New Incident · MIRSAD" },
      { property: "og:description", content: "Register a flood or fire incident before uploading satellite images." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <NewIncident />
    </RoleGate>
  ),
});

function NewIncident() {
  const navigate = useNavigate();
  const { incidents, userName } = useDemo();
  return (
    <>
      <PageHeader
        title="إنشاء حادثة جديدة"
        en="Create New Incident"
        crumbs={[{ label: "الحوادث", to: "/incidents" }, { label: "حادثة جديدة" }]}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,720px)_1fr]">
        <Panel title="بيانات الحادثة" en="Incident information">
          <IncidentForm
            onCancel={() => navigate({ to: "/incidents" })}
            onSubmit={(v) => {
              const n = Math.max(...incidents.map((i) => Number(i.id.split("-")[2]))) + 1;
              const id = `INC-2026-${String(n).padStart(3, "0")}`;
              demoActions.addIncident({
                id,
                name: v.name.trim(),
                nameEn: "",
                type: v.type,
                location: v.location.trim(),
                region: "",
                date: v.date,
                status: "open",
                description: v.description.trim(),
                createdBy: userName,
                sharedWithResponders: v.sharedWithResponders,
              });
              toast.success("تم حفظ الحادثة", { description: id });
              navigate({ to: "/incidents/$id", params: { id } });
            }}
          />
        </Panel>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-lg border bg-card p-5 shadow-card">
            <div className="mb-2 font-semibold text-foreground">الخطوات التالية</div>
            <ol className="list-decimal space-y-1.5 ps-5">
              <li>رفع صورة GeoTIFF والتحقق من بياناتها.</li>
              <li>تشغيل نموذج التجزئة المناسب لنوع الحادثة.</li>
              <li>مراجعة النتيجة واعتمادها.</li>
              <li>إصدار تقرير التقييم بصيغة PDF.</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
