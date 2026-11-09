import { createFileRoute } from "@tanstack/react-router";
import { PageBand, SiteLayout } from "@/components/site/SiteLayout";
import { ContactContent } from "@/components/site/sections";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا · مِرصاد" },
      { name: "description", content: "فريق المشروع والجهة الأكاديمية ووسيلة التواصل." },
      { property: "og:title", content: "تواصل معنا · مِرصاد" },
      { property: "og:description", content: "فريق المشروع والجهة الأكاديمية ووسيلة التواصل." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageBand title="تواصل معنا" subtitle="فريق المشروع والجهة الأكاديمية ووسيلة التواصل." />
      <div className="mx-auto max-w-7xl px-6 py-14"><ContactContent withForm /></div>
    </SiteLayout>
  );
}
