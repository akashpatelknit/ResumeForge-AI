import { Clock, DollarSign, Users, X } from "lucide-react";
import { getAdminSubscriptionAnalytics, getAdminSubscriptions } from "@/lib/admin/subscriptions";
import { getPlanConfig } from "@/lib/subscription/planConfig";
import { SubscriptionsTable } from "@/components/admin/SubscriptionsTable";
import { StatCard } from "@/components/admin/StatCard";

export default async function AdminSubscriptionsPage() {
  const [analytics, subscriptions, planConfig] = await Promise.all([
    getAdminSubscriptionAnalytics(),
    getAdminSubscriptions(),
    getPlanConfig(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-[28px]">Subscriptions</h1>
        <p className="mt-1 text-sm text-gray-500">View and manage all user subscriptions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Subscriptions"
          value={analytics.activeCount.toLocaleString()}
          icon={Users}
          iconBg="bg-purple-100"
          iconColor="text-brand-purple"
          changePct={analytics.activeChangePct}
        />
        <StatCard
          label="Trialing"
          value={analytics.trialingCount.toLocaleString()}
          icon={Clock}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          changePct={analytics.trialingChangePct}
        />
        <StatCard
          label="Cancelled This Month"
          value={analytics.cancelledThisMonth.toLocaleString()}
          icon={X}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          changePct={analytics.cancelledChangePct}
        />
        <StatCard
          label="MRR"
          value={`₹${analytics.mrrInr.toLocaleString("en-IN")}`}
          icon={DollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          changePct={analytics.mrrChangePct}
        />
      </div>

      <SubscriptionsTable initialSubscriptions={subscriptions} proPriceInr={planConfig.proPriceInr} />

      <p className="text-xs text-gray-400">
        Overriding a status writes directly to our database for support purposes — it does not call Razorpay. A
        manually granted &quot;active&quot; user is not billed, and cancelling here does not cancel a real Razorpay
        subscription (do that in Razorpay&apos;s dashboard).
      </p>
    </div>
  );
}
