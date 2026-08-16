import { getAdminSubscriptions } from "@/lib/admin/subscriptions";
import { SubscriptionsTable } from "@/components/admin/SubscriptionsTable";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await getAdminSubscriptions();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Subscriptions</h1>
        <p className="text-sm text-slate-400">
          Overriding a status here writes directly to our database for support purposes — it does not call Razorpay.
          A manually granted &quot;active&quot; user is not billed, and cancelling here does not cancel a real
          Razorpay subscription (do that in Razorpay&apos;s dashboard).
        </p>
      </div>
      <SubscriptionsTable initialSubscriptions={subscriptions} />
    </div>
  );
}
