import { Crown, DollarSign, FileText, Users } from "lucide-react";
import { getAdminAnalytics } from "@/lib/admin/analytics";
import { getAdminUsers } from "@/lib/admin/clerkUsers";
import { DashboardUsersPreview } from "@/components/admin/DashboardUsersPreview";
import { StatCard } from "@/components/admin/StatCard";

// Distinct from the full /admin/users page's page size — this is a compact
// preview, not the primary place to browse the whole user base.
const DASHBOARD_USERS_PAGE_SIZE = 8;

export default async function AdminOverviewPage() {
  const [analytics, { users, total }] = await Promise.all([
    getAdminAnalytics(),
    getAdminUsers({ page: 1, pageSize: DASHBOARD_USERS_PAGE_SIZE }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-[28px]">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back! Here&apos;s what&apos;s happening with your platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={analytics.totalUsers.toLocaleString()}
          icon={Users}
          iconBg="bg-purple-100"
          iconColor="text-brand-purple"
          changePct={null}
          changeFallback="Synced live from Clerk"
        />
        <StatCard
          label="Pro Subscribers"
          value={analytics.proSubscribers.toLocaleString()}
          icon={Crown}
          iconBg="bg-purple-100"
          iconColor="text-brand-purple"
          changePct={analytics.proSubscribersChangePct}
        />
        <StatCard
          label="Monthly Revenue"
          value={`₹${analytics.mrrEstimateInr.toLocaleString("en-IN")}`}
          icon={DollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          changePct={analytics.mrrChangePct}
        />
        <StatCard
          label="Resumes Created"
          value={analytics.resumesThisMonth.toLocaleString()}
          icon={FileText}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          changePct={analytics.resumesChangePct}
        />
      </div>

      <DashboardUsersPreview initialUsers={users} initialTotal={total} pageSize={DASHBOARD_USERS_PAGE_SIZE} />
    </div>
  );
}
