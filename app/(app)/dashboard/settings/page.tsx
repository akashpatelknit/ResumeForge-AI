"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import ProfileInfoCard from "@/components/settings/ProfileInfoCard";
import BillingCard from "@/components/settings/BillingCard";
import ConnectedAccountsCard from "@/components/settings/ConnectedAccountsCard";
import NotificationPreferencesCard from "@/components/settings/NotificationPreferencesCard";
import DangerZoneCard from "@/components/settings/DangerZoneCard";

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "billing", label: "Billing" },
  { id: "connected", label: "Connected Accounts" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
] as const;

// Every section lives on this one page, always rendered — the tab bar is a
// visual + scroll-to-section nav, not a content switcher (nothing here
// hides behind a tab).
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string>("profile");

  function goTo(id: string) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account, billing, and preferences.</p>
      </div>

      <div className="flex gap-6 overflow-x-auto border-b border-gray-200">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => goTo(section.id)}
            className={cn(
              "shrink-0 cursor-pointer border-b-2 px-0.5 pb-3 text-sm font-medium whitespace-nowrap transition-colors",
              activeSection === section.id
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div id="profile" className="scroll-mt-6">
          <ProfileInfoCard />
        </div>

        <div id="billing" className="scroll-mt-6">
          <BillingCard />
        </div>

        <div id="connected" className="scroll-mt-6">
          <ConnectedAccountsCard />
        </div>

        <div id="notifications" className="scroll-mt-6">
          <NotificationPreferencesCard />
        </div>

        <div id="security" className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Security</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Password, two-factor authentication, and active sessions management aren&apos;t built yet.
          </p>
        </div>

        <DangerZoneCard />
      </div>
    </div>
  );
}
