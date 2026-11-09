import { createFileRoute } from "@tanstack/react-router";
import { PageBand, SiteLayout } from "@/components/site/SiteLayout";
import { DemoMapContent } from "@/components/site/sections";

export const Route = createFileRoute("/demo-map")({
  head: () => ({
    meta: [
      { title: "خريطة تجريبية · مِرصاد" },
      { name: "description", content: "خريطة توضيحية لمناطق متأثرة ببيانات تجريبية من حالات فيضانات وحرائق." },
      { property: "og:title", content: "خريطة تجريبية · مِرصاد" },
      { property: "og:description", content: "خريطة توضيحية لمناطق متأثرة ببيانات تجريبية من حالات فيضانات وحرائق." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageBand title="خريطة تجريبية" subtitle="خريطة توضيحية لمناطق متأثرة ببيانات تجريبية من حالات فيضانات وحرائق." />
      <div className="mx-auto max-w-7xl px-6 py-14"><DemoMapContent height={560} /></div>
    </SiteLayout>
  );
}
