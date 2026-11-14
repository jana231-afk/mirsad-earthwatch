import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, Panel, RoleGate, EmptyState } from "@/components/mirsad/bits";
import { IncidentForm } from "@/components/mirsad/IncidentForm";
import { demoActions, useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/_console/incidents/$id_/edit")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "تعديل الحالة · مِرصاد" },
      { name: "description", content: "تعديل بيانات حالة كارثة في مِرصاد." },
      { property: "og:title", content: "تعديل الحالة · مِرصاد" },
      { property: "og:description", content: "تحديث اسم الحالة ونوعها وموقعها وتاريخيها." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <EditIncident />
    </RoleGate>
  ),
});

function EditIncident() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { incidents } = useDemo();
  const inc = incidents.find((i) => i.id === id);
  if (!inc) return <EmptyState title="الحالة غير موجودة" />;
  return (
    <>
      <PageHeader
        title="تعديل الحالة"
        crumbs={[{ label: "الحالات", to: "/incidents" }, { label: inc.name, to: "/incidents/$id", params: { id } }, { label: "تعديل" }]}
      />
      <Panel title="بيانات الحالة" className="max-w-3xl">
        <IncidentForm
          initial={inc}
          onCancel={() => navigate({ to: "/incidents/$id", params: { id } })}
          onSubmit={(v) => {
            demoActions.updateIncident(id, v);
            toast.success("تم حفظ التعديلات");
            navigate({ to: "/incidents/$id", params: { id } });
          }}
        />
      </Panel>
    </>
  );
}
