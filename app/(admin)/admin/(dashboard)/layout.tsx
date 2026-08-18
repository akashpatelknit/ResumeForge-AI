import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";

// Guards every route under this group (/admin, /admin/users,
// /admin/subscriptions, /admin/plans, /admin/templates) — /admin/login is
// a sibling outside this group, so it's never wrapped by this check.
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }

  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
