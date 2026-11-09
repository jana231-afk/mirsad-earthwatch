import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DEMO_AREAS } from "./demo-areas";

/** Browser-only Leaflet map — always load via React.lazy behind ClientOnly. */
export default function DemoMapLeaflet({ height = 460 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const css = getComputedStyle(document.documentElement);
    const water = css.getPropertyValue("--water").trim();
    const burn = css.getPropertyValue("--burn").trim();
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([19.8, 41.2], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 13,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    for (const a of DEMO_AREAS) {
      const color = a.type === "flood" ? water : burn;
      const pts = a.shape.map(([dy, dx]) => [a.lat + dy, a.lng + dx] as [number, number]);
      L.polygon(pts, { color, weight: 2, fillColor: color, fillOpacity: 0.45 })
        .addTo(map)
        .bindPopup(
          `<div dir="rtl" style="font-family:inherit;min-width:170px"><strong>${a.name}</strong><br/>${a.typeLabel}<br/>${a.range}<br/>المساحة المتأثرة: <b dir="ltr">${a.pct}</b><br/><small>بيانات تجريبية</small></div>`,
        );
    }
    return () => {
      map.remove();
    };
  }, []);
  return <div ref={ref} dir="ltr" style={{ height }} className="w-full rounded-lg border" />;
}
