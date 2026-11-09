import { createFileRoute } from "@tanstack/react-router";
import { PageBand, SiteLayout } from "@/components/site/SiteLayout";
import { TypesContent } from "@/components/site/sections";

export const Route = createFileRoute("/disaster-types")({
  head: () => ({
    meta: [
      { title: "أنواع الكوارث · مِرصاد" },
      { name: "description", content: "الكوارث المتاحة حالياً في النظام، والأنواع المخطط إضافتها مستقبلاً." },
      { property: "og:title", content: "أنواع الكوارث · مِرصاد" },
      { property: "og:description", content: "الكوارث المتاحة حالياً في النظام، والأنواع المخطط إضافتها مستقبلاً." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageBand title="أنواع الكوارث" subtitle="الكوارث المتاحة حالياً في النظام، والأنواع المخطط إضافتها مستقبلاً." />
      <div className="mx-auto max-w-7xl px-6 py-14"><TypesContent /></div>
    </SiteLayout>
  );
}
