import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { PanelRight, UserCircle2 } from "lucide-react";
import { AppSidebar } from "@/components/mirsad/AppSidebar";
import { DemoTag } from "@/components/mirsad/bits";
import { useDemo } from "@/lib/demo-store";
import { ROLE_LABELS } from "@/lib/demo-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_console")({
  component: ConsoleLayout,
});

function ConsoleLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const { role, userName } = useDemo();
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar collapsed={isMobile ? !mobileExpanded : collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/95 px-5 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => isMobile ? setMobileExpanded((value) => !value) : setCollapsed((c) => !c)}
            aria-label="طي القائمة الجانبية"
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <PanelRight className="h-5 w-5" />
          </Button>
          <DemoTag className="hidden sm:inline-flex" />
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
        <main className="flex-1 px-3 py-6 sm:px-6 xl:px-8">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
