import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { AdminNav } from "@/components/admin/AdminNav";

// Guards every route under this group (/admin, /admin/users,
// /admin/subscriptions, /admin/plans, /admin/templates) — /admin/login is
// a sibling outside this group, so it's never wrapped by this check.
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminNav email={admin.email} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
