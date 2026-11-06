import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden>
      <rect width="40" height="40" rx="9" className="fill-primary" />
      <circle cx="20" cy="20" r="11" fill="none" className="stroke-primary-foreground" strokeWidth="1.6" opacity="0.55" />
      <circle cx="20" cy="20" r="6" fill="none" className="stroke-primary-foreground" strokeWidth="1.6" opacity="0.8" />
      <path d="M20 20 L29.5 13.5 A11 11 0 0 1 31 20 Z" className="fill-primary-foreground" opacity="0.9" />
      <circle cx="20" cy="20" r="2" className="fill-primary-foreground" />
      <circle cx="27" cy="25" r="1.4" className="fill-primary-foreground" />
    </svg>
  );
}

export function Logo({ inverted = false, compact = false }: { inverted?: boolean; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      {!compact && (
        <div className="leading-tight">
          <div className={cn("text-lg font-bold tracking-tight", inverted ? "text-navy-foreground" : "text-foreground")}>
            مِرصاد <span className="ltr font-semibold text-sm tracking-[0.2em] opacity-80">MIRSAD</span>
          </div>
          <div className={cn("text-[11px]", inverted ? "text-navy-muted" : "text-muted-foreground")}>
            نظام رسم وتقييم الكوارث بالذكاء الاصطناعي
          </div>
        </div>
      )}
    </div>
  );
}
