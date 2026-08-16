import { getPlanConfig } from "@/lib/subscription/planConfig";
import { PlanConfigForm } from "@/components/admin/PlanConfigForm";

export default async function AdminPlansPage() {
  const config = await getPlanConfig();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Plans &amp; Pricing</h1>
        <p className="text-sm text-slate-400">
          Changes here take effect immediately in the app&apos;s gating logic — no deploy needed.
        </p>
      </div>
      <PlanConfigForm initialConfig={config} />
    </div>
  );
}
