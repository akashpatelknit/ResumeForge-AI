"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarCheck,
  Check,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
  Loader2,
  Mail,
  Minus,
  MoreVertical,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompanyLogo, OutreachTypeBadge } from "@/components/outreach/OutreachBadges";
import type { OutreachEntry, OutreachType } from "@/components/outreach/outreachData";

const notWiredYet = () => toast.info("Not wired up yet — coming in a follow-up pass.");

interface SendingWindowPreset {
  label: string;
  // "now" is resolved to the current clock time at the moment the preset is
  // clicked — a one-time snapshot written into the same "hh:mm AM/PM" state
  // as every other preset, not a live-updating value. UserOutreachSettings
  // only ever stores a fixed daily start time, so "start now" means "start
  // from whatever time it is right now, every day" once saved.
  start: string | "now";
  end: string;
}

const SENDING_WINDOW_PRESETS: SendingWindowPreset[] = [
  { label: "Start Now", start: "now", end: "11:59 PM" },
  { label: "6 AM – 9 AM", start: "06:00 AM", end: "09:00 AM" },
  { label: "9 AM – 12 PM", start: "09:00 AM", end: "12:00 PM" },
  { label: "9 AM – 5 PM", start: "09:00 AM", end: "05:00 PM" },
  { label: "9 AM – 6 PM", start: "09:00 AM", end: "06:00 PM" },
  { label: "12 PM – 5 PM", start: "12:00 PM", end: "05:00 PM" },
  { label: "3 PM – 8 PM", start: "03:00 PM", end: "08:00 PM" },
  { label: "6 AM – 10 PM", start: "06:00 AM", end: "10:00 PM" },
  // { label: "8 PM – 11:59 PM", start: "08:00 PM", end: "11:59 PM" },
];

function formatNowAsTime12(): string {
  const now = new Date();
  const period = now.getHours() < 12 ? "AM" : "PM";
  const hour12 = now.getHours() % 12 === 0 ? 12 : now.getHours() % 12;
  return `${String(hour12).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${period}`;
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="flex h-8 min-w-14 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-2 text-sm font-semibold text-gray-900">
        {value}
      </span>
      <span className="text-xs text-gray-400">{suffix}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Increase"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

const TICKS = [5, 10, 15, 20, 30, 40];

const TYPE_RULES: {
  type: OutreachType;
  description: string;
  icon: typeof Mail;
  defaultLimit: number | null;
}[] = [
  { type: "cold", description: "Personalized emails using job descriptions.", icon: Mail, defaultLimit: 10 },
  { type: "general", description: "Generalized outreach without a specific JD.", icon: Mail, defaultLimit: 10 },
  { type: "referral", description: "Emails asking for referrals (use lower volume).", icon: Users, defaultLimit: 5 },
  { type: "quickApply", description: "One-off applications (manual send recommended).", icon: Zap, defaultLimit: null },
];

function formatQueueTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatRelative(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return "due now";
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `in ${mins} min`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) return remMins > 0 ? `in ${hours}h ${remMins}m` : `in ${hours}h`;
  const days = Math.floor(hours / 24);
  return `in ${days}d`;
}

const SWITCH_PURPLE =
  "data-[state=checked]:bg-brand-purple data-[state=unchecked]:bg-gray-200";

type GmailStatusState =
  | { status: "loading" }
  | { status: "connected"; email: string; connectedAt: string }
  | { status: "reauth_required"; email: string }
  | { status: "not_connected" };

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Bridges the OAuth redirect (app/api/gmail/callback/route.ts lands back
// here with ?gmail=connected|denied|error) to a toast + a fresh status
// fetch — same `?highlight=`-on-a-page pattern as
// app/(app)/dashboard/page.tsx. Needs its own Suspense boundary since
// useSearchParams requires one.
function GmailOAuthResultHandler({ onResult }: { onResult: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const result = searchParams.get("gmail");
    if (!result) return;

    if (result === "connected") toast.success("Gmail connected.");
    else if (result === "denied") toast.info("Gmail connection was cancelled.");
    else toast.error("Failed to connect Gmail. Please try again.");

    onResult();
    router.replace("/dashboard/outreach/settings", { scroll: false });
  }, [searchParams, router, onResult]);

  return null;
}

export default function SendSchedulerPage() {
  const [dailyLimit, setDailyLimit] = useState(15);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("06:00 PM");
  const [activeWindowPreset, setActiveWindowPreset] = useState<string | null>("9 AM – 6 PM");
  const [weekdaysOnly, setWeekdaysOnly] = useState(true);
  const [jitterEnabled, setJitterEnabled] = useState(true);
  const [jitterMinSeconds, setJitterMinSeconds] = useState(30);
  const [jitterMaxSeconds, setJitterMaxSeconds] = useState(300);
  const [typeLimits, setTypeLimits] = useState<Record<OutreachType, number | null>>(
    Object.fromEntries(TYPE_RULES.map((r) => [r.type, r.defaultLimit])) as Record<OutreachType, number | null>,
  );
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [queueRows, setQueueRows] = useState<OutreachEntry[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);

  const [gmail, setGmail] = useState<GmailStatusState>({ status: "loading" });
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/outreach/settings");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to load your scheduler settings.");
        return;
      }
      setDailyLimit(data.dailySendLimit);
      setStartTime(data.sendWindowStart);
      setEndTime(data.sendWindowEnd);
      // "Start Now" is never itself persisted (it's resolved to a literal
      // clock time when clicked) — only match against the fixed presets.
      const matched = SENDING_WINDOW_PRESETS.find(
        (p) => p.start !== "now" && p.start === data.sendWindowStart && p.end === data.sendWindowEnd,
      );
      setActiveWindowPreset(matched?.label ?? null);
      setWeekdaysOnly(data.weekdaysOnly);
      setJitterEnabled(data.jitterEnabled);
      setJitterMinSeconds(data.jitterMinSeconds);
      setJitterMaxSeconds(data.jitterMaxSeconds);
    } catch (error) {
      console.error("Failed to load outreach settings:", error);
      toast.error("Network error loading your scheduler settings.");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const fetchQueuePreview = useCallback(async () => {
    setQueueLoading(true);
    try {
      const res = await fetch("/api/outreach/queue");
      const data = await res.json();
      if (!res.ok) return;
      const scheduled = (data.entries as OutreachEntry[])
        .filter((e) => e.status === "scheduled" && e.scheduledSendTime)
        .sort((a, b) => new Date(a.scheduledSendTime!).getTime() - new Date(b.scheduledSendTime!).getTime())
        .slice(0, 8);
      setQueueRows(scheduled);
    } catch (error) {
      console.error("Failed to load send queue preview:", error);
    } finally {
      setQueueLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQueuePreview();
  }, [fetchQueuePreview]);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      const res = await fetch("/api/outreach/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailySendLimit: dailyLimit,
          sendWindowStart: startTime,
          sendWindowEnd: endTime,
          weekdaysOnly,
          jitterEnabled,
          jitterMinSeconds,
          jitterMaxSeconds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save settings.");
        return;
      }
      toast.success("Settings saved.");
      await fetchQueuePreview();
    } catch (error) {
      console.error("Failed to save outreach settings:", error);
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Shared by the Quick Apply modal's own Gmail check (components/outreach/
  // QuickApplyModal.tsx) — both read the same GET /api/gmail/status, so
  // this card and that modal never disagree about connection state.
  const refetchGmailStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/gmail/status");
      const data = await res.json();
      if (data.connected) {
        setGmail({ status: "connected", email: data.email, connectedAt: data.connectedAt });
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
    void refetchGmailStatus();
  }, [refetchGmailStatus]);

  async function handleDisconnect() {
    setIsDisconnecting(true);
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Disconnect request failed");
      toast.success("Gmail disconnected.");
      await refetchGmailStatus();
    } catch (error) {
      console.error("Failed to disconnect Gmail:", error);
      toast.error("Failed to disconnect Gmail.");
    } finally {
      setIsDisconnecting(false);
    }
  }

  const sliderPercent = ((dailyLimit - 5) / (40 - 5)) * 100;

  function applyWindowPreset(preset: SendingWindowPreset) {
    setStartTime(preset.start === "now" ? formatNowAsTime12() : preset.start);
    setEndTime(preset.end);
    setActiveWindowPreset(preset.label);
  }

  return (
    <>
    <Suspense fallback={null}>
      <GmailOAuthResultHandler onResult={refetchGmailStatus} />
    </Suspense>
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
            <Clock className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Send Scheduler</h1>
            <p className="text-sm text-gray-500">Control how and when your outreach emails are sent.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={notWiredYet}
          className="inline-flex cursor-pointer items-center gap-1.5 self-start text-sm font-medium text-gray-500 hover:text-gray-700 sm:self-auto"
        >
          <HelpCircle className="h-4 w-4" />
          Learn more
        </button>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Daily Send Limit */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeading title="Daily Send Limit" subtitle="Limit the number of emails sent per day across all outreach." />

          <Stepper value={dailyLimit} onChange={setDailyLimit} min={5} max={40} suffix="/ day" />

          <div className="mt-5">
            <div className="relative h-1.5 w-full rounded-full bg-gray-100">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-brand-purple"
                style={{ width: `${sliderPercent}%` }}
              />
              <input
                type="range"
                min={5}
                max={40}
                step={1}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="absolute inset-0 h-1.5 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-purple [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-purple [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm"
                aria-label="Daily send limit"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              {TICKS.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-purple-50 px-3.5 py-3 text-xs text-brand-purple">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            We recommend 10–20/day to avoid spam flags.
          </div>
        </div>

        {/* Sending Window */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeading title="Sending Window" subtitle="Set the time range during which emails will be sent." />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {SENDING_WINDOW_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyWindowPreset(preset)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center text-xs font-medium transition-colors",
                  activeWindowPreset === preset.label
                    ? "border-brand-purple bg-purple-50 text-brand-purple"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                )}
              >
                <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {preset.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Window: <span className="font-medium text-gray-600">{startTime} – {endTime}</span>
          </p>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Only send on weekdays</p>
              <p className="mt-0.5 text-xs text-gray-500">Emails will be sent Monday to Friday only.</p>
            </div>
            <Switch checked={weekdaysOnly} onCheckedChange={setWeekdaysOnly} className={SWITCH_PURPLE} />
          </div>
        </div>
      </div>

      {/* Row 2: Jitter */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <SectionHeading title="Jitter / Random Spacing" subtitle="Add random delays between emails to simulate natural sending behavior." />

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Switch checked={jitterEnabled} onCheckedChange={setJitterEnabled} className={SWITCH_PURPLE} />
            <div>
              <p className="text-sm font-medium text-gray-900">Enable jitter</p>
              <p className="mt-0.5 text-xs text-gray-500">Space sends randomly instead of sending all at once, to look more natural.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
            <Clock className="h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="mb-1 text-xs text-gray-500">Delay range (seconds)</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={jitterMinSeconds}
                  onChange={(e) => setJitterMinSeconds(Math.max(0, Number(e.target.value) || 0))}
                  disabled={!jitterEnabled}
                  className="h-8 w-20 rounded-lg border border-gray-200 bg-white px-2 text-sm font-semibold text-gray-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 disabled:opacity-50"
                  aria-label="Minimum jitter delay in seconds"
                />
                <span className="text-gray-300">–</span>
                <input
                  type="number"
                  min={jitterMinSeconds}
                  value={jitterMaxSeconds}
                  onChange={(e) => setJitterMaxSeconds(Math.max(jitterMinSeconds, Number(e.target.value) || jitterMinSeconds))}
                  disabled={!jitterEnabled}
                  className="h-8 w-20 rounded-lg border border-gray-200 bg-white px-2 text-sm font-semibold text-gray-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 disabled:opacity-50"
                  aria-label="Maximum jitter delay in seconds"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Between each email</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Connected Email Account — real GmailAccount state, same
          GET /api/gmail/status the Quick Apply modal reads, so this card
          and that modal never show two different answers. */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <SectionHeading title="Connected Email Account" subtitle="Emails are sent using your personal Gmail account (OAuth, gmail.send scope)." />

        {gmail.status === "loading" && (
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-4 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking connection...
          </div>
        )}

        {gmail.status === "not_connected" && (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-gray-300 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Mail className="h-4.5 w-4.5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">No Gmail account connected</p>
                <p className="mt-0.5 text-xs text-gray-500">Connect Gmail to send Quick Apply emails from your own address.</p>
              </div>
            </div>
            <a
              href="/api/gmail/connect"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-purple px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-purple/90"
            >
              <Mail className="h-3.5 w-3.5" />
              Connect Gmail
            </a>
          </div>
        )}

        {gmail.status === "connected" && (
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <Mail className="h-4.5 w-4.5 text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{gmail.email}</p>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    Connected
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">Connected on {formatDateTime(gmail.connectedAt)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                OAuth token valid
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDisconnecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Disconnect
                </button>
                <a
                  href="/api/gmail/connect"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reconnect
                </a>
              </div>
            </div>
          </div>
        )}

        {gmail.status === "reauth_required" && (
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <Mail className="h-4.5 w-4.5 text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{gmail.email}</p>
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                    Expired
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">Your Gmail connection needs to be renewed</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                Reconnect to continue sending emails
              </p>
              <a
                href="/api/gmail/connect"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-purple px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-purple/90"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reconnect
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Outreach Type Send Rules */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <SectionHeading title="Outreach Type Send Rules" subtitle="Set daily limits by outreach type. These limits help control volume and keep your outreach safe." />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
                <th className="py-2.5 pr-4 font-medium">Outreach Type</th>
                <th className="py-2.5 pr-4 font-medium">Description</th>
                <th className="py-2.5 pr-4 font-medium">Daily Limit</th>
                <th className="w-16 py-2.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {TYPE_RULES.map((rule) => {
                const Icon = rule.icon;
                const limit = typeLimits[rule.type];
                const isUnlimited = rule.defaultLimit === null;
                return (
                  <tr key={rule.type}>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                        <OutreachTypeBadge type={rule.type} />
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-gray-500">{rule.description}</td>
                    <td className="py-3.5 pr-4">
                      {isUnlimited ? (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          Unlimited
                        </span>
                      ) : (
                        <Stepper
                          value={limit ?? 0}
                          onChange={(v) => setTypeLimits((prev) => ({ ...prev, [rule.type]: v }))}
                          min={1}
                          max={50}
                          suffix="/ day"
                        />
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      {isUnlimited ? (
                        <span className="text-xs font-medium text-gray-400">Manual</span>
                      ) : (
                        <button
                          type="button"
                          onClick={notWiredYet}
                          className="inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label={`More info about ${rule.type} limits`}
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Daily caps reset at midnight in your local time (Asia/Kolkata).
        </p>
      </div>

      {/* Row 5: Send Queue Preview */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <SectionHeading title="Send Queue Preview" subtitle="Upcoming approved emails in the queue. Times are estimated based on your settings and jitter." />
          <Link
            href="/dashboard/outreach"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            View Full Queue
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {queueLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading queue...
          </div>
        ) : queueRows.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
            Nothing scheduled yet. Approve &amp; Schedule jobs from the Cold Outreach dashboard.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
                  <th className="py-2.5 pr-4 font-medium">Company</th>
                  <th className="py-2.5 pr-4 font-medium">Role</th>
                  <th className="py-2.5 pr-4 font-medium">Outreach Type</th>
                  <th className="py-2.5 pr-4 font-medium">Recipient / Email</th>
                  <th className="py-2.5 pr-4 font-medium">Estimated Send Time</th>
                  <th className="w-10 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {queueRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <CompanyLogo company={row.company} />
                        <span className="font-medium text-gray-900">{row.company}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-gray-600">{row.role}</td>
                    <td className="py-3.5 pr-4">
                      <OutreachTypeBadge type={row.outreachType} />
                    </td>
                    <td className="py-3.5 pr-4 text-gray-600">{row.emails[0] ?? "—"}</td>
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold text-gray-900">{formatQueueTime(row.scheduledSendTime!)}</p>
                      <p className="text-xs text-gray-400">{formatRelative(row.scheduledSendTime!)}</p>
                    </td>
                    <td className="py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="cursor-pointer rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label={`Actions for ${row.company}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer" onClick={notWiredYet}>
                            Send Now
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={notWiredYet}>
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-red-600" onClick={notWiredYet}>
                            Remove from Queue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
            <Shield className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Your settings help us send emails safely.</p>
            <p className="mt-0.5 text-xs text-gray-500">Follow best practices to keep your account and emails in good standing.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving || settingsLoading}
          className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
          Save Settings
        </button>
      </div>
    </div>
    </>
  );
}
