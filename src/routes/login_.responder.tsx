import { createFileRoute } from "@tanstack/react-router";
import { RoleLogin } from "@/components/site/RoleLogin";

export const Route = createFileRoute("/login_/responder")({
  head: () => ({
    meta: [
      { title: "دخول مستجيب ميداني · مِرصاد" },
      { name: "description", content: "دخول المستجيب الميداني لعرض الحالات المصرح بها والنتائج المراجَعة." },
      { property: "og:title", content: "دخول مستجيب ميداني · مِرصاد" },
      { property: "og:description", content: "دخول المستجيب الميداني لعرض الحالات المصرح بها والنتائج المراجَعة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <RoleLogin role="responder" />,
});
