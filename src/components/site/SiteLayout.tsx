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
        <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Logo inverted />
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-navy-muted">
              منصة لتحليل الصور الجغرافية وتقدير المناطق المتأثرة بالكوارث.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-primary">روابط سريعة</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>
                <Link to="/about" className="text-navy-muted transition-colors hover:text-primary">
                  عن المشروع
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-navy-muted transition-colors hover:text-primary">
                  تسجيل الدخول
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-primary">تواصل معنا</h3>
            <p className="mt-2 text-sm">
              <a href="mailto:info@mirsad.sa" className="ltr text-navy-muted transition-colors hover:text-primary">
                info@mirsad.sa
              </a>
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-navy-muted">
              جامعة الباحة – كلية الحاسبات والمعلومات – قسم علوم الحاسبات
            </p>
          </div>
        </div>
        <div className="border-t border-navy-line">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-3 text-xs text-navy-muted">
            <p>© ٢٠٢٦ مِرصاد. جميع الحقوق محفوظة.</p>
            <p className="rounded-full border border-navy-line px-2.5 py-0.5">البيانات المعروضة تجريبية</p>
          </div>
        </div>
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
