import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, Panel, RoleGate, EmptyState } from "@/components/mirsad/bits";
import { IncidentForm } from "@/components/mirsad/IncidentForm";
import { demoActions, useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/_console/incidents/$id_/edit")({
  head: () => ({
    meta: [
      { title: "تعديل الحادثة · MIRSAD" },
      { name: "description", content: "Edit an incident record in MIRSAD." },
      { property: "og:title", content: "Edit Incident · MIRSAD" },
      { property: "og:description", content: "Update incident name, type, location, date and status." },
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
  if (!inc) return <EmptyState title="الحادثة غير موجودة" />;
  return (
    <>
      <PageHeader
        title="تعديل الحادثة"
        en="Edit Incident"
        crumbs={[
          { label: "الحوادث", to: "/incidents" },
          { label: inc.name, to: "/incidents/$id", params: { id } },
          { label: "تعديل" },
        ]}
      />
      <Panel title="بيانات الحادثة" en="Incident information" className="max-w-3xl">
        <IncidentForm
          isEdit
          initial={inc}
          onCancel={() => navigate({ to: "/incidents/$id", params: { id } })}
          onSubmit={(v) => {
            demoActions.updateIncident(id, { ...v, name: v.name.trim(), location: v.location.trim() });
            toast.success("تم حفظ التعديلات");
            navigate({ to: "/incidents/$id", params: { id } });
          }}
        />
      </Panel>
    </>
  );
}
