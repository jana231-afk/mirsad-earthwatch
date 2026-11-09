import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { Layers, Maximize2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MapViewerProps {
  base: string;
  mask?: string | undefined;
  nodata?: string | undefined;
  kind: "flood" | "fire";
  /** Ground width of the scene in km (used for the scale bar). */
  sceneWidthKm?: number | undefined;
  className?: string | undefined;
  showControls?: boolean | undefined;
  showLegend?: boolean | undefined;
  showLayerPanel?: boolean | undefined;
  caption?: string | undefined;
  defaultMaskVisible?: boolean | undefined;
}

const MIN_Z = 1;
const MAX_Z = 6;

export function MaskLayer({ src, className, style }: { src: string; className: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        ...style,
      }}
    />
  );
}

export function MapLegend({ kind, hasNodata = true, className }: { kind: "flood" | "fire"; hasNodata?: boolean | undefined; className?: string }) {
  return (
    <div className={cn("space-y-1.5 text-xs", className)}>
      <div className="flex items-center gap-2">
        <span className={cn("h-3 w-4 rounded-sm", kind === "flood" ? "bg-water" : "bg-burn")} />
        <span>{kind === "flood" ? "المنطقة المتأثرة (مياه)" : "المنطقة المتأثرة (محروقة)"}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-4 rounded-sm border border-foreground/20 bg-valid" />
        <span>المنطقة السليمة</span>
      </div>
      {hasNodata && (
        <div className="flex items-center gap-2">
          <span className="bg-hatch-nodata h-3 w-4 rounded-sm" />
          <span>بدون بيانات</span>
        </div>
      )}
    </div>
  );
}

export function MapViewer({
  base,
  mask,
  nodata,
  kind,
  sceneWidthKm = 12.8,
  className,
  showControls = true,
  showLegend = true,
  showLayerPanel = true,
  caption,
  defaultMaskVisible = true,
}: MapViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [show, setShow] = useState({ base: true, mask: defaultMaskVisible, nodata: true });
  const [opacity, setOpacity] = useState(65);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => { const e = entries[0]; if (e) setSize({ w: e.contentRect.width, h: e.contentRect.height }); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clampOff = (o: { x: number; y: number }, zz: number) => ({
    x: Math.min(0, Math.max(size.w - size.w * zz, o.x)),
    y: Math.min(0, Math.max(size.h - size.h * zz, o.y)),
  });

  const zoomBy = (factor: number) => {
    const next = Math.min(MAX_Z, Math.max(MIN_Z, z * factor));
    const px = size.w / 2;
    const py = size.h / 2;
    const k = next / z;
    setOff(clampOff({ x: px - (px - off.x) * k, y: py - (py - off.y) * k }, next));
    setZ(next);
  };

  const reset = () => {
    setZ(1);
    setOff({ x: 0, y: 0 });
  };

  const onDown = (e: RPointerEvent) => {
    if (z === 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y };
  };
  const onMove = (e: RPointerEvent) => {
    if (!drag.current) return;
    setOff(clampOff({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y }, z));
  };
  const onUp = () => {
    drag.current = null;
  };

  // Scale bar: pick a round distance about 1/5 of the view width
  const kmPerPx = sceneWidthKm / (size.w * z);
  const targetKm = kmPerPx * size.w * 0.18;
  const steps = [0.25, 0.5, 1, 2, 5];
  const barKm = steps.reduce((p, c) => (Math.abs(c - targetKm) < Math.abs(p - targetKm) ? c : p), 1);
  const barPx = barKm / kmPerPx;

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <div
        ref={ref}
        dir="ltr"
        className={cn("relative aspect-[4/3] w-full select-none overflow-hidden bg-map", z > 1 && "cursor-grab active:cursor-grabbing")}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{ transform: `translate(${off.x}px, ${off.y}px) scale(${z})` }}
        >
          {show.base ? (
            <img src={base} alt="الصورة الجغرافية" draggable={false} className="absolute inset-0 h-full w-full object-fill" />
          ) : (
            <div className="absolute inset-0 bg-valid" />
          )}
          {mask && show.mask && (
            <MaskLayer
              src={mask}
              className={kind === "flood" ? "bg-water" : "bg-burn"}
              style={{ opacity: opacity / 100 }}
            />
          )}
          {nodata && show.nodata && <MaskLayer src={nodata} className="bg-hatch-nodata" />}
        </div>

        {showControls && (
          <div className="absolute left-3 top-3 flex flex-col overflow-hidden rounded-md border bg-card/95 shadow-panel">
            <button type="button" aria-label="تكبير" onClick={() => zoomBy(1.5)} className="grid h-8 w-8 place-items-center hover:bg-secondary disabled:opacity-40" disabled={z >= MAX_Z}>
              <Plus className="h-4 w-4" />
            </button>
            <button type="button" aria-label="تصغير" onClick={() => zoomBy(1 / 1.5)} className="grid h-8 w-8 place-items-center border-t hover:bg-secondary disabled:opacity-40" disabled={z <= MIN_Z}>
              <Minus className="h-4 w-4" />
            </button>
            <button type="button" aria-label="إعادة ضبط العرض" onClick={reset} className="grid h-8 w-8 place-items-center border-t hover:bg-secondary">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="pointer-events-none absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border bg-card/90 text-[11px] font-bold text-foreground">
          ش
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-card/90 px-2 py-1 text-[10px] text-foreground">
          <div className="h-1.5 border-x border-b border-foreground" style={{ width: barPx }} />
          <div className="mt-0.5 font-mono">{barKm} كم</div>
        </div>

        <div className="pointer-events-none absolute bottom-3 right-3 rounded bg-card/90 px-2 py-1 font-mono text-[10px] text-muted-foreground">
          {Math.round(z * 100)}%
        </div>

        {showLegend && mask && (
          <div dir="rtl" className="pointer-events-none absolute bottom-12 right-3 rounded-md border bg-card/95 p-3 text-foreground shadow-panel">
            <div className="mb-2 text-[11px] font-semibold text-muted-foreground">مفتاح الخريطة</div>
            <MapLegend kind={kind} hasNodata={!!nodata} />
          </div>
        )}
      </div>

      {showLayerPanel && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t px-4 py-2.5 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Layers className="h-3.5 w-3.5" /> الطبقات
          </span>
          <LayerToggle label="الصورة الأصلية" checked={show.base} onChange={(v) => setShow({ ...show, base: v })} />
          {mask && (
            <LayerToggle label="نتيجة التحليل" checked={show.mask} onChange={(v) => setShow({ ...show, mask: v })} />
          )}
          {nodata && <LayerToggle label="بدون بيانات" checked={show.nodata} onChange={(v) => setShow({ ...show, nodata: v })} />}
          {mask && (
            <label className="flex items-center gap-2 text-muted-foreground">
              الشفافية
              <input
                type="range"
                min={20}
                max={100}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-24 accent-primary"
                aria-label="شفافية القناع"
              />
              <span className="ltr w-8 font-mono">{opacity}%</span>
            </label>
          )}
          {caption && <span className="ms-auto text-muted-foreground">{caption}</span>}
        </div>
      )}
    </div>
  );
}

function LayerToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 text-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5 accent-primary" />
      {label}
    </label>
  );
}

/** Binary mask preview (white = detected class, dark = background). */
export function BinaryMask({ mask, nodata, className, label }: { mask: string; nodata?: string | undefined; className?: string | undefined; label?: string }) {
  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-mask-bg", className)}>
      <MaskLayer src={mask} className="bg-mask-fg" />
      {nodata && <MaskLayer src={nodata} className="bg-hatch-nodata" />}
      {label && (
        <span className="absolute right-2 top-2 rounded bg-card/90 px-2 py-0.5 text-[11px] font-medium text-foreground">{label}</span>
      )}
    </div>
  );
}

export function ImageThumb({ src, label, className }: { src: string; label?: string | undefined; className?: string }) {
  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-map", className)}>
      <img src={src} alt={label ?? "الصورة الجغرافية"} className="h-full w-full object-cover" loading="lazy" />
      {label && (
        <span className="absolute right-2 top-2 rounded bg-card/90 px-2 py-0.5 text-[11px] font-medium text-foreground">{label}</span>
      )}
    </div>
  );
}
