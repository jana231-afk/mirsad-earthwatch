import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Flame, Droplets, Layers, CalendarDays, Database, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { HERO_PERIODS, HERO_AREAS, HERO_CENTER, HERO_BOUNDARY_KM2, blob, type HeroAreaId } from "./hero-map-data";

type LayerKey = "areas" | "boundary" | "grid";
const LAYER_LABELS: Record<LayerKey, string> = { areas: "المناطق المتأثرة", boundary: "الحدود والخطوط الكنتورية", grid: "الشبكة" };

/** Browser-only interactive hero map — always load via React.lazy behind ClientOnly. */
export default function HeroMapLeaflet() {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const groups = useRef<Record<LayerKey, L.LayerGroup> | null>(null);
  const polys = useRef<Partial<Record<HeroAreaId, L.Polygon>>>({});
  const [period, setPeriod] = useState(0);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ areas: true, boundary: true, grid: false });
  const [selected, setSelected] = useState<HeroAreaId | null>("fire");
  const [hovered, setHovered] = useState<HeroAreaId | null>(null);

  // Build map once
  useEffect(() => {
    if (!el.current) return;
    const css = getComputedStyle(document.documentElement);
    const color = (v: string) => css.getPropertyValue(v).trim();
    const map = L.map(el.current, { scrollWheelZoom: false, zoomControl: false, attributionControl: true }).setView(HERO_CENTER, 11);
    L.control.zoom({ position: "topright" }).addTo(map);
    mapRef.current = map;
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 16,
      attribution: "Esri",
    }).addTo(map);

    const areas = L.layerGroup();
    const boundary = L.layerGroup();
    const grid = L.layerGroup();
    const teal = color("--primary");
    const line = color("--navy-foreground");

    // Boundary + contour rings
    L.polygon(blob(HERO_CENTER, 0.13, 1.3, 64), { color: teal, weight: 2.5, fill: false, className: "hero-glow-teal" }).addTo(boundary);
    for (const [r, s] of [[0.1, 2.1], [0.075, 2.7], [0.05, 3.4]] as const) {
      L.polygon(blob([HERO_CENTER[0] + 0.01, HERO_CENTER[1] + 0.02], r, s, 48), { color: teal, weight: 1, opacity: 0.45, dashArray: "3 5", fill: false, interactive: false }).addTo(boundary);
    }
    // Grid
    for (let i = -6; i <= 6; i++) {
      const lat = HERO_CENTER[0] + i * 0.03;
      const lng = HERO_CENTER[1] + i * 0.03;
      L.polyline([[lat, HERO_CENTER[1] - 0.2], [lat, HERO_CENTER[1] + 0.2]], { color: line, weight: 0.6, opacity: 0.25, interactive: false }).addTo(grid);
      L.polyline([[HERO_CENTER[0] - 0.2, lng], [HERO_CENTER[0] + 0.2, lng]], { color: line, weight: 0.6, opacity: 0.25, interactive: false }).addTo(grid);
    }
    // Affected areas
    for (const a of HERO_AREAS) {
      const c = color(a.type === "fire" ? "--burn" : "--water");
      const p = L.polygon(blob(a.center, a.radius * HERO_PERIODS[0]!.scale[a.id], a.seed, 56), {
        color: c, weight: 2, fillColor: c, fillOpacity: 0.42, className: a.type === "fire" ? "hero-glow-burn" : "hero-glow-water",
      });
      p.on("mouseover", () => setHovered(a.id));
      p.on("mouseout", () => setHovered(null));
      p.on("click", () => setSelected(a.id));
      p.addTo(areas);
      polys.current[a.id] = p;
      const icon = L.divIcon({
        className: "",
        html: `<div class="hero-pin hero-pin-${a.type}">${a.type === "fire" ? "&#128293;" : "&#128167;"}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      L.marker(a.center, { icon, keyboard: false }).on("click", () => setSelected(a.id)).addTo(areas);
    }
    groups.current = { areas, boundary, grid };
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !groups.current) return;
    (Object.keys(layers) as LayerKey[]).forEach((k) => {
      const g = groups.current![k];
      if (layers[k] && !map.hasLayer(g)) g.addTo(map);
      if (!layers[k] && map.hasLayer(g)) map.removeLayer(g);
    });
  }, [layers]);

  // Period → shapes
  useEffect(() => {
    for (const a of HERO_AREAS) {
      polys.current[a.id]?.setLatLngs(blob(a.center, a.radius * HERO_PERIODS[period]!.scale[a.id], a.seed, 56));
    }
  }, [period]);

  // Highlight
  useEffect(() => {
    for (const a of HERO_AREAS) {
      const on = a.id === selected || a.id === hovered;
      polys.current[a.id]?.setStyle({ weight: on ? 3.5 : 2, fillOpacity: on ? 0.62 : 0.38 });
    }
  }, [selected, hovered]);

  const p = HERO_PERIODS[period]!;
  const info = HERO_AREAS.find((a) => a.id === (hovered ?? selected));

  return (
    <div className="relative w-full">
      <div className="relative h-[380px] overflow-hidden rounded-xl border border-primary/40 shadow-panel sm:h-[540px]">
      <div ref={el} dir="ltr" className="hero-map h-full w-full bg-navy-deep" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,var(--navy-deep)_120%)]" />

      {/* Demo label */}
      <div className="absolute start-14 top-3 z-[500] inline-flex items-center gap-1.5 rounded-md border border-warning/50 bg-navy-deep/85 px-2.5 py-1 text-xs font-semibold text-warning backdrop-blur">
        <Database className="h-3.5 w-3.5" /> بيانات تجريبية
      </div>
      </div>

      {/* Layers */}
      <div className="z-[500] mt-2 rounded-lg sm:absolute sm:end-3 sm:top-3 sm:mt-0 sm:w-52 rounded-lg border border-primary/40 bg-navy-deep/80 p-3 text-xs text-navy-foreground backdrop-blur">
        <div className="mb-2 flex items-center gap-1.5 font-semibold"><Layers className="h-3.5 w-3.5 text-primary" /> طبقات الخريطة</div>
        {(Object.keys(LAYER_LABELS) as LayerKey[]).map((k) => (
          <label key={k} className="flex cursor-pointer items-center gap-2 py-1">
            <input type="checkbox" checked={layers[k]} onChange={(e) => setLayers({ ...layers, [k]: e.target.checked })} className="h-3.5 w-3.5 accent-primary" />
            {LAYER_LABELS[k]}
          </label>
        ))}
      </div>

      {/* Period selector + stats */}
      <div className="z-[500] mt-2 flex flex-col gap-2 sm:absolute sm:inset-x-3 sm:bottom-3 sm:mt-0 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-3">
        <div className="rounded-lg border border-primary/40 bg-navy-deep/80 p-3 text-xs text-navy-foreground backdrop-blur">
          <div className="mb-2 flex items-center gap-1.5 font-semibold"><CalendarDays className="h-3.5 w-3.5 text-primary" /> الفترة</div>
          <div className="flex gap-1.5" role="tablist">
            {HERO_PERIODS.map((x, i) => (
              <button key={x.label} type="button" role="tab" aria-selected={i === period} onClick={() => setPeriod(i)}
                className={cn("rounded-md border px-2.5 py-1.5", i === period ? "border-primary bg-primary text-primary-foreground" : "border-navy-line hover:bg-navy-line/60")}>
                <div className="font-semibold">الفترة {i + 1}</div>
                <div className="opacity-80">{x.label}</div>
              </button>
            ))}
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {HERO_AREAS.map((a) => (
              <div key={a.id} className="rounded border border-navy-line px-2 py-1.5">
                <div className="text-navy-muted">{a.type === "fire" ? "مساحة الحريق" : "مساحة الفيضان"}</div>
                <div><span className="ltr font-mono text-sm font-semibold">{p.km2[a.id].toFixed(1)}</span> <span className="ltr">km²</span> · <span className="ltr font-mono">{((p.km2[a.id] / HERO_BOUNDARY_KM2) * 100).toFixed(1)}%</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {info ? (
            <div className="rounded-lg sm:w-56 border border-primary/40 bg-navy-deep/85 p-3 text-xs text-navy-foreground backdrop-blur">
              <div className="flex items-center gap-1.5 font-semibold">
                {info.type === "fire" ? <Flame className="h-3.5 w-3.5 text-burn" /> : <Droplets className="h-3.5 w-3.5 text-water" />}
                {info.name}
              </div>
              <div className="mt-1 text-navy-muted">{info.place}</div>
              <div className="mt-1.5">المساحة المتأثرة: <span className="ltr font-mono font-semibold">{p.km2[info.id].toFixed(1)} km²</span></div>
              <div>التاريخ: {p.label}</div>
            </div>
          ) : (
            <div className="flex w-56 items-center gap-1.5 rounded-lg border border-navy-line bg-navy-deep/80 p-3 text-xs text-navy-muted backdrop-blur">
              <MousePointerClick className="h-3.5 w-3.5" /> اضغط على منطقة لعرض تفاصيلها
            </div>
          )}
          <div className="rounded-lg sm:w-56 border border-primary/40 bg-navy-deep/80 p-3 text-xs text-navy-foreground backdrop-blur">
            <div className="flex items-center gap-2 py-0.5"><span className="h-3 w-4 rounded-sm bg-burn" /> حريق نشط</div>
            <div className="flex items-center gap-2 py-0.5"><span className="h-3 w-4 rounded-sm bg-water" /> فيضان</div>
            <div className="flex items-center gap-2 py-0.5"><span className="h-0 w-4 border-t-2 border-primary" /> حدود المنطقة</div>
          </div>
        </div>
      </div>
    </div>
  );
}
