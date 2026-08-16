import BillingSection from "@/components/settings/BillingSection";

// Linked from the sidebar's "Settings" nav item (components/shared/Sidebar.tsx)
// — that link pointed here before this page existed. Billing is the only
// section for now; other account settings can join it later.
export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account and billing</p>
      </div>

      <BillingSection />
    </div>
  );
}
