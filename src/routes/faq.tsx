import { createFileRoute } from "@tanstack/react-router";
import { PageBand, SiteLayout } from "@/components/site/SiteLayout";
import { FaqContent } from "@/components/site/sections";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "الأسئلة الشائعة · مِرصاد" },
      { name: "description", content: "إجابات مختصرة عن أكثر الأسئلة شيوعاً حول مِرصاد." },
      { property: "og:title", content: "الأسئلة الشائعة · مِرصاد" },
      { property: "og:description", content: "إجابات مختصرة عن أكثر الأسئلة شيوعاً حول مِرصاد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageBand title="الأسئلة الشائعة" subtitle="إجابات مختصرة عن أكثر الأسئلة شيوعاً حول مِرصاد." />
      <div className="mx-auto max-w-7xl px-6 py-14"><FaqContent /></div>
    </SiteLayout>
  );
}
