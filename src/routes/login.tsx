import { createFileRoute } from "@tanstack/react-router";
import { RoleLogin } from "@/components/site/RoleLogin";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول · مِرصاد" },
      { name: "description", content: "تسجيل الدخول إلى نظام مِرصاد لرسم وتقييم الكوارث." },
      { property: "og:title", content: "تسجيل الدخول · مِرصاد" },
      { property: "og:description", content: "الدخول إلى لوحة المحلل أو المدير أو المستجيب الميداني." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return <RoleLogin role="analyst" />;
}
