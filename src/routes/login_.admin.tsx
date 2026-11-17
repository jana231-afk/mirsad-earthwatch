import { createFileRoute } from "@tanstack/react-router";
import { RoleLogin } from "@/components/site/RoleLogin";

export const Route = createFileRoute("/login_/admin")({
  head: () => ({
    meta: [
      { title: "دخول مدير النظام · مِرصاد" },
      { name: "description", content: "دخول مدير النظام لإدارة حسابات المستخدمين وأدوارهم." },
      { property: "og:title", content: "دخول مدير النظام · مِرصاد" },
      { property: "og:description", content: "دخول مدير النظام لإدارة حسابات المستخدمين وأدوارهم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <RoleLogin role="admin" />,
});
