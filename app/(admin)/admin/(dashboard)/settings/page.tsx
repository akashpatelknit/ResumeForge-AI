import { redirect } from "next/navigation";
import { Globe, Lock, User } from "lucide-react";
import { getAdminSession } from "@/lib/admin/session";
import { ChangePasswordDialog } from "@/components/admin/ChangePasswordDialog";
import { PlatformSettingsSection } from "@/components/admin/PlatformSettingsSection";
import { DangerZoneSection } from "@/components/admin/DangerZoneSection";

export default async function AdminSettingsPage() {
  // Layout already guards this route group, but the session is fetched
  // here too (cheap — a JWT verify against the cookie, no DB call) since
  // that's where the admin's own email comes from for the account card
  // below.
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-[28px]">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Admin account and platform configuration.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100">
            <User className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">Admin Account</p>
            <p className="text-sm text-gray-500">Manage your admin account credentials.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5">
              <span className="truncate text-sm text-gray-700">{admin.email}</span>
              <Lock className="h-4 w-4 shrink-0 text-gray-400" />
            </div>
          </div>
          <ChangePasswordDialog />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100">
            <Globe className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">Platform</p>
            <p className="text-sm text-gray-500">Configure platform-wide settings.</p>
          </div>
        </div>

        <div className="mt-2">
          <PlatformSettingsSection />
        </div>
      </div>

      <DangerZoneSection />
    </div>
  );
}
