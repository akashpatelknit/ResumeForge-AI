"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Github, Loader2, Mail } from "lucide-react";

type GmailStatusState =
  | { status: "loading" }
  | { status: "connected"; email: string }
  | { status: "reauth_required"; email: string }
  | { status: "not_connected" };

// Same GET /api/gmail/status the Send Scheduler page (app/(app)/dashboard/
// outreach/settings/page.tsx) and the Quick Apply modal already read — all
// three surfaces reflect the one real GmailAccount row, never drift apart.
// Note: the OAuth callback route still redirects back to
// /dashboard/outreach/settings (its existing SETTINGS_PATH, shared with
// that page) rather than here — deliberately left unchanged since that
// constant is shared infrastructure outside this page's scope. Coming back
// to this page afterward shows the same real, updated status either way.
function GmailRow() {
  const [gmail, setGmail] = useState<GmailStatusState>({ status: "loading" });
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/gmail/status");
      const data = await res.json();
      if (data.connected) {
        setGmail({ status: "connected", email: data.email });
      } else if (data.reason === "reauth_required") {
        setGmail({ status: "reauth_required", email: data.email });
      } else {
        setGmail({ status: "not_connected" });
      }
    } catch (error) {
      console.error("Failed to load Gmail connection status:", error);
      setGmail({ status: "not_connected" });
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  async function handleDisconnect() {
    setIsDisconnecting(true);
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Disconnect request failed");
      toast.success("Gmail disconnected.");
      await refetch();
    } catch (error) {
      console.error("Failed to disconnect Gmail:", error);
      toast.error("Failed to disconnect Gmail.");
    } finally {
      setIsDisconnecting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
          <Mail className="h-4.5 w-4.5 text-red-500" />
        </div>
        <div className="min-w-0">
          {gmail.status === "loading" ? (
            <p className="flex items-center gap-1.5 text-sm text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Checking connection…
            </p>
          ) : gmail.status === "not_connected" ? (
            <p className="text-sm font-medium text-gray-900">Not connected</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-medium text-gray-900">{gmail.email}</p>
              {gmail.status === "connected" ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  Expired
                </span>
              )}
            </div>
          )}
          <p className="mt-0.5 text-xs text-gray-500">Used for Cold Outreach email sending</p>
        </div>
      </div>

      {gmail.status === "connected" ? (
        <button
          type="button"
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDisconnecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Disconnect
        </button>
      ) : (
        <a
          href="/api/gmail/connect"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {gmail.status === "reauth_required" ? "Reconnect" : "Connect"}
        </a>
      )}
    </div>
  );
}

// Reads the OAuth callback's ?gmail= result if the user lands back here
// (they usually won't, since the callback still targets the Outreach
// settings page — see the comment on GmailRow above) and cleans the param
// off the URL either way.
function GmailOAuthResultBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const result = searchParams.get("gmail");
    if (!result) return;
    if (result === "connected") toast.success("Gmail connected.");
    else if (result === "denied") toast.info("Gmail connection was cancelled.");
    else toast.error("Failed to connect Gmail. Please try again.");
    router.replace("/dashboard/settings", { scroll: false });
  }, [searchParams, router]);

  return null;
}

export default function ConnectedAccountsCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Suspense fallback={null}>
        <GmailOAuthResultBanner />
      </Suspense>

      <h2 className="mb-1 text-lg font-bold text-gray-900">Connected Accounts</h2>

      <div className="divide-y divide-gray-100">
        <GmailRow />

        {/* Mock/placeholder — GitHub has no persistent "connected account"
            concept anywhere in the app today. lib/github.ts only does
            unauthenticated public-repo lookups by username (used by the
            resume builder's one-off import modal); there's no OAuth app,
            no token storage model, nothing to wire this to yet. */}
        <div className="flex flex-col gap-3 bg-gray-50/60 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900">
              <Github className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">GitHub</p>
              <p className="mt-0.5 text-xs text-gray-500">Import repositories as project entries</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              toast.info("GitHub account connection isn't built yet — coming in a follow-up pass.")
            }
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
