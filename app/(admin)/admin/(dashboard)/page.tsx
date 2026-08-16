import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAnalytics } from "@/lib/admin/analytics";

export default async function AdminOverviewPage() {
  const analytics = await getAdminAnalytics();

  const stats = [
    { label: "Total users", value: analytics.totalUsers.toLocaleString() },
    { label: "Pro subscribers", value: analytics.proSubscribers.toLocaleString() },
    { label: "MRR estimate", value: `₹${analytics.mrrEstimateInr.toLocaleString("en-IN")}` },
    { label: "Resumes created this month", value: analytics.resumesThisMonth.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Overview</h1>
        <p className="text-sm text-slate-400">
          MRR is an estimate (Pro subscribers × the configured Pro price) — not a figure pulled from Razorpay.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-800 bg-slate-900">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-400">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-100">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
