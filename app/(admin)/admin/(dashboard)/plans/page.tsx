import { getPlanConfig } from "@/lib/subscription/planConfig";
import { getPlatformConfig } from "@/lib/config/getPlatformConfig";
import { PlanConfigForm } from "@/components/admin/PlanConfigForm";
import { BillingConfigForm } from "@/components/admin/BillingConfigForm";

export default async function AdminPlansPage() {
  const [config, platformConfig] = await Promise.all([getPlanConfig(), getPlatformConfig()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-[28px]">Plans &amp; Pricing</h1>
        <p className="mt-1 text-sm text-gray-500">Configure subscription tiers and limits.</p>
      </div>
      <BillingConfigForm initialConfig={platformConfig} />
      <PlanConfigForm initialConfig={config} />
      <p className="text-xs text-gray-400">Changes here take effect immediately in the app&apos;s gating logic — no deploy needed.</p>
    </div>
  );
}
