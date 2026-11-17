/**
 * DEMO DATA — all records below are fictional sample data ("بيانات تجريبية") used to
 * illustrate the MIRSAD interface. In the real system these come from the Flask + SQLite backend.
 *
 * Wording rule: the interface never mentions satellites or artificial intelligence.
 * Use "الصور الجغرافية" (geospatial images) and "التحليل الآلي" (automated analysis).
 */
import floodPost from "@/assets/flood-post.jpg";
import floodWater from "@/assets/flood-water-mask.png";
import floodWaterD2 from "@/assets/flood-water-mask-d2.png";
import floodWaterD3 from "@/assets/flood-water-mask-d3.png";
import floodNodata from "@/assets/flood-nodata-mask.png";
import firePre from "@/assets/fire-pre.jpg";
import firePost from "@/assets/fire-post.jpg";
import fireBurn from "@/assets/fire-burn-mask.png";
import fireBurnD2 from "@/assets/fire-burn-mask-d2.png";

export type Role = "admin" | "analyst" | "responder";
export type IncidentType = "flood" | "fire";
/** Never stored — always derived by `incidentStatus()` (no manual closing). */
export type IncidentStatus = "active" | "closed";
export type RunStatus = "reviewed" | "pending" | "correction" | "processing" | "failed";
/** event = flood image · pre/post/later = burned-area images */
export type ImageRole = "event" | "pre" | "post" | "later";
export type ValidationStatus = "valid" | "warning" | "unsupported";
export type ReportType = "disaster" | "progress";

export interface Incident {
  id: string;
  name: string;
  type: IncidentType;
  /** Combined readable location "المنطقة — المدينة — الحي أو الشارع" (kept for older records). */
  location: string;
  /** المنطقة */
  region: string;
  /** المدينة */
  city?: string | undefined;
  /** الحي أو الشارع */
  district?: string | undefined;
  /** Actual day the disaster began (YYYY-MM-DD) — not the record creation date. */
  startDate: string;
  /** Last day of the disaster; undefined while the disaster is ongoing ("مستمرة"). */
  endDate?: string | undefined;
  /** When the record was entered into the system (separate from startDate). */
  createdAt?: string | undefined;
  description: string;
  createdBy: string;
  sharedWithResponders: boolean;
}

export interface GeoImage {
  id: string;
  incidentId: string;
  fileName: string;
  sizeMB: number;
  sensor: string;
  imageRole: ImageRole;
  acquisitionDate: string;
  acquisitionDateSource: "metadata" | "manual";
  crs: string;
  width: number;
  height: number;
  bands: number;
  resolution: string;
  nodata: string;
  status: ValidationStatus;
  warnings: string[];
  uploadedAt: string;
  preview: string;
}

export interface MapLayers {
  base: string;
  mask: string;
  nodata?: string | undefined;
  pre?: string | undefined;
}

/** Result of the model for one image (one day). */
export interface DayResult {
  imageId: string;
  date: string;
  affectedKm2: number;
  affectedPct: number;
  validKm2: number;
  nodataKm2: number;
  layers: MapLayers;
}

export interface AnalysisRun {
  id: string;
  incidentId: string;
  /** All images used, including the pre-event reference image for burned areas. */
  imageIds: string[];
  model: string;
  modelVersion: string;
  experimental: boolean;
  startedAt: string;
  durationSec: number;
  status: RunStatus;
  /** One entry per analysed image, sorted by date (oldest first). */
  days: DayResult[];
  runBy: string;
  reviewer?: string | undefined;
  reviewedAt?: string | undefined;
  reviewNotes?: string | undefined;
}

export interface Report {
  id: string;
  type: ReportType;
  incidentId: string;
  runId: string;
  /** Images (days) the user chose to include. */
  imageIds: string[];
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastLogin: string;
}

export const FLOOD_MODEL = "U-Net لتقسيم الفيضانات";
export const FIRE_MODEL = "U-Net لتقسيم المناطق المحروقة";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "مدير النظام",
  analyst: "محلل نظم المعلومات الجغرافية",
  responder: "مستجيب ميداني",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: "يدير حسابات المستخدمين وصلاحياتهم فقط.",
  analyst: "ينشئ الحالات، ويرفع الصور، ويشغّل التحليل، ويراجع النتائج، ويصدر التقارير.",
  responder: "يطّلع على الحالات المصرح بها والنتائج المراجَعة فقط.",
};

export const TYPE_LABELS: Record<IncidentType, string> = {
  flood: "فيضان",
  fire: "حريق",
};

/** Disaster types the system is designed for but that are not available yet. */
export const UPCOMING_TYPES = ["انزلاق أرضي", "عاصفة رملية", "جفاف"];

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  active: "نشطة",
  closed: "مغلقة",
};

export const RUN_STATUS_LABELS: Record<RunStatus, string> = {
  reviewed: "تمت المراجعة",
  pending: "بانتظار المراجعة",
  correction: "يحتاج إلى تصحيح",
  processing: "قيد المعالجة",
  failed: "فشل التحليل",
};

export const IMAGE_ROLE_LABELS: Record<ImageRole, string> = {
  event: "صورة الحالة",
  pre: "قبل الحدث",
  post: "بعد الحدث",
  later: "صورة لاحقة",
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  disaster: "تقرير الكارثة",
  progress: "تقرير التطور اليومي",
};

export const REPORT_TYPE_DESCRIPTIONS: Record<ReportType, string> = {
  disaster: "التحليل الكامل للحالة: بيانات الحالة والصور، خريطة التحليل، المساحة المتأثرة ونسبتها، معلومات النموذج وحالة المراجعة.",
  progress: "مقارنة الصور المحللة عبر الأيام: قسم لكل تاريخ، جدول ورسم بياني للمقارنة، وملخص للزيادة أو النقص بين الصور.",
};

export const SENSORS = ["بصرية متعددة النطاقات", "رادارية", "جوية عالية الدقة", "غير معروف"];

export const METHODOLOGY =
  "تُرفع الصور الجغرافية بصيغة GeoTIFF ويُتحقق من قابليتها للقراءة ونظام إحداثياتها وأبعادها وعدد نطاقاتها وقيم NoData. ثم يطبَّق نموذج تقسيم من نوع U-Net على كل صورة لتصنيف كل بكسل إلى منطقة متأثرة أو سليمة، وتُستبعد بكسلات NoData، وتُحسب المساحة بضرب عدد البكسلات المتأثرة في مساحة البكسل الواحد. يراجع محلل نظم المعلومات الجغرافية النتيجة بصرياً قبل اعتمادها.";

export const LIMITATIONS = [
  "تمثل النتائج تصنيفاً آلياً للبكسلات ولا تعني تحديد الأضرار الفعلية على أرض الواقع.",
  "تتأثر الدقة بجودة الصورة والغيوم والظلال وتاريخ الالتقاط.",
  "لا يقدّر النظام عمق المياه ولا يحدد أولويات الاستجابة.",
  "نموذج المناطق المحروقة تجريبي وقيد التحقق.",
];

/* -------------------------------------------------------------------------- */
/* Dates                                                                       */
/* -------------------------------------------------------------------------- */

/** Today's date (YYYY-MM-DD), used by the automatic incident status rule. */
export function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

/** "2026-10-22" → "22 أكتوبر 2026" */
export function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return iso;
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

/** Date range "من – إلى". Same day → "14 – 14 سبتمبر 2026". */
export function formatRange(from: string, to?: string) {
  if (!to) return `${formatDate(from)} — مستمرة`;
  const [fy, fm, fd] = from.split("-");
  const [ty, tm, td] = to.split("-");
  if (!fy || !fm || !fd || !ty || !tm || !td) return `${from} – ${to}`;
  if (fy === ty && fm === tm) return `${Number(fd)} – ${Number(td)} ${MONTHS[Number(fm) - 1]} ${fy}`;
  if (fy === ty) return `${Number(fd)} ${MONTHS[Number(fm) - 1]} – ${Number(td)} ${MONTHS[Number(tm) - 1]} ${fy}`;
  return `${formatDate(from)} – ${formatDate(to)}`;
}

export function daysBetween(from: string, to: string = todayISO()) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1;
}

/**
 * Automatic incident status (no manual close button for anyone).
 * The incident is "active" until the later of: its end date, the latest image
 * acquisition date and the latest image upload date. After that day passes with
 * no new image it becomes "closed". Adding a newer image re-activates it.
 */
export function lastActivityDate(incident: Incident, images: GeoImage[]) {
  if (!incident.endDate) return "9999-12-31"; // ongoing — stays active until an end date is added
  let last = incident.endDate;
  for (const img of images) {
    if (img.incidentId !== incident.id) continue;
    if (img.acquisitionDate > last) last = img.acquisitionDate;
    if (img.uploadedAt.slice(0, 10) > last) last = img.uploadedAt.slice(0, 10);
  }
  return last;
}

export function incidentStatus(incident: Incident, images: GeoImage[], today = todayISO()): IncidentStatus {
  return today <= lastActivityDate(incident, images) ? "active" : "closed";
}

export const AUTO_STATUS_RULE =
  "تُحدَّد حالة السجل آلياً: تبقى «نشطة» ما دام تاريخ النهاية لم يمضِ أو ما زالت تُضاف صور جديدة، وتصبح «مغلقة» تلقائياً عند عدم وصول صور جديدة بعد تاريخ النهاية. وإذا أُضيفت صورة بتاريخ لاحق إلى حالة مغلقة تعود «نشطة» تلقائياً.";

/* -------------------------------------------------------------------------- */
/* Numbers                                                                     */
/* -------------------------------------------------------------------------- */

export function formatKm2(v: number) {
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPct(v: number) {
  return `${v.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

/** Latest (most recent) day of a run — used as the headline result. */
export function latestDay(run: AnalysisRun): DayResult {
  return run.days[run.days.length - 1]!;
}

/** Change in affected percentage points between consecutive days. */
export function dayChanges(days: DayResult[]) {
  return days.map((d, i) => {
    const prev = days[i - 1];
    return {
      ...d,
      changePct: prev ? d.affectedPct - prev.affectedPct : undefined,
      changeKm2: prev ? d.affectedKm2 - prev.affectedKm2 : undefined,
    };
  });
}

const WEEKDAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

/** "2026-11-12" → "الخميس" */
export function weekdayName(iso: string) {
  const t = Date.parse(`${iso.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(t) ? "" : WEEKDAYS[new Date(t).getUTCDay()]!;
}

/** "من X إلى Y" using full dates. */
export function fromTo(from: string, to: string) {
  return `من ${formatDate(from)} إلى ${formatDate(to)}`;
}

/**
 * Label for image `index` among `total` images, based on real acquisition dates:
 * more than two → "الصورة 1 — 6 نوفمبر 2026"; one or two → the date only (never numbered).
 */
export function imageLabel(index: number, total: number, date: string) {
  return total > 2 ? `الصورة ${index + 1} — ${formatDate(date)}` : formatDate(date);
}

/** Period covered by a set of images: "من [أول صورة] إلى [آخر صورة]" (same date twice for one day). */
export function imagesPeriod(dates: string[]) {
  const sorted = [...dates].sort();
  if (!sorted.length) return "";
  return fromTo(sorted[0]!, sorted[sorted.length - 1]!);
}

/** Incident date for reports: "من البداية إلى النهاية" or "البداية — مستمرة". */
export function incidentDateText(i: Pick<Incident, "startDate" | "endDate">) {
  return i.endDate ? fromTo(i.startDate, i.endDate) : `${formatDate(i.startDate)} — مستمرة`;
}

/** "منطقة مكة المكرمة — جدة — حي الروضة" */
export function joinLocation(region: string, city?: string, district?: string) {
  return [region, city, district].map((x) => x?.trim()).filter(Boolean).join(" — ");
}

/* -------------------------------------------------------------------------- */
/* Records                                                                     */
/* -------------------------------------------------------------------------- */

export const INCIDENTS: Incident[] = [
  {
    id: "INC-2026-020",
    name: "حريق غابات تنومة",
    type: "fire",
    location: "منطقة عسير — تنومة — منتزه الجرة",
    region: "منطقة عسير",
    city: "تنومة",
    district: "منتزه الجرة",
    startDate: "2026-11-12",
    createdAt: "2026-11-15 09:30",
    description: "حريق في الغطاء الشجري على المنحدرات الشرقية لمنتزه الجرة بدأ يوم الخميس، ولم يُعلن إخماده بعد. بانتظار رفع الصور الجغرافية.",
    createdBy: "فيصل الغامدي",
    sharedWithResponders: false,
  },
  {
    id: "INC-2026-019",
    name: "سيول وادي الأخضر",
    type: "flood",
    location: "منطقة تبوك — تبوك — وادي الأخضر",
    region: "منطقة تبوك",
    city: "تبوك",
    district: "وادي الأخضر",
    startDate: "2026-11-08",
    description: "أمطار غزيرة أدت إلى جريان الوادي وتجمع المياه في الأراضي الزراعية المجاورة. بانتظار رفع الصور الجغرافية.",
    createdBy: "نورة العتيبي",
    sharedWithResponders: false,
  },
  {
    id: "INC-2026-018",
    name: "سيول وادي فاطمة",
    type: "flood",
    location: "منطقة مكة المكرمة — الجموم — شمال الجموم – مزارع وادي فاطمة",
    region: "منطقة مكة المكرمة",
    city: "الجموم",
    district: "شمال الجموم – مزارع وادي فاطمة",
    startDate: "2026-11-05",
    description: "جريان سيول وادي فاطمة بعد أمطار غزيرة على عدة أيام، مع غمر أجزاء من المزارع والطرق الفرعية شمال الجموم. تُرفع صورة لكل يوم لمتابعة انحسار المياه.",
    createdBy: "نورة العتيبي",
    sharedWithResponders: true,
  },
  {
    id: "INC-2026-016",
    name: "حريق غابات السودة",
    type: "fire",
    location: "منطقة عسير — أبها — السودة",
    region: "منطقة عسير",
    city: "أبها",
    district: "السودة",
    startDate: "2026-09-14",
    endDate: "2026-09-15",
    description: "حريق في غطاء أشجار العرعر على المنحدرات الجنوبية الغربية. تم إخماده بعد يومين، والمطلوب تقدير المساحة المحروقة.",
    createdBy: "فيصل الغامدي",
    sharedWithResponders: true,
  },
  {
    id: "INC-2026-015",
    name: "سيول صبيا",
    type: "flood",
    location: "منطقة جازان — صبيا — شرق المدينة",
    region: "منطقة جازان",
    city: "صبيا",
    district: "شرق المدينة",
    startDate: "2026-08-30",
    endDate: "2026-08-30",
    description: "ارتفاع منسوب وادي صبيا وتجمع المياه في المناطق المنخفضة شرق المدينة خلال يوم واحد.",
    createdBy: "فيصل الغامدي",
    sharedWithResponders: false,
  },
  {
    id: "INC-2026-012",
    name: "حريق غابة رغدان",
    type: "fire",
    location: "منطقة الباحة — الباحة — رغدان",
    region: "منطقة الباحة",
    city: "الباحة",
    district: "رغدان",
    startDate: "2026-07-11",
    endDate: "2026-07-11",
    description: "حريق محدود في الأطراف الشمالية لغابة رغدان.",
    createdBy: "نورة العتيبي",
    sharedWithResponders: true,
  },
  {
    id: "INC-2026-010",
    name: "سيول شرق جدة",
    type: "flood",
    location: "منطقة مكة المكرمة — جدة — حي الروضة",
    region: "منطقة مكة المكرمة",
    city: "جدة",
    district: "حي الروضة",
    startDate: "2026-04-17",
    endDate: "2026-04-18",
    description: "تجمع مياه الأمطار في الأحياء الواقعة شرق طريق الحرمين.",
    createdBy: "نورة العتيبي",
    sharedWithResponders: true,
  },
  {
    id: "INC-2026-007",
    name: "فيضان وادي حنيفة",
    type: "flood",
    location: "منطقة الرياض — الرياض — العمارية",
    region: "منطقة الرياض",
    city: "الرياض",
    district: "العمارية",
    startDate: "2026-03-05",
    endDate: "2026-03-05",
    description: "جريان وادي حنيفة وغمر أجزاء من الممرات والمزارع على ضفتيه.",
    createdBy: "فيصل الغامدي",
    sharedWithResponders: false,
  },
  {
    id: "INC-2026-004",
    name: "حريق مراعي الشفا",
    type: "fire",
    location: "منطقة مكة المكرمة — الطائف — الشفا",
    region: "منطقة مكة المكرمة",
    city: "الطائف",
    district: "الشفا",
    startDate: "2026-02-09",
    endDate: "2026-02-10",
    description: "حريق في الغطاء العشبي والشجيرات على مرتفعات الشفا.",
    createdBy: "فيصل الغامدي",
    sharedWithResponders: false,
  },
];

const floodImg = (
  id: string,
  incidentId: string,
  fileName: string,
  acquisitionDate: string,
  extra: Partial<GeoImage> = {},
): GeoImage => ({
  id,
  incidentId,
  fileName,
  sizeMB: 186.4,
  sensor: "بصرية متعددة النطاقات",
  imageRole: "event",
  acquisitionDate,
  acquisitionDateSource: "metadata",
  crs: "EPSG:32637",
  width: 1280,
  height: 960,
  bands: 4,
  resolution: "10 م",
  nodata: "0 (نحو 3% من البكسلات)",
  status: "warning",
  warnings: ["تحتوي الصورة على منطقة بدون بيانات في الزاوية الجنوبية الشرقية (نحو 3%) وستُستبعد من حساب المساحة."],
  uploadedAt: acquisitionDate,
  preview: floodPost,
  ...extra,
});

const fireImg = (
  id: string,
  incidentId: string,
  fileName: string,
  imageRole: ImageRole,
  acquisitionDate: string,
  extra: Partial<GeoImage> = {},
): GeoImage => ({
  id,
  incidentId,
  fileName,
  sizeMB: 212.7,
  sensor: "بصرية متعددة النطاقات",
  imageRole,
  acquisitionDate,
  acquisitionDateSource: "metadata",
  crs: "EPSG:32638",
  width: 1280,
  height: 960,
  bands: 6,
  resolution: "10 م",
  nodata: "غير محددة",
  status: "valid",
  warnings: [],
  uploadedAt: acquisitionDate,
  preview: imageRole === "pre" ? firePre : firePost,
  ...extra,
});

export const IMAGES: GeoImage[] = [
  floodImg("IMG-101", "INC-2026-018", "wadi_fatimah_2026-11-06.tif", "2026-11-06"),
  floodImg("IMG-102", "INC-2026-018", "wadi_fatimah_2026-11-07.tif", "2026-11-07"),
  floodImg("IMG-103", "INC-2026-018", "wadi_fatimah_2026-11-08.tif", "2026-11-08", {
    sensor: "رادارية",
    sizeMB: 142.1,
    bands: 2,
    acquisitionDateSource: "manual",
    nodata: "غير محددة",
    warnings: [
      "تاريخ الالتقاط غير موجود في البيانات الوصفية، وتم إدخاله يدوياً.",
      "قيمة NoData غير معرّفة في الملف، ويُفترض عدم وجود بكسلات فارغة.",
    ],
  }),
  fireImg("IMG-095", "INC-2026-016", "soudah_pre_2026-09-08.tif", "pre", "2026-09-08"),
  fireImg("IMG-096", "INC-2026-016", "soudah_post_2026-09-17.tif", "post", "2026-09-17"),
  fireImg("IMG-097", "INC-2026-016", "soudah_later_2026-09-24.tif", "later", "2026-09-24"),
  floodImg("IMG-088", "INC-2026-015", "sabya_2026-08-30.tif", "2026-08-30", { crs: "EPSG:32638", uploadedAt: "2026-08-30" }),
  fireImg("IMG-071", "INC-2026-012", "raghadan_pre_2026-07-06.tif", "pre", "2026-07-06"),
  fireImg("IMG-072", "INC-2026-012", "raghadan_post_2026-07-11.tif", "post", "2026-07-11"),
  floodImg("IMG-054", "INC-2026-010", "east_jeddah_2026-04-18.tif", "2026-04-18"),
  floodImg("IMG-041", "INC-2026-007", "wadi_hanifa_2026-03-05.tif", "2026-03-05", {
    sensor: "غير معروف",
    resolution: "30 م",
    crs: "EPSG:32638",
  }),
  fireImg("IMG-030", "INC-2026-004", "shafa_post_2026-02-10.tif", "post", "2026-02-10", {
    warnings: ["لا توجد صورة قبل الحدث، وسيتم التحليل على صورة ما بعد الحدث فقط."],
    status: "warning",
  }),
];

const floodDay = (imageId: string, date: string, mask: string, affectedKm2: number, affectedPct: number): DayResult => ({
  imageId,
  date,
  affectedKm2,
  affectedPct,
  validKm2: 119.21,
  nodataKm2: 3.67,
  layers: { base: floodPost, mask, nodata: floodNodata },
});

const fireDay = (imageId: string, date: string, mask: string, affectedKm2: number, affectedPct: number): DayResult => ({
  imageId,
  date,
  affectedKm2,
  affectedPct,
  validKm2: 122.88,
  nodataKm2: 0,
  layers: { base: firePost, mask, pre: firePre },
});

export const RUNS: AnalysisRun[] = [
  {
    id: "RUN-0047",
    incidentId: "INC-2026-018",
    imageIds: ["IMG-101", "IMG-102", "IMG-103"],
    model: FLOOD_MODEL,
    modelVersion: "v1.2.0",
    experimental: false,
    startedAt: "2026-11-08 18:20",
    durationSec: 274,
    status: "reviewed",
    days: [
      floodDay("IMG-101", "2026-11-06", floodWater, 44.1, 37.0),
      floodDay("IMG-102", "2026-11-07", floodWaterD2, 32.81, 27.5),
      floodDay("IMG-103", "2026-11-08", floodWaterD3, 24.26, 20.4),
    ],
    runBy: "نورة العتيبي",
    reviewer: "نورة العتيبي",
    reviewedAt: "2026-11-08 21:05",
    reviewNotes: "النتائج متوافقة مع الصور الأصلية للأيام الثلاثة، ويظهر انحسار تدريجي للمياه. توجد بقع صغيرة مصنفة كمياه على المرتفعات الجنوبية (ظلال) ولا تؤثر جوهرياً على المساحة.",
  },
  {
    id: "RUN-0046",
    incidentId: "INC-2026-018",
    imageIds: ["IMG-101"],
    model: FLOOD_MODEL,
    modelVersion: "v1.1.0",
    experimental: false,
    startedAt: "2026-11-06 19:02",
    durationSec: 91,
    status: "correction",
    days: [floodDay("IMG-101", "2026-11-06", floodWater, 51.34, 43.1)],
    runBy: "نورة العتيبي",
    reviewer: "نورة العتيبي",
    reviewedAt: "2026-11-06 21:10",
    reviewNotes: "صنّف النموذج ظلال الجبال كمياه بشكل واسع. يُعاد التشغيل بالإصدار v1.2.0.",
  },
  {
    id: "RUN-0039",
    incidentId: "INC-2026-016",
    imageIds: ["IMG-095", "IMG-096", "IMG-097"],
    model: FIRE_MODEL,
    modelVersion: "v0.3.0",
    experimental: true,
    startedAt: "2026-09-24 11:20",
    durationSec: 198,
    status: "reviewed",
    days: [
      fireDay("IMG-096", "2026-09-17", fireBurn, 32.05, 26.1),
      fireDay("IMG-097", "2026-09-24", fireBurnD2, 37.37, 30.4),
    ],
    runBy: "فيصل الغامدي",
    reviewer: "فيصل الغامدي",
    reviewedAt: "2026-09-24 15:45",
    reviewNotes: "حدود المنطقة المحروقة واضحة ومطابقة للفرق بين صورة ما قبل الحدث والصور اللاحقة. نتيجة تجريبية.",
  },
  {
    id: "RUN-0037",
    incidentId: "INC-2026-015",
    imageIds: ["IMG-088"],
    model: FLOOD_MODEL,
    modelVersion: "v1.2.0",
    experimental: false,
    startedAt: "2026-08-31 08:30",
    durationSec: 85,
    status: "pending",
    days: [floodDay("IMG-088", "2026-08-30", floodWaterD2, 18.42, 15.5)],
    runBy: "فيصل الغامدي",
  },
  {
    id: "RUN-0031",
    incidentId: "INC-2026-012",
    imageIds: ["IMG-071", "IMG-072"],
    model: FIRE_MODEL,
    modelVersion: "v0.2.1",
    experimental: true,
    startedAt: "2026-07-12 12:05",
    durationSec: 128,
    status: "reviewed",
    days: [fireDay("IMG-072", "2026-07-11", fireBurn, 6.84, 5.6)],
    runBy: "نورة العتيبي",
    reviewer: "نورة العتيبي",
    reviewedAt: "2026-07-12 16:20",
    reviewNotes: "نتيجة تجريبية مقبولة.",
  },
  {
    id: "RUN-0024",
    incidentId: "INC-2026-010",
    imageIds: ["IMG-054"],
    model: FLOOD_MODEL,
    modelVersion: "v1.1.0",
    experimental: false,
    startedAt: "2026-04-19 10:10",
    durationSec: 90,
    status: "reviewed",
    days: [floodDay("IMG-054", "2026-04-18", floodWaterD3, 12.37, 10.4)],
    runBy: "نورة العتيبي",
    reviewer: "نورة العتيبي",
    reviewedAt: "2026-04-19 14:00",
    reviewNotes: "تمت المراجعة دون ملاحظات جوهرية.",
  },
  {
    id: "RUN-0017",
    incidentId: "INC-2026-007",
    imageIds: ["IMG-041"],
    model: FLOOD_MODEL,
    modelVersion: "v1.0.0",
    experimental: false,
    startedAt: "2026-03-06 09:00",
    durationSec: 64,
    status: "reviewed",
    days: [floodDay("IMG-041", "2026-03-05", floodWaterD3, 4.91, 4.1)],
    runBy: "فيصل الغامدي",
    reviewer: "فيصل الغامدي",
    reviewedAt: "2026-03-06 12:30",
    reviewNotes: "تمت المراجعة.",
  },
  {
    id: "RUN-0011",
    incidentId: "INC-2026-004",
    imageIds: ["IMG-030"],
    model: FIRE_MODEL,
    modelVersion: "v0.1.0",
    experimental: true,
    startedAt: "2026-02-11 13:40",
    durationSec: 70,
    status: "correction",
    days: [fireDay("IMG-030", "2026-02-10", fireBurn, 9.6, 7.8)],
    runBy: "فيصل الغامدي",
    reviewer: "فيصل الغامدي",
    reviewedAt: "2026-02-11 17:00",
    reviewNotes: "بدون صورة قبل الحدث، صُنّفت الصخور الداكنة كمناطق محروقة. يلزم رفع صورة قبل الحدث.",
  },
];

export const REPORTS: Report[] = [
  { id: "RPT-0021", type: "progress", incidentId: "INC-2026-018", runId: "RUN-0047", imageIds: ["IMG-101", "IMG-102", "IMG-103"], createdAt: "2026-11-08 21:30", createdBy: "نورة العتيبي" },
  { id: "RPT-0020", type: "disaster", incidentId: "INC-2026-018", runId: "RUN-0047", imageIds: ["IMG-103"], createdAt: "2026-11-08 21:20", createdBy: "نورة العتيبي" },
  { id: "RPT-0017", type: "progress", incidentId: "INC-2026-016", runId: "RUN-0039", imageIds: ["IMG-096", "IMG-097"], createdAt: "2026-09-24 16:10", createdBy: "فيصل الغامدي" },
  { id: "RPT-0016", type: "disaster", incidentId: "INC-2026-016", runId: "RUN-0039", imageIds: ["IMG-097"], createdAt: "2026-09-24 16:00", createdBy: "فيصل الغامدي" },
  { id: "RPT-0012", type: "disaster", incidentId: "INC-2026-012", runId: "RUN-0031", imageIds: ["IMG-072"], createdAt: "2026-07-12 17:00", createdBy: "نورة العتيبي" },
  { id: "RPT-0008", type: "disaster", incidentId: "INC-2026-010", runId: "RUN-0024", imageIds: ["IMG-054"], createdAt: "2026-04-19 15:00", createdBy: "نورة العتيبي" },
  { id: "RPT-0005", type: "disaster", incidentId: "INC-2026-007", runId: "RUN-0017", imageIds: ["IMG-041"], createdAt: "2026-03-06 13:00", createdBy: "فيصل الغامدي" },
];

export const USERS: User[] = [
  { id: "U-01", name: "عبدالله الشهري", email: "admin@mirsad.sa", role: "admin", active: true, lastLogin: "2026-11-08 08:12" },
  { id: "U-02", name: "نورة العتيبي", email: "n.alotaibi@mirsad.sa", role: "analyst", active: true, lastLogin: "2026-11-08 09:40" },
  { id: "U-03", name: "فيصل الغامدي", email: "f.alghamdi@mirsad.sa", role: "analyst", active: true, lastLogin: "2026-11-05 14:22" },
  { id: "U-04", name: "ريم الزهراني", email: "r.alzahrani@mirsad.sa", role: "analyst", active: false, lastLogin: "2026-08-19 11:03" },
  { id: "U-05", name: "خالد الحربي", email: "k.alharbi@mirsad.sa", role: "responder", active: true, lastLogin: "2026-11-07 17:55" },
  { id: "U-06", name: "منى الدوسري", email: "m.aldosari@mirsad.sa", role: "responder", active: true, lastLogin: "2026-10-28 07:30" },
];

export const DEMO_ACCOUNTS: Record<Role, { name: string; email: string }> = {
  analyst: { name: "نورة العتيبي", email: "n.alotaibi@mirsad.sa" },
  admin: { name: "عبدالله الشهري", email: "admin@mirsad.sa" },
  responder: { name: "خالد الحربي", email: "k.alharbi@mirsad.sa" },
};

/** Where each role lands after signing in. */
export const ROLE_HOME: Record<Role, "/dashboard" | "/users" | "/field"> = {
  analyst: "/dashboard",
  admin: "/users",
  responder: "/field",
};

/**
 * DEMO ONLY — stands in for the model output when the user runs an analysis in the
 * prototype. Returns one DayResult per analysed image (oldest first). For burned areas
 * the pre-event image is the reference and gets no DayResult of its own.
 */
export function simulateDays(type: IncidentType, images: GeoImage[]): DayResult[] {
  const sorted = [...images].sort((a, b) => a.acquisitionDate.localeCompare(b.acquisitionDate));
  if (type === "flood") {
    const presets = [
      { mask: floodWater, km2: 44.1, pct: 37.0 },
      { mask: floodWaterD2, km2: 32.81, pct: 27.5 },
      { mask: floodWaterD3, km2: 24.26, pct: 20.4 },
    ];
    return sorted.map((img, i) => {
      const p = presets[Math.min(i, presets.length - 1)]!;
      return floodDay(img.id, img.acquisitionDate, p.mask, p.km2, p.pct);
    });
  }
  const presets = [
    { mask: fireBurn, km2: 32.05, pct: 26.1 },
    { mask: fireBurnD2, km2: 37.37, pct: 30.4 },
  ];
  return sorted
    .filter((img) => img.imageRole !== "pre")
    .map((img, i) => {
      const p = presets[Math.min(i, presets.length - 1)]!;
      return fireDay(img.id, img.acquisitionDate, p.mask, p.km2, p.pct);
    });
}

/** Demo preview picture for a newly uploaded image. */
export function demoPreview(type: IncidentType, role: ImageRole) {
  if (type === "flood") return floodPost;
  return role === "pre" ? firePre : firePost;
}
