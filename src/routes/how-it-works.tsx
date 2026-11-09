import { createFileRoute } from "@tanstack/react-router";
import { PageBand, SiteLayout } from "@/components/site/SiteLayout";
import { StepsContent } from "@/components/site/sections";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "كيف يعمل النظام · مِرصاد" },
      { name: "description", content: "من رفع الصور الجغرافية إلى إصدار تقرير التقييم في أربع خطوات واضحة." },
      { property: "og:title", content: "كيف يعمل النظام · مِرصاد" },
      { property: "og:description", content: "من رفع الصور الجغرافية إلى إصدار تقرير التقييم في أربع خطوات واضحة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageBand title="كيف يعمل النظام" subtitle="من رفع الصور الجغرافية إلى إصدار تقرير التقييم في أربع خطوات واضحة." />
      <div className="mx-auto max-w-7xl px-6 py-14"><StepsContent /></div>
    </SiteLayout>
  );
}
