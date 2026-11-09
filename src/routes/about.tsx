import { createFileRoute } from "@tanstack/react-router";
import { PageBand, SiteLayout } from "@/components/site/SiteLayout";
import { AboutContent, RolesContent } from "@/components/site/sections";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "عن المشروع · مِرصاد" },
      { name: "description", content: "فكرة مِرصاد والمشكلة التي يعالجها وأهدافه، ومن يستخدم النظام." },
      { property: "og:title", content: "عن المشروع · مِرصاد" },
      { property: "og:description", content: "فكرة مِرصاد والمشكلة التي يعالجها وأهدافه، ومن يستخدم النظام." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageBand title="عن المشروع" subtitle="فكرة مِرصاد والمشكلة التي يعالجها وأهدافه، ومن يستخدم النظام." />
      <div className="mx-auto max-w-7xl px-6 py-14">
        <AboutContent full />
        <h2 className="mb-6 mt-14 text-2xl font-bold">المستخدمون</h2>
        <RolesContent />
      </div>
    </SiteLayout>
  );
}
