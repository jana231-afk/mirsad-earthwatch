import { formatDate, formatRange, TYPE_LABELS, type GeoImage, type Incident } from "./demo-data";
import { exportMime, type ExportResult } from "./map-sheet-rules";

const WIDTH = 1600;
const HEIGHT = 1000;
const number = (value: number) => value.toLocaleString("ar-SA", { maximumFractionDigits: 2 });

async function loadImage(src: string) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;
  await image.decode();
  return image;
}

/** Local demo distances, not invented georeferenced coordinates. */
function groundWidth(image?: GeoImage) {
  const resolution = Number.parseFloat(image?.resolution ?? "");
  return image && Number.isFinite(resolution) ? image.width * resolution / 1000 : 12.8;
}

export async function renderMapSheet(incident: Incident, results: ExportResult[], images: GeoImage[], format: "png" | "jpg") {
  if (!results.length || results.some((r) => r.run.status !== "reviewed" || r.run.incidentId !== incident.id)) throw new Error("النتيجة غير معتمدة.");
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH; canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("تعذر إنشاء الصورة.");
  const styles = getComputedStyle(document.documentElement);
  const color = (name: string) => styles.getPropertyValue(`--${name}`).trim();
  const ink = color("foreground"), paper = color("card"), muted = color("muted-foreground"), border = color("border");
  const affected = color(incident.type === "flood" ? "primary" : "burn");
  const font = styles.getPropertyValue("--font-sans").trim();
  const text = (value: string, x: number, y: number, size = 22, fill = ink, weight = 400, align: CanvasTextAlign = "right") => {
    ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = fill; ctx.textAlign = align; ctx.direction = "rtl";
    ctx.fillText(value, x, y);
  };
  const wrap = (value: string, x: number, y: number, maxWidth: number, size = 22, fill = ink, weight = 400) => {
    ctx.font = `${weight} ${size}px ${font}`;
    let line = "";
    for (const word of value.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) { text(line, x, y, size, fill, weight); y += size * 1.45; line = word; }
      else line = next;
    }
    if (line) { text(line, x, y, size, fill, weight); y += size * 1.45; }
    return y;
  };
  ctx.fillStyle = paper; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.strokeRect(1, 1, WIDTH - 2, HEIGHT - 2);
  ctx.beginPath(); ctx.moveTo(1198, 0); ctx.lineTo(1198, HEIGHT); ctx.stroke();
  text(results.length === 2 ? `من ${formatDate(results[0]?.day.date ?? "")} إلى ${formatDate(results[1]?.day.date ?? "")}` : "خريطة المساحات المتأثرة", 1164, 50, 26, ink, 600);

  const loaded = await Promise.all(results.map(async (result) => ({ result, base: await loadImage(result.day.layers.base), mask: await loadImage(result.day.layers.mask), nodata: result.day.layers.nodata ? await loadImage(result.day.layers.nodata) : null })));
  const slot = 1160 / results.length;
  for (let i = 0; i < loaded.length; i++) {
    const item = loaded[i]; if (!item) continue;
    const { result, base, mask, nodata } = item;
    const metadata = images.find((image) => image.id === result.day.imageId);
    const w = results.length === 1 ? 1050 : slot - 38, h = w * base.height / base.width;
    const x = 26 + (results.length - 1 - i) * slot + (slot - 38 - w) / 2, y = results.length === 1 ? 87 : 115 + (650 - h) / 2;
    ctx.drawImage(base, x, y, w, h);
    const layer = document.createElement("canvas"); layer.width = mask.width; layer.height = mask.height;
    const lc = layer.getContext("2d"); if (!lc) throw new Error("تعذر رسم نتيجة التحليل.");
    lc.drawImage(mask, 0, 0);
    const pixels = lc.getImageData(0, 0, layer.width, layer.height);
    lc.globalCompositeOperation = "source-in"; lc.fillStyle = affected; lc.fillRect(0, 0, layer.width, layer.height);
    ctx.globalAlpha = 0.58; ctx.drawImage(layer, x, y, w, h); ctx.globalAlpha = 1;
    // Trace the alpha boundary, never a decorative invented polygon.
    lc.globalCompositeOperation = "source-over"; lc.clearRect(0, 0, layer.width, layer.height); lc.fillStyle = affected;
    for (let py = 1; py < layer.height - 1; py++) {
      for (let px = 1; px < layer.width - 1; px++) {
        const offset = (py * layer.width + px) * 4 + 3;
        if ((pixels.data[offset] ?? 0) > 100 && [-4, 4, -layer.width * 4, layer.width * 4].some((delta) => (pixels.data[offset + delta] ?? 0) <= 100)) lc.fillRect(px, py, 2, 2);
      }
    }
    ctx.drawImage(layer, x, y, w, h);
    if (nodata) {
      lc.clearRect(0, 0, layer.width, layer.height); lc.drawImage(nodata, 0, 0, layer.width, layer.height);
      lc.globalCompositeOperation = "source-in"; lc.fillStyle = color("nodata"); lc.fillRect(0, 0, layer.width, layer.height);
      ctx.globalAlpha = 0.8; ctx.drawImage(layer, x, y, w, h); ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
    const km = groundWidth(metadata);
    for (let tick = 0; tick <= 4; tick++) {
      const tx = x + w * tick / 4;
      ctx.beginPath(); ctx.moveTo(tx, y - 7); ctx.lineTo(tx, y); ctx.moveTo(tx, y + h); ctx.lineTo(tx, y + h + 7); ctx.stroke();
      text(number(km * tick / 4), tx, y + h + 30, 16, muted, 400, "center");
      const ty = y + h * tick / 4;
      ctx.beginPath(); ctx.moveTo(x - 6, ty); ctx.lineTo(x, ty); ctx.moveTo(x + w, ty); ctx.lineTo(x + w + 6, ty); ctx.stroke();
    }
    ctx.fillStyle = paper; ctx.fillRect(x + w - 53, y + 10, 43, 66);
    text("ش", x + w - 31, y + 32, 20, ink, 700, "center");
    ctx.fillStyle = ink; ctx.beginPath(); ctx.moveTo(x + w - 31, y + 38); ctx.lineTo(x + w - 20, y + 65); ctx.lineTo(x + w - 31, y + 58); ctx.lineTo(x + w - 42, y + 65); ctx.closePath(); ctx.fill();
    ctx.fillStyle = paper; ctx.fillRect(x + 10, y + h - 64, Math.min(170, w * 0.6), 54);
    const bar = Math.min(130, w * 0.4);
    ctx.fillStyle = ink; ctx.fillRect(x + 20, y + h - 28, bar, 7);
    text(`${number(km * bar / w)} كم`, x + 20 + bar / 2, y + h - 35, 17, ink, 400, "center");
    const label = results.length > 2 ? `الصورة ${number(i + 1)} · ${formatDate(result.day.date)}` : formatDate(result.day.date);
    text(label, x + w / 2, results.length === 1 ? 923 : y + h + 75, results.length > 2 ? 19 : 22, ink, 600, "center");
    if (results.length > 1) text(`${number(result.day.affectedPct)}٪ متأثرة`, x + w / 2, y + h + 115, 27, affected, 700, "center");
    const previous = loaded[i - 1];
    if (previous) { const change = result.day.affectedPct - previous.result.day.affectedPct; text(`${change < 0 ? "↓" : change > 0 ? "↑" : "—"} ${number(Math.abs(change))} نقطة`, x + w / 2, y + h + 156, 22, muted, 500, "center"); }
  }
  const last = loaded.at(-1); if (!last) throw new Error("لا توجد صورة.");
  const { result } = last;
  const meta = images.find((image) => image.id === result.day.imageId);
  text(`${meta?.crs ?? "نظام إحداثيات غير محدد"} · تدريج محلي تجريبي (كم)`, 1164, 972, 18, muted);
  // Radar logo, matching the existing mark.
  ctx.fillStyle = affected; ctx.fillRect(1508, 26, 56, 56);
  ctx.strokeStyle = paper; ctx.lineWidth = 2;
  for (const radius of [9, 18]) { ctx.beginPath(); ctx.arc(1536, 54, radius, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = paper; ctx.beginPath(); ctx.arc(1536, 54, 3, 0, Math.PI * 2); ctx.fill();
  text("مِرصاد", 1490, 60, 34, ink, 700);
  let sy = wrap(`${TYPE_LABELS[incident.type]} · ${incident.name}`, 1568, 122, 340, 27, ink, 700);
  sy = wrap(incident.location, 1568, sy + 12, 340, 21, muted);
  sy = wrap(incident.endDate ? formatRange(incident.startDate, incident.endDate) : `مستمرة منذ ${formatDate(incident.startDate)}`, 1568, sy + 8, 340, 20);
  sy = wrap(`التقاط الصورة: ${formatDate(result.day.date)}`, 1568, sy + 12, 340, 20, muted);
  sy = wrap(`تاريخ التحليل: ${formatDate(result.run.startedAt)}`, 1568, sy, 340, 20, muted);
  text("المساحة المتأثرة", 1568, sy + 24, 21, muted);
  text(`${number(result.day.affectedKm2)} كم²`, 1568, sy + 76, 43, affected, 700);
  text(`${number(result.day.affectedPct)}٪`, 1568, sy + 126, 43, affected, 700);
  text(`المساحة المحللة الصالحة: ${number(result.day.validKm2)} كم²`, 1568, sy + 162, 20, muted);
  sy += 204;
  for (const [label, fill] of [[incident.type === "flood" ? "المنطقة المتأثرة (مياه)" : "المنطقة المتأثرة (محروقة)", affected], ["المنطقة غير المتأثرة", color("valid")], ["بدون بيانات", color("nodata")]]) {
    if (!label || !fill) continue;
    ctx.fillStyle = fill; ctx.fillRect(1546, sy - 17, 22, 18); text(label, 1533, sy, 20); sy += 32;
  }
  text("محدد موضع ضمن الصورة", 1568, sy + 10, 18, muted);
  ctx.drawImage(last.base, 1368, sy + 24, 200, 110); ctx.strokeStyle = border; ctx.strokeRect(1368, sy + 24, 200, 110);
  ctx.strokeStyle = affected; ctx.lineWidth = 3; ctx.strokeRect(1398, sy + 42, 140, 70);
  ctx.fillStyle = color("success-soft"); ctx.fillRect(1470, 862, 98, 38); text("معتمد", 1552, 888, 23, color("success"), 700);
  wrap("نتائج تقديرية من تحليل الصور، وتمت مراجعتها من المحلل", 1568, 932, 340, 18, muted);
  text("بيانات تجريبية", 1230, 60, 18, muted, 500, "left");
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("تعذر تجهيز التنزيل.")), exportMime(format), 0.94));
}

export async function deliverMapImage(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}