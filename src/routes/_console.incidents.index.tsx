import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  Panel,
  TypeBadge,
  IncidentStatusBadge,
  RoleGate,
  EmptyState,
  th,
  td,
} from "@/components/mirsad/bits";
import { useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/_console/incidents/")({
  head: () => ({
    meta: [
      { title: "إدارة الحوادث · MIRSAD" },
      { name: "description", content: "Search and filter flood and fire incidents, and open or edit incident records." },
      { property: "og:title", content: "Incidents · MIRSAD" },
      { property: "og:description", content: "Incident management for flood and burned-area assessments." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <IncidentsPage />
    </RoleGate>
  ),
});

function IncidentsPage() {
  const { incidents, runs, images } = useDemo();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = useMemo(
    () =>
      incidents.filter(
        (i) =>
          (type === "all" || i.type === type) &&
          (status === "all" || i.status === status) &&
          (q.trim() === "" || i.name.includes(q.trim()) || i.nameEn.toLowerCase().includes(q.trim().toLowerCase()) || i.id.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [incidents, q, type, status],
  );

  return (
    <>
      <PageHeader
        title="إدارة الحوادث"
        en="Incidents"
        description="جميع الحوادث المسجلة، مع صورها الفضائية وتحليلاتها المرتبطة."
        actions={
          <Button asChild size="lg">
            <Link to="/incidents/new">
              <Plus /> إنشاء حادثة جديدة
            </Link>
          </Button>
        }
      />

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-end gap-3 border-b p-4">
          <div className="relative min-w-[260px] flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">بحث باسم الحادثة · Search</label>
            <Search className="pointer-events-none absolute bottom-3 start-3 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="مثال: وادي فاطمة" className="field ps-9" />
          </div>
          <div className="w-48">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">نوع الحادثة · Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="field">
              <option value="all">الكل · All</option>
              <option value="flood">فيضان · Flood</option>
              <option value="fire">حريق · Fire</option>
            </select>
          </div>
          <div className="w-48">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">الحالة · Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="field">
              <option value="all">الكل · All</option>
              <option value="open">مفتوحة · Open</option>
              <option value="closed">مغلقة · Closed</option>
            </select>
          </div>
          <div className="pb-2.5 text-xs text-muted-foreground">
            <span className="font-mono">{rows.length}</span> نتيجة
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title="لا توجد حوادث مطابقة">جرّب تعديل كلمات البحث أو عوامل التصفية.</EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className={th}>اسم الحادثة</th>
                  <th className={th}>النوع</th>
                  <th className={th}>الموقع</th>
                  <th className={th}>تاريخ الحادثة</th>
                  <th className={th}>الصور / التحليلات</th>
                  <th className={th}>الحالة</th>
                  <th className={`${th} text-end`}>الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((i) => (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className={td}>
                      <div className="font-medium">{i.name}</div>
                      <div className="ltr text-start font-mono text-[11px] text-muted-foreground">{i.id}</div>
                    </td>
                    <td className={td}><TypeBadge type={i.type} /></td>
                    <td className={`${td} text-muted-foreground`}>{i.location}</td>
                    <td className={`${td} ltr text-start font-mono text-[13px]`}>{i.date}</td>
                    <td className={`${td} font-mono text-[13px] text-muted-foreground`}>
                      {images.filter((m) => m.incidentId === i.id).length} / {runs.filter((r) => r.incidentId === i.id).length}
                    </td>
                    <td className={td}><IncidentStatusBadge status={i.status} /></td>
                    <td className={`${td} text-end`}>
                      <div className="inline-flex gap-1.5">
                        <Button asChild variant="outline" size="sm">
                          <Link to="/incidents/$id" params={{ id: i.id }}>
                            <Eye /> عرض
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/incidents/$id/edit" params={{ id: i.id }}>
                            <Pencil /> تعديل
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
