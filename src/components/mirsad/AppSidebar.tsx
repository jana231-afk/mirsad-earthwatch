import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FolderOpen, UploadCloud, History, FileText, Users, LogOut, MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";
import { demoActions, useDemo } from "@/lib/demo-store";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/demo-data";
import { Logo, LogoMark } from "./Logo";

type Item = { title: string; to: string; icon: typeof LayoutDashboard; roles: Role[] };

const ITEMS: Item[] = [
  { title: "لوحة التحكم", to: "/dashboard", icon: LayoutDashboard, roles: ["analyst"] },
  { title: "الحالات", to: "/incidents", icon: FolderOpen, roles: ["analyst"] },
  { title: "رفع الصور", to: "/upload", icon: UploadCloud, roles: ["analyst"] },
  { title: "سجل التحليلات", to: "/history", icon: History, roles: ["analyst"] },
  { title: "الحالات المصرح بها", to: "/field", icon: MapPinned, roles: ["responder"] },
  { title: "التقارير", to: "/reports", icon: FileText, roles: ["analyst", "responder"] },
  { title: "إدارة المستخدمين", to: "/users", icon: Users, roles: ["admin"] },
];

export function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const { role } = useDemo();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => {
    if (pathname === to || pathname.startsWith(to + "/")) return true;
    if (to === "/history" && (pathname.startsWith("/results") || pathname.startsWith("/review"))) return true;
    return false;
  };

  return (
    <aside
      className={cn(
        "no-print sticky top-0 flex h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-sidebar-border", collapsed ? "justify-center" : "px-4")}>
        <Link to="/" aria-label="الصفحة الرئيسية للمنصة">
          {collapsed ? <LogoMark /> : <Logo inverted />}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {!collapsed && <div className="px-2 pb-2 pt-1 text-[11px] font-semibold text-navy-muted">القائمة الرئيسية</div>}
        {ITEMS.filter((i) => i.roles.includes(role)).map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              to={item.to as any}
              title={collapsed ? item.title : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-sidebar-primary")} />
              {!collapsed && <span className="font-medium">{item.title}</span>}
              {active && !collapsed && <span className="ms-auto h-5 w-1 rounded-full bg-sidebar-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          type="button"
          onClick={() => { demoActions.logout(); navigate({ to: "/", replace: true }); }}
          title={collapsed ? "تسجيل الخروج" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0 rtl:rotate-180" />
          {!collapsed && <span className="font-medium">تسجيل الخروج</span>}
        </Button>
      </div>
    </aside>
  );
}
