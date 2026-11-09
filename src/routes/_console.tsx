import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { PanelRight, UserCircle2 } from "lucide-react";
import { AppSidebar } from "@/components/mirsad/AppSidebar";
import { DemoTag } from "@/components/mirsad/bits";
import { useDemo } from "@/lib/demo-store";
import { ROLE_LABELS } from "@/lib/demo-data";

export const Route = createFileRoute("/_console")({
  component: ConsoleLayout,
});

function ConsoleLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { role, userName } = useDemo();
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/95 px-5 backdrop-blur">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="طي القائمة الجانبية"
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <PanelRight className="h-5 w-5" />
          </button>
          <DemoTag />
          <div className="ms-auto flex items-center gap-3">
            <div className="text-end leading-tight">
              <div className="text-sm font-semibold">{userName}</div>
              <div className="text-[11px] text-muted-foreground">
                {ROLE_LABELS[role]}
              </div>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-navy">
              <UserCircle2 className="h-5 w-5" />
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-6 xl:px-8">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
