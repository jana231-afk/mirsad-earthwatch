import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AboutContent, ContactContent, DemoMapContent, FaqContent, Hero, RolesContent, Section, StepsContent, TypesContent } from "@/components/site/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مِرصاد – رسم وتقييم الكوارث من الصور الجغرافية" },
      { name: "description", content: "منصة مشروع تخرج لتحديد المناطق المتأثرة بالفيضانات والحرائق من الصور الجغرافية وحساب مساحتها وإصدار تقارير PDF." },
      { property: "og:title", content: "مِرصاد – رسم وتقييم الكوارث" },
      { property: "og:description", content: "تحليل آلي للصور الجغرافية، مراجعة المحلل، وتقارير تقييم للفيضانات والحرائق." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <Section title="عن المشروع" kicker="الفكرة والأهداف" more="/about"><AboutContent /></Section>
      <Section title="كيف يعمل النظام" kicker="أربع خطوات" more="/how-it-works" muted><StepsContent /></Section>
      <Section title="أنواع الكوارث" more="/disaster-types"><TypesContent /></Section>
      <Section title="خريطة تجريبية" more="/demo-map" muted><DemoMapContent height={420} /></Section>
      <Section title="المستخدمون"><RolesContent /></Section>
      <Section title="الأسئلة الشائعة" more="/faq" muted><FaqContent count={3} /></Section>
      <Section title="تواصل معنا" more="/contact"><ContactContent /></Section>
    </SiteLayout>
  );
}
