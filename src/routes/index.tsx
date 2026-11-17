import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MapHero, OFFICIAL_ABOUT, Section } from "@/components/site/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مِرصاد – رسم وتقييم الكوارث من الصور الجغرافية" },
      { name: "description", content: "منصة لتحديد المناطق المتأثرة بالفيضانات والحرائق من الصور الجغرافية وحساب مساحتها وإصدار تقارير PDF." },
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
      <MapHero />
      <Section title="عن المشروع">
        <div className="max-w-4xl space-y-4 rounded-lg border bg-card p-6 text-base leading-loose text-foreground/85 shadow-card">
          {OFFICIAL_ABOUT.map((p) => <p key={p}>{p}</p>)}
        </div>
      </Section>
    </SiteLayout>
  );
}
