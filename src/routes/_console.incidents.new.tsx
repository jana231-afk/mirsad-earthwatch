import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, Panel, RoleGate } from "@/components/mirsad/bits";
import { IncidentForm } from "@/components/mirsad/IncidentForm";
import { demoActions, useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/_console/incidents/new")({
  head: () => ({
    meta: [
      { title: "إنشاء حالة جديدة · مِرصاد" },
      { name: "description", content: "إنشاء سجل حالة كارثة جديدة بتاريخ البداية والنهاية." },
      { property: "og:title", content: "إنشاء حالة جديدة · مِرصاد" },
      { property: "og:description", content: "نموذج إنشاء حالة فيضان أو حريق." },
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
      <PageHeader title="إنشاء حالة جديدة" crumbs={[{ label: "الحالات", to: "/incidents" }, { label: "حالة جديدة" }]} />
      <Panel title="بيانات الحالة" className="max-w-3xl">
        <IncidentForm
          onCancel={() => navigate({ to: "/incidents" })}
          onSubmit={(v) => {
            const max = incidents.reduce((m, i) => Math.max(m, Number(i.id.split("-").pop()) || 0), 0);
            const id = `INC-2026-${String(max + 1).padStart(3, "0")}`;
            demoActions.addIncident({ id, ...v, region: v.location, createdBy: userName });
            toast.success("تم حفظ الحالة");
            navigate({ to: "/incidents/$id", params: { id } });
          }}
        />
      </Panel>
    </>
  );
}
