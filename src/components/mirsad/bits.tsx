import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Flame, Lock, Waves, FlaskConical, Database, CalendarRange, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AUTO_STATUS_RULE,
  INCIDENT_STATUS_LABELS,
  ROLE_HOME,
  RUN_STATUS_LABELS,
  TYPE_LABELS,
  formatRange,
  incidentStatus,
  type Incident,
  type IncidentStatus,
  type IncidentType,
  type Role,
  type RunStatus,
} from "@/lib/demo-data";
import { useDemo } from "@/lib/demo-store";

/** Page title block. Arabic only — never add English subtitles. */
export function PageHeader({
  title,
  description,
  actions,
  crumbs,
}: {
  title: string;
  description?: ReactNode | undefined;
  actions?: ReactNode | undefined;
  crumbs?: { label: string; to?: string | undefined; params?: Record<string, string> }[];
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {crumbs && (
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {c.to ? (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <Link to={c.to as any} params={c.params as any} className="hover:text-primary">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{c.label}</span>
                )}
                {i < crumbs.length - 1 && <span className="opacity-50">/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="border-s-4 border-primary ps-3 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <div className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
  bodyClassName?: string | undefined;
}) {
  return (
    <section className={cn("rounded-lg border bg-card shadow-card", className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {actions}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function TypeBadge({ type }: { type: IncidentType }) {
  const Icon = type === "flood" ? Waves : Flame;
  return (
    <Badge variant={type} className="gap-1 font-medium">
      <Icon className="h-3 w-3" />
      {TYPE_LABELS[type]}
    </Badge>
  );
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <Badge variant={status} className="gap-1.5 font-medium">
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "active" ? "bg-primary" : "bg-muted-foreground")} />
      {INCIDENT_STATUS_LABELS[status]}
    </Badge>
  );
}

/** Status badge computed automatically from the incident's dates and images. */
export function AutoStatusBadge({ incident }: { incident: Incident }) {
  const { images } = useDemo();
  return <IncidentStatusBadge status={incidentStatus(incident, images)} />;
}

/** Small note explaining the automatic active/closed rule. */
export function AutoStatusNote({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-2 rounded-md border border-info/20 bg-info-soft px-3 py-2 text-xs leading-relaxed text-foreground/80", className)}>
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
      <span>{AUTO_STATUS_RULE}</span>
    </div>
  );
}

/** "من – إلى" date range. */
export function DateRange({ from, to, className }: { from: string; to?: string | undefined; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", className)}>
      <CalendarRange className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      {formatRange(from, to)}
    </span>
  );
}

export function RunStatusBadge({ status }: { status: RunStatus }) {
  const variant = status === "failed" ? "correction" : status;
  return (
    <Badge variant={variant} className="font-medium">
      {RUN_STATUS_LABELS[status]}
    </Badge>
  );
}

export function ExperimentalBadge() {
  return (
    <Badge variant="experimental" className="gap-1 font-medium">
      <FlaskConical className="h-3 w-3" />
      تجريبي – قيد التحقق
    </Badge>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <Badge variant="demo" className={cn("gap-1", className)}>
      <Database className="h-3 w-3" />
      بيانات تجريبية
    </Badge>
  );
}

export function InfoRow({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dashed py-1.5 text-sm last:border-0">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn("text-end font-medium text-foreground", mono && "ltr font-mono text-[13px]")}>{value}</dd>
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: ReactNode;
  unit?: string | undefined;
  icon?: ReactNode | undefined;
  tone?: "primary" | "water" | "burn" | "navy" | "success" | undefined;
  hint?: string | undefined;
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    water: "bg-water-soft text-water",
    burn: "bg-burn-soft text-burn",
    navy: "bg-secondary text-navy",
    success: "bg-success-soft text-success",
  } as const;
  return (
    <div className="rounded-lg border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        {icon && <div className={cn("grid h-9 w-9 place-items-center rounded-md", tones[tone])}>{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="ltr font-mono text-3xl font-semibold text-foreground">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/40 px-6 py-10 text-center">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function RoleGate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { role } = useDemo();
  if (allow.includes(role)) return <>{children}</>;
  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg border bg-card p-8 text-center shadow-card">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary text-navy">
        <Lock className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-semibold">غير مصرح بالوصول</h2>
      <p className="mt-3 text-sm text-muted-foreground">هذه الصفحة غير متاحة لدورك الحالي في النظام.</p>
      <Button asChild variant="navy" className="mt-5">
        <Link to={ROLE_HOME[role]}>العودة إلى صفحتك الرئيسية</Link>
      </Button>
    </div>
  );
}

export function Notice({
  tone = "info",
  title,
  children,
  icon,
}: {
  tone?: "info" | "warning" | "danger" | "success" | undefined;
  title?: string | undefined;
  children: ReactNode;
  icon?: ReactNode | undefined;
}) {
  const tones = {
    info: "border-info/25 bg-info-soft text-info",
    warning: "border-warning/40 bg-warning-soft text-warning-foreground",
    danger: "border-destructive/25 bg-destructive-soft text-destructive",
    success: "border-success/25 bg-success-soft text-success",
  } as const;
  return (
    <div className={cn("flex gap-3 rounded-md border px-4 py-3 text-sm", tones[tone])}>
      {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
      <div className="min-w-0">
        {title && <div className="font-semibold">{title}</div>}
        <div className={cn(title && "mt-0.5", "text-foreground/80")}>{children}</div>
      </div>
    </div>
  );
}

export const th = "px-4 py-3 text-start text-xs font-semibold text-muted-foreground whitespace-nowrap";
export const td = "px-4 py-3 text-sm align-middle";
