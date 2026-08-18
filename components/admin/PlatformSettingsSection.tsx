"use client";

import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

// Both switches are intentionally inert: neither maintenance-mode
// enforcement (blocking every route except /admin) nor a signups-disabled
// gate exists anywhere in the app yet, so flipping these wouldn't do
// anything real. Showing them as draggable-but-silently-no-op would be
// worse than showing them fixed at the state that's actually true right
// now (platform is not in maintenance; signups are open) with an
// explanation on click, rather than letting an admin believe they
// successfully locked the site down when they didn't.
export function PlatformSettingsSection() {
  function notWired(feature: string) {
    toast.info(`${feature} isn't wired up yet — coming in a follow-up pass.`);
  }

  return (
    <div className="divide-y divide-gray-100">
      <div className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Maintenance Mode</p>
          <p className="mt-0.5 text-sm text-gray-500">
            Put the platform in maintenance mode. Only admins will be able to access the application.
          </p>
        </div>
        <Switch checked={false} onCheckedChange={() => notWired("Maintenance mode")} />
      </div>

      <div className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">New User Signups</p>
          <p className="mt-0.5 text-sm text-gray-500">Allow new users to sign up and create accounts.</p>
        </div>
        <Switch checked={true} onCheckedChange={() => notWired("Disabling signups")} />
      </div>
    </div>
  );
}
