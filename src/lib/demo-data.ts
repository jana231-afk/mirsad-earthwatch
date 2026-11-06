/**
 * DEMO DATA — all records below are fictional sample data used to illustrate
 * the MIRSAD interface. In the real system these come from the Flask + SQLite backend.
 */
import floodPost from "@/assets/flood-post.jpg";
import floodWater from "@/assets/flood-water-mask.png";
import floodNodata from "@/assets/flood-nodata-mask.png";
import firePre from "@/assets/fire-pre.jpg";
import firePost from "@/assets/fire-post.jpg";
import fireBurn from "@/assets/fire-burn-mask.png";

export type Role = "admin" | "analyst" | "responder";
export type IncidentType = "flood" | "fire";
export type IncidentStatus = "open" | "closed";
export type RunStatus = "reviewed" | "pending" | "correction" | "processing" | "failed";
export type ImageRole = "post-event" | "pre-event" | "single";
export type ValidationStatus = "valid" | "warning" | "unsupported";

export interface Incident {
  id: string;
  name: string;
  nameEn: string;
  type: IncidentType;
  location: string;
  region: string;
  date: string;
  status: IncidentStatus;
  description: string;
  createdBy: string;
  sharedWithResponders: boolean;
}

export interface SatImage {
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

export interface AnalysisRun {
  id: string;
  incidentId: string;
  imageIds: string[];
  model: string;
  modelVersion: string;
  experimental: boolean;
  startedAt: string;
  durationSec: number;
  status: RunStatus;
  affectedKm2: number;
  affectedPct: number;
  validKm2: number;
  nodataKm2: number;
  runBy: string;
  reviewer?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  layers: { base: string; mask: string; nodata?: string; pre?: string };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastLogin: string;
}

export const FLOOD_MODEL = "U-Net Flood Segmentation";
export const FIRE_MODEL = "U-Net Burned-Area Segmentation";

export const ROLE_LABELS: Record<Role, { ar: string; en: string }> = {
  admin: { ar: "مدير النظام", en: "System Administrator" },
  analyst: { ar: "محلل نظم معلومات جغرافية", en: "GIS Analyst" },
  responder: { ar: "مستجيب ميداني", en: "Field Responder" },
};

export const TYPE_LABELS: Record<IncidentType, { ar: string; en: string }> = {
  flood: { ar: "فيضان / سيول", en: "Flood" },
  fire: { ar: "حريق / منطقة محترقة", en: "Fire" },
};

export const RUN_STATUS_LABELS: Record<RunStatus, { ar: string; en: string }> = {
  reviewed: { ar: "تمت المراجعة", en: "Reviewed" },
  pending: { ar: "بانتظار المراجعة", en: "Pending review" },
  correction: { ar: "يحتاج تصحيح", en: "Needs correction" },
  processing: { ar: "قيد المعالجة", en: "Processing" },
  failed: { ar: "فشل التحليل", en: "Failed" },
};

export const IMAGE_ROLE_LABELS: Record<ImageRole, string> = {
  "post-event": "بعد الحدث · Post-event",
  "pre-event": "قبل الحدث · Pre-event",
  single: "صورة واحدة · Single",
};

export const SENSORS = [
  "Sentinel-2 MSI",
  "Sentinel-1 SAR (VV/VH)",
  "Landsat 8/9 OLI",
  "غير معروف · Unknown",
];

export const INCIDENTS: Incident[] = [
  {
    id: "INC-2026-019",
    name: "سيول وادي الأخضر",
    nameEn: "Wadi Al-Akhdar Floods",
    type: "flood",
    location: "تبوك",
    region: "منطقة تبوك",
    date: "2026-11-02",
    status: "open",
    description: "أمطار غزيرة أدت إلى جريان الوادي وتجمع المياه في الأراضي الزراعية المجاورة. بانتظار رفع صور القمر الصناعي.",
    createdBy: "نورة العتيبي",
    sharedWithResponders: false,
  },
  {
    id: "INC-2026-018",
    name: "سيول وادي فاطمة",
    nameEn: "Wadi Fatimah Floods",
    type: "flood",
    location: "الجموم، مكة المكرمة",
    region: "منطقة مكة المكرمة",
    date: "2026-10-22",
    status: "open",
    description: "جريان سيول وادي فاطمة بعد أمطار غزيرة استمرت 6 ساعات، مع غمر أجزاء من المزارع والطرق الفرعية شمال الجموم.",
    createdBy: "نورة العتيبي",
    sharedWithResponders: true,
  },
  {
    id: "INC-2026-016",
    name: "حريق غابات السودة",
    nameEn: "Al-Soudah Forest Fire",
    type: "fire",
    location: "السودة، أبها",
    region: "منطقة عسير",
    date: "2026-09-14",
    status: "open",
    description: "حريق في غطاء أشجار العرعر على المنحدرات الجنوبية الغربية. تم إخماده بعد يومين، والمطلوب تقدير المساحة المحترقة.",
    createdBy: "فيصل الغامدي",
    sharedWithResponders: true,
  },
  {
    id: "INC-2026-015",
    name: "سيول صبيا",
    nameEn: "Sabya Floods",
    type: "flood",
    location: "صبيا، جازان",
    region: "منطقة جازان",
    date: "2026-08-30",
    status: "open",
    description: "ارتفاع منسوب وادي صبيا وتجمع المياه في المناطق المنخفضة شرق المدينة.",
    createdBy: "فيصل الغامدي",
    sharedWithResponders: false,
  },
  {
    id: "INC-2026-012",
    name: "حريق غابة رغدان",
    nameEn: "Raghadan Forest Fire",
    type: "fire",
    location: "رغدان، الباحة",
    region: "منطقة الباحة",
    date: "2026-07-11",
    status: "closed",
    description: "حريق محدود في الأطراف الشمالية لغابة رغدان.",
    createdBy: "نورة العتيبي",
    sharedWithResponders: true,
  },
  {
    id: "INC-2026-010",
    name: "سيول شرق جدة",
    nameEn: "East Jeddah Floods",
    type: "flood",
    location: "شرق الخط السريع، جدة",
    region: "منطقة مكة المكرمة",
    date: "2026-04-17",
    status: "closed",
    description: "تجمع مياه الأمطار في الأحياء الواقعة شرق طريق الحرمين.",
    createdBy: "نورة العتيبي",
    sharedWithResponders: true,
  },
  {
    id: "INC-2026-007",
    name: "فيضان وادي حنيفة",
    nameEn: "Wadi Hanifa Flooding",
    type: "flood",
    location: "العمارية، الرياض",
    region: "منطقة الرياض",
    date: "2026-03-05",
    status: "closed",
    description: "جريان وادي حنيفة وغمر أجزاء من الممرات والمزارع على ضفتيه.",
    createdBy: "فيصل الغامدي",
    sharedWithResponders: false,
  },
  {
    id: "INC-2026-004",
    name: "حريق مراعي الشفا",
    nameEn: "Al-Shafa Rangeland Fire",
    type: "fire",
    location: "الشفا، الطائف",
    region: "منطقة مكة المكرمة",
    date: "2026-02-09",
    status: "closed",
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
  extra: Partial<SatImage> = {},
): SatImage => ({
  id,
  incidentId,
  fileName,
  sizeMB: 186.4,
  sensor: "Sentinel-2 MSI",
  imageRole: "post-event",
  acquisitionDate,
  acquisitionDateSource: "metadata",
  crs: "EPSG:32637 — WGS 84 / UTM zone 37N",
  width: 1280,
  height: 960,
  bands: 4,
  resolution: "10 m",
  nodata: "0 (≈3.0% من البكسلات)",
  status: "warning",
  warnings: ["تحتوي الصورة على منطقة NoData في الزاوية الجنوبية الشرقية (≈3.0%) — ستُستبعد من حساب المساحة."],
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
  extra: Partial<SatImage> = {},
): SatImage => ({
  id,
  incidentId,
  fileName,
  sizeMB: 212.7,
  sensor: "Sentinel-2 MSI",
  imageRole,
  acquisitionDate,
  acquisitionDateSource: "metadata",
  crs: "EPSG:32638 — WGS 84 / UTM zone 38N",
  width: 1280,
  height: 960,
  bands: 6,
  resolution: "10 m",
  nodata: "غير محددة · Not set",
  status: "valid",
  warnings: [],
  uploadedAt: acquisitionDate,
  preview: imageRole === "pre-event" ? firePre : firePost,
  ...extra,
});

export const IMAGES: SatImage[] = [
  floodImg("IMG-101", "INC-2026-018", "S2B_MSIL2A_20261023_T37QDD_wadifatimah.tif", "2026-10-23"),
  floodImg("IMG-102", "INC-2026-018", "S1A_IW_GRDH_20261024_VV_jamoum.tif", "2026-10-24", {
    sensor: "Sentinel-1 SAR (VV/VH)",
    sizeMB: 142.1,
    bands: 2,
    acquisitionDateSource: "manual",
    nodata: "غير محددة · Not set",
    warnings: [
      "تاريخ الالتقاط غير موجود في البيانات الوصفية — تم إدخاله يدوياً.",
      "قيمة NoData غير معرّفة في الملف — يُفترض عدم وجود بكسلات فارغة.",
    ],
  }),
  fireImg("IMG-095", "INC-2026-016", "S2A_MSIL2A_20260908_T38QLA_soudah_pre.tif", "pre-event", "2026-09-08"),
  fireImg("IMG-096", "INC-2026-016", "S2A_MSIL2A_20260919_T38QLA_soudah_post.tif", "post-event", "2026-09-19"),
  floodImg("IMG-088", "INC-2026-015", "S2A_MSIL2A_20260901_T38PKB_sabya.tif", "2026-09-01", {
    crs: "EPSG:32638 — WGS 84 / UTM zone 38N",
  }),
  fireImg("IMG-071", "INC-2026-012", "S2B_MSIL2A_20260706_T38QKD_raghadan_pre.tif", "pre-event", "2026-07-06"),
  fireImg("IMG-072", "INC-2026-012", "S2B_MSIL2A_20260716_T38QKD_raghadan_post.tif", "post-event", "2026-07-16"),
  floodImg("IMG-054", "INC-2026-010", "S2A_MSIL2A_20260418_T37QCE_jeddah.tif", "2026-04-18"),
  floodImg("IMG-041", "INC-2026-007", "LC09_L2SP_20260306_riyadh_hanifa.tif", "2026-03-06", {
    sensor: "Landsat 8/9 OLI",
    resolution: "30 m",
    crs: "EPSG:32638 — WGS 84 / UTM zone 38N",
  }),
  fireImg("IMG-030", "INC-2026-004", "S2B_MSIL2A_20260212_T37QEC_shafa_post.tif", "post-event", "2026-02-12", {
    warnings: ["لا توجد صورة قبل الحدث — سيتم التحليل على صورة ما بعد الحدث فقط."],
    status: "warning",
  }),
];

const floodLayers = { base: floodPost, mask: floodWater, nodata: floodNodata };
const fireLayers = { base: firePost, mask: fireBurn, pre: firePre };

export const RUNS: AnalysisRun[] = [
  {
    id: "RUN-0046",
    incidentId: "INC-2026-018",
    imageIds: ["IMG-102"],
    model: FLOOD_MODEL,
    modelVersion: "v1.2.0",
    experimental: false,
    startedAt: "2026-10-25 10:42",
    durationSec: 96,
    status: "pending",
    affectedKm2: 41.86,
    affectedPct: 34.07,
    validKm2: 122.88,
    nodataKm2: 0,
    runBy: "نورة العتيبي",
    layers: floodLayers,
  },
  {
    id: "RUN-0042",
    incidentId: "INC-2026-018",
    imageIds: ["IMG-101"],
    model: FLOOD_MODEL,
    modelVersion: "v1.2.0",
    experimental: false,
    startedAt: "2026-10-24 09:15",
    durationSec: 88,
    status: "reviewed",
    affectedKm2: 44.1,
    affectedPct: 36.99,
    validKm2: 119.21,
    nodataKm2: 3.67,
    runBy: "نورة العتيبي",
    reviewer: "نورة العتيبي",
    reviewedAt: "2026-10-24 13:30",
    reviewNotes: "النتيجة متوافقة مع الصورة الأصلية. توجد بقع صغيرة مصنفة كمياه على المرتفعات الجنوبية (ظلال) ولا تؤثر جوهرياً على المساحة الإجمالية.",
    layers: floodLayers,
  },
  {
    id: "RUN-0041",
    incidentId: "INC-2026-018",
    imageIds: ["IMG-101"],
    model: FLOOD_MODEL,
    modelVersion: "v1.1.0",
    experimental: false,
    startedAt: "2026-10-23 18:02",
    durationSec: 91,
    status: "correction",
    affectedKm2: 51.34,
    affectedPct: 43.07,
    validKm2: 119.21,
    nodataKm2: 3.67,
    runBy: "نورة العتيبي",
    reviewer: "نورة العتيبي",
    reviewedAt: "2026-10-23 20:10",
    reviewNotes: "النموذج صنّف ظلال الجبال كمياه بشكل واسع. يُعاد التشغيل بالإصدار v1.2.0.",
    layers: floodLayers,
  },
  {
    id: "RUN-0039",
    incidentId: "INC-2026-016",
    imageIds: ["IMG-095", "IMG-096"],
    model: FIRE_MODEL,
    modelVersion: "v0.3.0-exp",
    experimental: true,
    startedAt: "2026-09-20 11:20",
    durationSec: 134,
    status: "reviewed",
    affectedKm2: 32.05,
    affectedPct: 26.09,
    validKm2: 122.88,
    nodataKm2: 0,
    runBy: "فيصل الغامدي",
    reviewer: "فيصل الغامدي",
    reviewedAt: "2026-09-20 15:45",
    reviewNotes: "حدود المنطقة المحترقة واضحة ومطابقة للفرق بين صورتي ما قبل وما بعد الحدث. نتيجة تجريبية.",
    layers: fireLayers,
  },
  {
    id: "RUN-0037",
    incidentId: "INC-2026-015",
    imageIds: ["IMG-088"],
    model: FLOOD_MODEL,
    modelVersion: "v1.2.0",
    experimental: false,
    startedAt: "2026-09-02 08:30",
    durationSec: 85,
    status: "pending",
    affectedKm2: 18.42,
    affectedPct: 15.45,
    validKm2: 119.21,
    nodataKm2: 3.67,
    runBy: "فيصل الغامدي",
    layers: floodLayers,
  },
  {
    id: "RUN-0031",
    incidentId: "INC-2026-012",
    imageIds: ["IMG-071", "IMG-072"],
    model: FIRE_MODEL,
    modelVersion: "v0.2.1-exp",
    experimental: true,
    startedAt: "2026-07-17 12:05",
    durationSec: 128,
    status: "reviewed",
    affectedKm2: 6.84,
    affectedPct: 5.57,
    validKm2: 122.88,
    nodataKm2: 0,
    runBy: "نورة العتيبي",
    reviewer: "نورة العتيبي",
    reviewedAt: "2026-07-17 16:20",
    reviewNotes: "نتيجة تجريبية مقبولة.",
    layers: fireLayers,
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
    affectedKm2: 12.37,
    affectedPct: 10.38,
    validKm2: 119.21,
    nodataKm2: 3.67,
    runBy: "نورة العتيبي",
    reviewer: "نورة العتيبي",
    reviewedAt: "2026-04-19 14:00",
    reviewNotes: "تمت المراجعة.",
    layers: floodLayers,
  },
  {
    id: "RUN-0017",
    incidentId: "INC-2026-007",
    imageIds: ["IMG-041"],
    model: FLOOD_MODEL,
    modelVersion: "v1.0.0",
    experimental: false,
    startedAt: "2026-03-07 09:00",
    durationSec: 64,
    status: "reviewed",
    affectedKm2: 4.91,
    affectedPct: 4.12,
    validKm2: 119.21,
    nodataKm2: 3.67,
    runBy: "فيصل الغامدي",
    reviewer: "فيصل الغامدي",
    reviewedAt: "2026-03-07 12:30",
    reviewNotes: "تمت المراجعة.",
    layers: floodLayers,
  },
  {
    id: "RUN-0011",
    incidentId: "INC-2026-004",
    imageIds: ["IMG-030"],
    model: FIRE_MODEL,
    modelVersion: "v0.1.0-exp",
    experimental: true,
    startedAt: "2026-02-13 13:40",
    durationSec: 70,
    status: "correction",
    affectedKm2: 9.6,
    affectedPct: 7.81,
    validKm2: 122.88,
    nodataKm2: 0,
    runBy: "فيصل الغامدي",
    reviewer: "فيصل الغامدي",
    reviewedAt: "2026-02-13 17:00",
    reviewNotes: "بدون صورة قبل الحدث، صُنّفت الصخور الداكنة كمناطق محترقة. يلزم رفع صورة قبل الحدث.",
    layers: fireLayers,
  },
];

export const USERS: User[] = [
  { id: "U-01", name: "عبدالله الشهري", email: "admin@mirsad.sa", role: "admin", active: true, lastLogin: "2026-11-06 08:12" },
  { id: "U-02", name: "نورة العتيبي", email: "n.alotaibi@mirsad.sa", role: "analyst", active: true, lastLogin: "2026-11-06 09:40" },
  { id: "U-03", name: "فيصل الغامدي", email: "f.alghamdi@mirsad.sa", role: "analyst", active: true, lastLogin: "2026-11-05 14:22" },
  { id: "U-04", name: "ريم الزهراني", email: "r.alzahrani@mirsad.sa", role: "analyst", active: false, lastLogin: "2026-08-19 11:03" },
  { id: "U-05", name: "خالد الحربي", email: "k.alharbi@mirsad.sa", role: "responder", active: true, lastLogin: "2026-11-04 17:55" },
  { id: "U-06", name: "منى الدوسري", email: "m.aldosari@mirsad.sa", role: "responder", active: true, lastLogin: "2026-10-28 07:30" },
];

export const DEMO_ACCOUNTS: Record<Role, { name: string; email: string }> = {
  analyst: { name: "نورة العتيبي", email: "n.alotaibi@mirsad.sa" },
  admin: { name: "عبدالله الشهري", email: "admin@mirsad.sa" },
  responder: { name: "خالد الحربي", email: "k.alharbi@mirsad.sa" },
};

export function formatKm2(v: number) {
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
