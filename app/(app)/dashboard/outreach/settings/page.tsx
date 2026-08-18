"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarCheck,
  Check,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
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
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyLogo, OutreachTypeBadge } from "@/components/outreach/OutreachBadges";
import type { OutreachType } from "@/components/outreach/outreachData";

const notWiredYet = () => toast.info("Not wired up yet — coming in a follow-up pass.");

function timeOptions() {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const period = h < 12 ? "AM" : "PM";
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      options.push(`${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`);
    }
  }
  return options;
}
const TIME_OPTIONS = timeOptions();

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

interface QueueRow {
  company: string;
  role: string;
  outreachType: OutreachType;
  email: string;
  time: string;
  relative: string;
}

const QUEUE_ROWS: QueueRow[] = [
  { company: "Google", role: "Software Engineer II", outreachType: "cold", email: "sarah.johnson@google.com", time: "Today, 10:24 AM", relative: "in 8 min" },
  { company: "Microsoft", role: "Frontend Developer", outreachType: "general", email: "recruiter@microsoft.com", time: "Today, 10:37 AM", relative: "in 21 min" },
  { company: "Airbnb", role: "Full Stack Engineer", outreachType: "referral", email: "talent@airbnb.com", time: "Today, 10:58 AM", relative: "in 42 min" },
  { company: "Stripe", role: "Backend Engineer", outreachType: "cold", email: "careers@stripe.com", time: "Today, 11:21 AM", relative: "in 1h 5m" },
  { company: "Notion", role: "Product Engineer", outreachType: "referral", email: "jobs@notion.so", time: "Today, 11:46 AM", relative: "in 1h 30m" },
];

const SWITCH_PURPLE =
  "data-[state=checked]:bg-brand-purple data-[state=unchecked]:bg-gray-200";

export default function SendSchedulerPage() {
  const [dailyLimit, setDailyLimit] = useState(15);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("06:00 PM");
  const [weekdaysOnly, setWeekdaysOnly] = useState(true);
  const [jitterEnabled, setJitterEnabled] = useState(true);
  const [typeLimits, setTypeLimits] = useState<Record<OutreachType, number | null>>(
    Object.fromEntries(TYPE_RULES.map((r) => [r.type, r.defaultLimit])) as Record<OutreachType, number | null>,
  );

  const sliderPercent = ((dailyLimit - 5) / (40 - 5)) * 100;

  return (
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

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Start time</label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="h-10 w-full border-gray-200 bg-white text-sm text-gray-700">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="mb-2.5 text-gray-300">—</span>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">End time</label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="h-10 w-full border-gray-200 bg-white text-sm text-gray-700">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
              <p className="text-xs text-gray-500">Typical delay</p>
              <p className="text-sm font-bold text-gray-900">30s – 5m</p>
              <p className="text-[11px] text-gray-400">Between each email</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Connected Email Account */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <SectionHeading title="Connected Email Account" subtitle="Emails are sent using your personal Gmail account (OAuth, gmail.send scope)." />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Valid state */}
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <Mail className="h-4.5 w-4.5 text-red-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">akash.patel.dev@gmail.com</p>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      Connected
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">Connected on May 20, 2025 · 09:15 AM</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                OAuth token valid
                <span className="text-gray-400">· Expires in 6 days</span>
              </p>
              <button
                type="button"
                onClick={notWiredYet}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reconnect
              </button>
            </div>
          </div>

          {/* Expired state */}
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <Mail className="h-4.5 w-4.5 text-red-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">akash.patel.dev@gmail.com</p>
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                      Expired
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">Token expired on May 18, 2025 · 07:42 PM</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                Reconnect to continue sending emails
              </p>
              <button
                type="button"
                onClick={notWiredYet}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-brand-purple px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-purple/90"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reconnect
              </button>
            </div>
          </div>
        </div>
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
              {QUEUE_ROWS.map((row) => (
                <tr key={row.company} className="hover:bg-gray-50/60">
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
                  <td className="py-3.5 pr-4 text-gray-600">{row.email}</td>
                  <td className="py-3.5 pr-4">
                    <p className="font-semibold text-gray-900">{row.time}</p>
                    <p className="text-xs text-gray-400">{row.relative}</p>
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
          onClick={() => toast.success("Settings saved (mock) — not wired to a backend yet.")}
          className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 hover:shadow-xl sm:w-auto"
        >
          <CalendarCheck className="h-4 w-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
