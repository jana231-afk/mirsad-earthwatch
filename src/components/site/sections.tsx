import { lazy, Suspense, useState, type ReactNode } from "react";
import { ClientOnly, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft, ScanSearch, Layers, UploadCloud, Cpu, UserCheck, FileText, Waves, Flame, Hourglass, ShieldCheck, Map, Users, Target, AlertCircle, Mail, Send,
} from "lucide-react";
import heroBg from "@/assets/hero-terrain.jpg";
import heroMapAsset from "@/assets/hero-reference-map.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DemoTag, ExperimentalBadge } from "@/components/mirsad/bits";
import { AUTO_STATUS_RULE, ROLE_DESCRIPTIONS, ROLE_LABELS, UPCOMING_TYPES, type Role } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const DemoMapLeaflet = lazy(() => import("./DemoMapLeaflet"));

const HERO_FEATURES = [
  { icon: ScanSearch, title: "تحليل الصور", text: "باستخدام الذكاء الاصطناعي" },
  { icon: Layers, title: "خرائط جغرافية", text: "للمناطق المتأثرة" },
  { icon: FileText, title: "تقارير تقييم", text: "نتائج وإحصاءات واضحة" },
];

/** Home hero: headline, short description, two buttons, three highlights, and the reference map blended into a glowing scene. */
export function MapHero() {
  return (
    <section className="hero-scene relative overflow-hidden text-navy-foreground">
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0" />
      <div aria-hidden className="hero-glow pointer-events-none absolute inset-0" />
      <svg aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full" viewBox="0 0 1440 160" preserveAspectRatio="none" fill="none">
        <path d="M0 120 C 360 40, 720 160, 1080 80 S 1440 60, 1440 60" className="hero-wave" strokeWidth="1.5" />
        <path d="M0 140 C 400 70, 760 170, 1100 100 S 1440 90, 1440 90" className="hero-wave opacity-50" strokeWidth="1" />
      </svg>
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-4 px-4 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-6">
        <div className="px-2 lg:ps-6">
          <h1 className="text-3xl font-extrabold leading-[1.35] md:text-5xl md:leading-[1.3] xl:text-[3.5rem] xl:leading-[1.3]">رصد وتقييم الكوارث من الصور الجغرافية</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-muted">منصة لرسم وتقييم المناطق المتأثرة بالكوارث من الصور الجغرافية، وإصدار تقارير تقييم موثقة.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="hero-btn-primary"><Link to="/login">تسجيل الدخول</Link></Button>
            <Button asChild size="lg" variant="ghost" className="hero-btn-ghost border">
              <Link to="/" hash="about">عن المشروع</Link>
            </Button>
          </div>
          <ul className="mt-10 grid grid-cols-3 divide-x divide-x-reverse divide-primary/25">
            {HERO_FEATURES.map((f) => (
              <li key={f.title} className="group flex flex-col items-center gap-3 px-2 text-center">
                <span className="hero-icon grid h-16 w-16 place-items-center rounded-2xl transition-transform group-hover:-translate-y-1">
                  <f.icon className="h-7 w-7" />
                </span>
                <span className="text-sm font-bold md:text-base">{f.title}</span>
                <span className="text-xs text-navy-muted md:text-sm">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <img src={heroMapAsset.url} alt="منطقة متأثرة بحريق غابات وفيضان على صورة جغرافية" width={902} height={645}
          className="hero-fade relative h-auto w-full lg:-ms-10 lg:w-[calc(100%+2.5rem)]" />
      </div>
    </section>
  );
}

/** Official project description (provided by the team). */
export const OFFICIAL_ABOUT = [
  "مِرصاد هو منصة إلكترونية ذكية لرصد الكوارث وتقييم آثارها، تهدف إلى دعم قرارات الدفاع المدني وتسريع الاستجابة للفيضانات وحرائق الغابات.",
  "يحلل النظام الصور الجغرافية وصور الأقمار الصناعية لتحديد المناطق المتضررة ورسمها على خريطة تفاعلية، مع حساب المساحات ونسب الضرر واقتراح أولوية التدخل.",
  "كما يتيح متابعة تطور الكارثة من خلال مقارنة الصور عبر فترات زمنية مختلفة، وتنظيم الحوادث وتصنيفاتها، وإصدار تقارير جاهزة يراجعها المختص قبل اعتمادها.",
  "ويخدم مِرصاد ثلاث فئات رئيسية: محللي نظم المعلومات الجغرافية، ومديري النظام، والمستجيبين الميدانيين.",
];

export function Section({ title, kicker, more, children, muted }: { title: string; kicker?: string; more?: string; children: ReactNode; muted?: boolean }) {
  return (
    <section className={cn("py-16", muted && "bg-card")}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            {kicker && <div className="mb-2 text-sm font-semibold text-primary">{kicker}</div>}
            <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
          </div>
          {more && (
            <Link to={more} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              المزيد <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-deep text-navy-foreground">
      <img src={heroBg} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
      <div className="bg-login-overlay absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-36">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold leading-[1.3] md:text-5xl">رسم وتقييم الكوارث من الصور الجغرافية</h1>
          <p className="mt-5 text-lg leading-relaxed text-navy-foreground/85">
            يساعد مِرصاد محللي نظم المعلومات الجغرافية على تحديد المناطق المتأثرة بالفيضانات والحرائق وحساب مساحتها وإصدار تقارير تقييم واضحة.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-navy-line bg-transparent text-navy-foreground hover:bg-navy-line/60 hover:text-navy-foreground">
              <Link to="/about">تعرّف على المشروع</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutContent({ full }: { full?: boolean }) {
  const items = [
    { icon: AlertCircle, title: "المشكلة", text: "بعد الفيضانات والحرائق يصعب معرفة حجم المنطقة المتأثرة بسرعة، ويستغرق رسمها يدوياً من الصور وقتاً طويلاً." },
    { icon: Target, title: "الفكرة", text: "يرفع المحلل الصور الجغرافية للمنطقة، فيحدد النظام آلياً البكسلات المتأثرة ويعرضها على خريطة مع حساب المساحة بالكيلومتر المربع." },
    { icon: ShieldCheck, title: "الأهداف", text: "تسريع التقييم، وتوحيد طريقة الحساب، ومراجعة النتائج من محلل مختص قبل مشاركتها، وإصدار تقارير PDF موثقة." },
  ];
  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((i) => (
          <div key={i.title} className="rounded-lg border bg-card p-6 shadow-card">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-primary-soft text-primary"><i.icon className="h-5 w-5" /></div>
            <h3 className="font-semibold">{i.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.text}</p>
          </div>
        ))}
      </div>
      {full && (
        <div className="mt-8 rounded-lg border bg-card p-6 text-sm leading-loose text-muted-foreground">
          يركز على نوعين من الكوارث حالياً (الفيضانات والمناطق المحروقة)، وصُمم ليتسع لأنواع أخرى لاحقاً.
          النتائج تقديرات آلية تُراجع من محلل، ولا تمثل تحديداً للأضرار الفعلية على الأرض، ولا يقدم النظام تنبؤات أو مراقبة لحظية.
        </div>
      )}
    </>
  );
}

const STEPS = [
  { icon: UploadCloud, title: "رفع الصور", text: "يرفع المحلل صورة أو عدة صور بصيغة GeoTIFF للحالة، ويتحقق النظام من سلامتها وبياناتها." },
  { icon: Cpu, title: "التحليل الآلي", text: "يطبّق نموذج تقسيم على كل صورة لتحديد المناطق المتأثرة وحساب مساحتها ونسبتها." },
  { icon: UserCheck, title: "مراجعة المحلل", text: "يراجع المحلل النتيجة على الخريطة ويعتمدها أو يطلب تصحيحها." },
  { icon: FileText, title: "إصدار التقرير", text: "يصدر النظام تقرير الكارثة أو تقرير التطور اليومي بصيغة PDF." },
];

export function StepsContent() {
  return (
    <ol className="grid gap-5 md:grid-cols-4">
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative rounded-lg border bg-card p-6 shadow-card">
          <span className="ltr absolute end-5 top-5 font-mono text-3xl font-bold text-muted-foreground/25">0{i + 1}</span>
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-navy text-navy-foreground"><s.icon className="h-5 w-5" /></div>
          <h3 className="font-semibold">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function TypesContent() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <div className="rounded-lg border border-water/30 bg-card p-6 shadow-card">
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-water-soft text-water"><Waves className="h-5 w-5" /></div>
        <div className="flex items-center gap-2"><h3 className="font-semibold">الفيضانات</h3><span className="rounded bg-success-soft px-2 py-0.5 text-xs text-success">متاح</span></div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">تحديد المياه السطحية في الصور، وحساب المساحة المغمورة، ومقارنتها عبر عدة أيام لمتابعة الانحسار.</p>
      </div>
      <div className="rounded-lg border border-burn/30 bg-card p-6 shadow-card">
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-burn-soft text-burn"><Flame className="h-5 w-5" /></div>
        <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">الحرائق (المناطق المحروقة)</h3><ExperimentalBadge /></div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">مقارنة صورة قبل الحدث بصور بعده لتحديد المناطق المحروقة وحساب مساحتها.</p>
      </div>
      <div className="rounded-lg border border-dashed bg-muted/40 p-6">
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-secondary text-muted-foreground"><Hourglass className="h-5 w-5" /></div>
        <h3 className="font-semibold">كوارث أخرى – قيد التطوير</h3>
        <p className="mt-2 text-sm text-muted-foreground">صُمم النظام للكوارث عموماً، ومن الأنواع المخطط لها:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {UPCOMING_TYPES.map((t) => <span key={t} className="rounded-md border bg-card px-2 py-1 text-xs">{t}</span>)}
        </div>
      </div>
    </div>
  );
}

export function DemoMapContent({ height }: { height?: number | undefined }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-card">
      <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
        <DemoTag />
        <span className="flex items-center gap-2"><span className="h-3 w-4 rounded-sm bg-water" /> فيضان</span>
        <span className="flex items-center gap-2"><span className="h-3 w-4 rounded-sm bg-burn" /> حريق</span>
        <span className="text-xs text-muted-foreground">اضغط على أي منطقة لعرض تفاصيلها</span>
      </div>
      <ClientOnly fallback={<MapSkeleton height={height} />}>
        <Suspense fallback={<MapSkeleton height={height} />}>
          <DemoMapLeaflet height={height} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}

function MapSkeleton({ height = 460 }: { height?: number | undefined }) {
  return (
    <div style={{ height }} className="grid w-full place-items-center rounded-lg border bg-muted text-sm text-muted-foreground">
      <span className="flex items-center gap-2"><Map className="h-4 w-4" /> جارٍ تحميل الخريطة…</span>
    </div>
  );
}

export function RolesContent() {
  const roles: Role[] = ["admin", "analyst", "responder"];
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {roles.map((r) => (
        <div key={r} className="rounded-lg border bg-card p-6 shadow-card">
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-secondary text-navy"><Users className="h-5 w-5" /></div>
          <h3 className="font-semibold">{ROLE_LABELS[r]}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</p>
        </div>
      ))}
    </div>
  );
}

const FAQ = [
  { q: "ما هو مِرصاد؟", a: "نظام ويب لرسم وتقييم المناطق المتأثرة بالفيضانات والحرائق من الصور الجغرافية." },
  { q: "ما الصور التي يقبلها النظام؟", a: "يقبل ملفات GeoTIFF التي تحتوي على نظام إحداثيات. يمكن رفع صورة واحدة أو عدة صور معاً، ويجب أن يكون لكل صورة تاريخ التقاط." },
  { q: "هل يحدد النظام الأضرار الفعلية؟", a: "لا. يحدد النظام البكسلات التي تظهر فيها مياه أو آثار احتراق ويحسب مساحتها، ولا يقدّر أضرار المباني أو السكان أو عمق المياه." },
  { q: "كيف تُحدد حالة السجل نشطة أو مغلقة؟", a: AUTO_STATUS_RULE },
  { q: "من يمكنه رؤية النتائج؟", a: "يرى المحلل جميع النتائج، بينما يرى المستجيب الميداني النتائج المراجَعة فقط للحالات المصرح له بها." },
];

export function FaqContent({ count }: { count?: number }) {
  return (
    <Accordion type="single" collapsible className="rounded-lg border bg-card px-5 shadow-card">
      {FAQ.slice(0, count ?? FAQ.length).map((f, i) => (
        <AccordionItem key={f.q} value={`q${i}`} className={i === (count ?? FAQ.length) - 1 ? "border-b-0" : ""}>
          <AccordionTrigger className="text-start">{f.q}</AccordionTrigger>
          <AccordionContent className="leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

const TEAM = [
  { name: "سارة القحطاني", role: "تطوير الواجهات" },
  { name: "محمد العمري", role: "نماذج التحليل" },
  { name: "لمى الحارثي", role: "معالجة البيانات الجغرافية" },
  { name: "عمر باحاذق", role: "الخادم وقاعدة البيانات" },
];

export function ContactContent({ withForm }: { withForm?: boolean }) {
  const [v, setV] = useState({ name: "", email: "", message: "" });
  return (
    <div className={cn("grid gap-6", withForm && "lg:grid-cols-2")}>
      <div className="rounded-lg border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">فريق المشروع</h3>
          <DemoTag />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {TEAM.map((m) => (
            <li key={m.name} className="rounded-md border bg-muted/40 p-3">
              <div className="text-sm font-medium">{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.role}</div>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-1.5 text-sm text-muted-foreground">
          <p>المشرف: د. أحمد السبيعي</p>
          <p>كلية الحاسبات وتقنية المعلومات – جامعة (اسم تجريبي)</p>
          <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> <span className="ltr">contact@mirsad.sa</span></p>
        </div>
      </div>
      {withForm && (
        <form
          className="space-y-4 rounded-lg border bg-card p-6 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (!v.name.trim() || !v.email.trim() || !v.message.trim()) {
              toast.error("يرجى تعبئة جميع الحقول");
              return;
            }
            toast.success("تم استلام رسالتك (عرض تجريبي)");
            setV({ name: "", email: "", message: "" });
          }}
        >
          <h3 className="font-semibold">راسلنا</h3>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">الاسم</span>
            <input className="field" value={v.name} maxLength={100} onChange={(e) => setV({ ...v, name: e.target.value })} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">البريد الإلكتروني</span>
            <input className="field text-start" dir="ltr" type="email" value={v.email} maxLength={255} onChange={(e) => setV({ ...v, email: e.target.value })} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">الرسالة</span>
            <textarea className="field h-auto py-2" rows={5} value={v.message} maxLength={1000} onChange={(e) => setV({ ...v, message: e.target.value })} />
          </label>
          <Button type="submit"><Send className="rtl:-scale-x-100" /> إرسال</Button>
        </form>
      )}
    </div>
  );
}
