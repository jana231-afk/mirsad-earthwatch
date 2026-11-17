import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogIn, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/mirsad/Logo";
import { cn } from "@/lib/utils";

export const NAV = [{ to: "/about", label: "عن المشروع" }] as const;

export function SiteLayout({ children, dark }: { children: ReactNode; dark?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("flex min-h-screen flex-col", dark ? "bg-navy-deep" : "bg-background")}>
      <header className="sticky top-0 z-50 border-b border-navy-foreground/10 bg-navy-deep text-navy-foreground">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-6 py-3">
          <Link to="/" aria-label="مِرصاد – الرئيسية">
            <Logo inverted />
          </Link>
          <nav className="ms-4 hidden flex-1 items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors hover:bg-navy-line/60",
                  pathname === n.to ? "bg-navy-line/70 font-semibold text-navy-foreground" : "text-navy-foreground/80",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Button asChild className="ms-auto hidden lg:inline-flex">
            <Link to="/login">
              <LogIn className="rtl:rotate-180" /> تسجيل الدخول
            </Link>
          </Button>
          <button
            type="button"
            aria-label="القائمة"
            onClick={() => setOpen((o) => !o)}
            className="ms-auto grid h-10 w-10 place-items-center rounded-md hover:bg-navy-line/60 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-navy-line px-6 py-3 lg:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm hover:bg-navy-line/60">
                {n.label}
              </Link>
            ))}
            <Button asChild className="mt-2 w-full">
              <Link to="/login">تسجيل الدخول</Link>
            </Button>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-navy-line bg-navy-deep text-navy-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-navy-muted">
          <p>كلية الحاسبات وتقنية المعلومات (اسم تجريبي)</p>
          <p>البريد: <span className="ltr">contact@mirsad.sa</span></p>
        </div>
        <div className="border-t border-navy-line py-4 text-center text-xs text-navy-muted">جميع البيانات المعروضة بيانات تجريبية</div>
      </footer>
    </div>
  );
}

/** Title band for inner public pages. */
export function PageBand({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="border-b bg-navy text-navy-foreground">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-3 max-w-2xl text-navy-muted">{subtitle}</p>
      </div>
    </section>
  );
}
