import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MapHero, OFFICIAL_ABOUT } from "@/components/site/sections";

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
    <SiteLayout dark>
      <MapHero />
      <section id="about" className="about-scene relative scroll-mt-20 py-16 text-navy-foreground">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">عن المشروع</h2>
          <div className="mx-auto mt-3 h-0.5 w-16 rounded bg-primary" />
          <div className="mt-8 space-y-5 text-base leading-loose text-navy-foreground/85 md:text-lg">
            {OFFICIAL_ABOUT.map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
