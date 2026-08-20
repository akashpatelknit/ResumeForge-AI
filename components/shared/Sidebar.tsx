"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Layout,
  BarChart3,
  Settings,
  Zap,
  Target,
  Bot,
  Linkedin,
  ChevronDown,
  ChevronRight,
  Loader2,
  Columns3,
  ListChecks,
  Mail,
  Search,
  Package,
  ArrowRight,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { openRazorpayCheckout } from "@/lib/razorpayCheckout";

interface NavChild {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavItem {
  name: string;
  icon: React.ElementType;
  href?: string;
  children?: NavChild[];
}

const navigation: NavItem[] = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  {
    name: "Resumes",
    icon: FileText,
    children: [
      { name: "My Resumes", href: "/dashboard/resumes", icon: FileText },
      // { name: "Create New", href: "/dashboard/resumes/new", icon: PlusCircle },
      { name: "Templates", href: "/dashboard/template", icon: Layout },
    ],
  },
  {
    name: "Job Tracker",
    icon: Target,
    children: [
      { name: "Kanban Board", href: "/dashboard/jobs/tracker", icon: Columns3 },
      { name: "All Jobs", href: "/dashboard/jobs/all", icon: ListChecks },
    ],
  },
  { name: "Cold Outreach", icon: Mail, href: "/dashboard/outreach" },
  { name: "Outreach History", icon: Send, href: "/dashboard/outreach/history" },
  { name: "Job Discovery", icon: Search, href: "/dashboard/jobs/discover" },
  {
    name: "AI Tools",
    icon: Bot,
    children: [
      { name: "AI Outreach", href: "/dashboard/ai/outreach", icon: Bot },
      { name: "LinkedIn Audit", href: "/dashboard/ai/audit", icon: Linkedin },
      { name: "ATS Score", href: "/dashboard/jobs/analyzer", icon: Target },
    ],
  },
  // {
  //   name: "Interview Prep",
  //   icon: Mic,
  //   children: [
  //     {
  //       name: "Mock Interview",
  //       href: "/dashboard/interview/mock",
  //       icon: MessageSquare,
  //     },
  //     {
  //       name: "Question Bank",
  //       href: "/dashboard/interview/questions",
  //       icon: BookOpen,
  //     },
  //     { name: "STAR Generator", href: "/dashboard/interview/star", icon: Star },
  //   ],
  // },
  // { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export default function Sidebar({ isMobileMenuOpen, onCloseMobileMenu }: SidebarProps) {
  const [openSections, setOpenSections] = useState<string[]>(["Resumes"]);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [queueCount, setQueueCount] = useState<number | null>(null);
  const pathname = usePathname();
  const { data: subscription, refresh: refreshSubscription } = useSubscriptionStatus();

  // Refetches whenever the route changes so bookmarking/queueing a job on
  // the Job Discovery page updates this count without a full page reload —
  // cheap (a single COUNT query via /api/jobs/queue-count), not the full
  // live-fetch-from-Greenhouse discover endpoint.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/jobs/queue-count");
        const data = await res.json();
        if (!cancelled && res.ok) setQueueCount(data.count);
      } catch {
        // Non-fatal — the widget just stays hidden if this fails.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/subscription/create", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to start checkout");

      await openRazorpayCheckout({
        subscriptionId: body.subscriptionId,
        keyId: body.keyId,
        prefill: body.prefill,
        onSuccess: () => {
          toast.success("Payment submitted — activating your subscription…");
          setTimeout(() => void refreshSubscription(), 2500);
          setIsUpgrading(false);
        },
        onDismiss: () => setIsUpgrading(false),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
      setIsUpgrading(false);
    }
  };

  const toggleSection = (name: string) => {
    setOpenSections((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name],
    );
  };

  const isChildActive = (children: NavChild[]) =>
    children.some((child) => pathname.startsWith(child.href));

  // Nested single-link routes (e.g. "/dashboard/outreach/history" living
  // under "/dashboard/outreach") both satisfy a naive pathname.startsWith
  // check against their parent's href, so a plain per-item startsWith would
  // light up both "Cold Outreach" and "Outreach History" at once. Instead,
  // find the single-link href that most specifically matches the current
  // route (exact match, or a "/"-bounded prefix) and only that item is
  // active.
  const activeSingleHref = navigation
    .filter((item): item is NavItem & { href: string } => !item.children && !!item.href)
    .reduce<string | null>((best, item) => {
      const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (!matches) return best;
      if (!best || item.href.length > best.length) return item.href;
      return best;
    }, null);

  return (
    <>
      {/* Custom scrollbar styles */}
      <style>{`
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 999px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        /* Firefox */
        .sidebar-nav {
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }
      `}</style>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Rezlo
                </h1>
                <p className="text-xs text-gray-500 font-medium">AI Powered</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;

              // Single link
              if (!item.children) {
                const isActive = item.href === activeSingleHref;

                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    onClick={onCloseMobileMenu}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-200"
                          : "text-gray-700 hover:bg-gray-100 hover:translate-x-1"
                      }`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 ${!isActive && "group-hover:scale-110 transition-transform"}`}
                    />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              }

              // Section with children
              const isOpen = openSections.includes(item.name);
              const hasActiveChild = isChildActive(item.children);

              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleSection(item.name)}
                    className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer border-none bg-transparent
                      ${
                        hasActiveChild
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="font-medium text-sm flex-1 text-left">
                      {item.name}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActiveRoute =
                          pathname === child.href ||
                          pathname.startsWith(child.href);

                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={onCloseMobileMenu}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                              ${
                                isChildActiveRoute
                                  ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-100"
                                  : "text-gray-600 hover:bg-gray-100 hover:translate-x-1"
                              }`}
                          >
                            <ChildIcon className="w-4 h-4 shrink-0" />
                            <span className="text-sm font-medium">
                              {child.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Queue widget — real count of this user's isQueued=true
              SavedJob rows (Job Discovery). Hidden until the first fetch
              resolves rather than flashing "0 jobs" on every page load. */}
          {queueCount !== null && (
            <div className="px-4 pb-2 shrink-0">
              <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple text-white shadow-sm">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Queue</p>
                    <p className="text-lg font-bold leading-tight text-gray-900">
                      {queueCount} {queueCount === 1 ? "job" : "jobs"}
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/jobs/discover"
                  onClick={onCloseMobileMenu}
                  className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline"
                >
                  View Queue
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Upgrade CTA — only for free-tier users; Pro users see nothing
              here (no hosted portal link needed in the sidebar, that lives
              in Settings > Billing). */}
          {subscription && subscription.plan === "free" && (
            <div className="p-4 border-t border-gray-100 shrink-0">
              <div className="bg-linear-to-br from-blue-600 via-purple-600 to-purple-700 rounded-2xl p-4 text-white relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Pro
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1.5 leading-relaxed opacity-90">
                    Unlock unlimited resumes & AI tools
                  </p>
                  <p className="text-xs mb-3 opacity-75">
                    {subscription.aiGenerations.used}/{subscription.aiGenerations.limit} AI generations used this
                    month
                  </p>
                  <Button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="w-full bg-white text-blue-700 hover:bg-gray-50 font-semibold shadow-lg text-sm cursor-pointer"
                  >
                    {isUpgrading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
