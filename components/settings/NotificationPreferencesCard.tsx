"use client";

import { useState } from "react";
import { Bell, Calendar, FileText, Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Preference {
  id: string;
  icon: typeof Mail;
  title: string;
  description: string;
  defaultChecked: boolean;
}

const PREFERENCES: Preference[] = [
  {
    id: "reply",
    icon: Mail,
    title: "Email me when I get a reply",
    description: "Get notified when someone replies to your outreach",
    defaultChecked: true,
  },
  {
    id: "weekly-summary",
    icon: Calendar,
    title: "Weekly resume performance summary",
    description: "Receive a weekly summary of your resume's performance",
    defaultChecked: true,
  },
  {
    id: "product-updates",
    icon: Bell,
    title: "Product updates and tips",
    description: "Updates about new features and helpful tips",
    defaultChecked: false,
  },
  {
    id: "marketing",
    icon: FileText,
    title: "Marketing emails and offers",
    description: "Receive occasional updates about offers and promotions",
    defaultChecked: false,
  },
];

// Local UI state only — no backend exists for notification preferences yet
// (no schema field, no API route). Resets on refresh. Wiring this for real
// would mean picking a home for it, most naturally another namespaced key
// in UserPreferences.preferences (see app/api/user/profile/route.ts for
// the pattern this would follow).
export default function NotificationPreferencesCard() {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFERENCES.map((p) => [p.id, p.defaultChecked])),
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Notification Preferences</h2>

      <div className="divide-y divide-gray-100">
        {PREFERENCES.map((pref) => {
          const Icon = pref.icon;
          return (
            <div key={pref.id} className="flex items-center justify-between gap-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <Icon className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{pref.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{pref.description}</p>
                </div>
              </div>
              <Switch
                checked={checked[pref.id]}
                onCheckedChange={(value) => setChecked((prev) => ({ ...prev, [pref.id]: value }))}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        These preferences aren&apos;t saved yet — there&apos;s no backend for notification settings built.
      </p>
    </div>
  );
}
