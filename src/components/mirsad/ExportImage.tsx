import { useEffect, useState } from "react";
import { Download, ImageDown, LoaderCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo-store";
import { formatDate } from "@/lib/demo-data";
import { exportResults, validComparison } from "@/lib/map-sheet-rules";
import { deliverMapImage, renderMapSheet } from "@/lib/map-sheet";

export function ExportImage({ incidentId, runId, imageId, size = "default" }: {
  incidentId: string; runId?: string; imageId?: string; size?: ButtonProps["size"];
}) {
  const { incidents, runs, images, role } = useDemo();
  const incident = incidents.find((i) => i.id === incidentId);
  const results = incident ? exportResults(role, incident, runs) : [];
  const preferred = results.find((r) => r.run.id === runId && (!imageId || r.day.imageId === imageId)) ?? results.at(-1);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [compare, setCompare] = useState(false);
  const [comparisonKeys, setComparisonKeys] = useState<string[]>([]);
  const [preview, setPreview] = useState<{ blob: Blob; url: string; signature: string } | null>(null);
  const [error, setError] = useState("");
  const [deliveryError, setDeliveryError] = useState("");
  const current = results.find((r) => r.key === selected) ?? preferred;
  const chosen = compare ? results.filter((r) => comparisonKeys.includes(r.key)) : current ? [current] : [];
  const valid = compare ? validComparison(chosen) : chosen.length === 1;
  const signature = `${format}:${compare}:${chosen.map((r) => r.key).join(",")}`;

  useEffect(() => {
    if (!open || !incident || !valid) return;
    let cancelled = false;
    let url: string | undefined;
    setError("");
    renderMapSheet(incident, chosen, images, format).then((blob) => {
      if (cancelled) return;
      url = URL.createObjectURL(blob);
      setPreview({ blob, url, signature });
    }).catch(() => { if (!cancelled) setError("تعذر تجهيز الصورة. حاول مرة أخرى."); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
    // Only regenerate when the selected approved records or output format change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, signature, valid, incident, images, runs]);

  if (!incident || !results.length) return null;
  const ready = valid && preview?.signature === signature && !error;
  return <>
    <Button size={size} variant="outline" onClick={() => {
      setSelected(preferred?.key ?? ""); setCompare(false); setComparisonKeys(results.slice(-3).map((r) => r.key));
      setPreview(null); setError(""); setDeliveryError(""); setOpen(true);
    }}><ImageDown /> تصدير كصورة</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent data-map-export="true" dir="rtl" aria-describedby={undefined} className="left-3 right-3 mx-auto max-h-[90dvh] w-auto max-w-3xl translate-x-0 overflow-y-auto p-4 sm:p-6">
        <DialogHeader><DialogTitle className="pe-8 text-start">تصدير كصورة</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="space-y-1.5 text-sm"><span>تاريخ الصورة</span>
            <select aria-label="تاريخ الصورة" className="field" value={current?.key ?? ""} disabled={compare} onChange={(e) => setSelected(e.target.value)}>
              {results.map((r) => <option key={r.key} value={r.key}>{formatDate(r.day.date)}</option>)}
            </select>
          </label>
          <fieldset className="space-y-1.5"><legend className="text-sm">صيغة الصورة</legend>
            <div className="flex gap-1">
              <Button variant={format === "png" ? "soft" : "outline"} aria-pressed={format === "png"} onClick={() => setFormat("png")}><span className="ltr">PNG</span></Button>
              <Button variant={format === "jpg" ? "soft" : "outline"} aria-pressed={format === "jpg"} onClick={() => setFormat("jpg")}><span className="ltr">JPG</span></Button>
            </div>
          </fieldset>
        </div>
        {results.length > 1 && <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={compare} onCheckedChange={(checked) => setCompare(checked === true)} /> صورة مقارنة بين التواريخ</label>
          {compare && <div className="flex flex-wrap gap-3">
            {results.map((r) => <label key={r.key} className="flex items-center gap-2 text-xs">
              <Checkbox checked={comparisonKeys.includes(r.key)} disabled={!comparisonKeys.includes(r.key) && comparisonKeys.length >= 3} onCheckedChange={(checked) => setComparisonKeys((keys) => checked === true ? [...keys, r.key] : keys.filter((key) => key !== r.key))} />{formatDate(r.day.date)}
            </label>)}
          </div>}
        </div>}
        <div className="grid aspect-[8/5] place-items-center overflow-hidden rounded-md border bg-card" aria-label="معاينة الصورة" aria-busy={!ready}>
          {ready && preview ? <img src={preview.url} alt={compare ? "معاينة صورة مقارنة بين التواريخ" : "معاينة خريطة النتيجة المعتمدة"} className="h-full w-full object-contain" /> :
            <div role="status" className="flex items-center gap-2 p-4 text-sm text-muted-foreground">{error || (!valid ? "اختر تاريخين أو ثلاثة للمقارنة." : <><LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" /> جارٍ تجهيز الصورة…</>)}</div>}
        </div>
        {deliveryError && <p role="alert" className="text-sm text-destructive">{deliveryError}</p>}
        <div className="flex justify-end border-t pt-3">
          <Button disabled={!ready} onClick={() => {
            if (!preview || !ready) return;
            setDeliveryError("");
            void deliverMapImage(preview.blob, `مِرصاد-${incident.id}-${compare ? "مقارنة" : current?.day.date ?? "خريطة"}.${format}`).catch(() => setDeliveryError("تعذر تنزيل الصورة. حاول مرة أخرى."));
          }}><Download /> تنزيل الصورة</Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}