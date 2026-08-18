import { getPlanConfig } from "@/lib/subscription/planConfig";
import { PlanConfigForm } from "@/components/admin/PlanConfigForm";

export default async function AdminPlansPage() {
  const config = await getPlanConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-[28px]">Plans &amp; Pricing</h1>
        <p className="mt-1 text-sm text-gray-500">Configure subscription tiers and limits.</p>
      </div>
      <PlanConfigForm initialConfig={config} />
      <p className="text-xs text-gray-400">Changes here take effect immediately in the app&apos;s gating logic — no deploy needed.</p>
    </div>
  );
}
