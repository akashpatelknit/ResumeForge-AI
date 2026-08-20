"use client";

import { useState, type ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Tag,
  FileText,
  Settings,
  Menu,
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/plans", label: "Plans & Pricing", icon: Tag },
  { href: "/admin/templates", label: "Templates", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

// "AD" from "admin@rezlo.app" — first two letters of the local part,
// or the initials either side of a . _ - separator if there is one.
function adminInitials(email: string) {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase() || "AD";
}

// Sidebar + topbar shell for every /admin/* route (except /admin/login,
// which is a sibling outside this layout group). Replaces the old
// AdminNav's dark top-bar-only nav with the light purple-accented sidebar
// layout from the reference design — collapse/mobile-drawer state lives
// here since both the topbar's hamburger and the sidebar's own chevron
// need to drive the same state.
export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function handleMenuToggle() {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setCollapsed((c) => !c);
    } else {
      setMobileOpen((o) => !o);
    }
  }

  const initials = adminInitials(email);

  return (
    <div className="min-h-screen bg-gray-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-200 bg-white transition-all duration-200",
          collapsed ? "w-[76px]" : "w-[250px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center gap-2.5 px-5 py-5">
          <Image src="/rezlo.png" alt="Rezlo" width={36} height={36} className="h-9 w-9 shrink-0 rounded-xl" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">Admin Panel</p>
              <p className="truncate text-xs text-gray-500">Rezlo</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-purple-50 text-brand-purple" : "text-gray-600 hover:bg-gray-100",
                )}
              >
                {isActive && (
                  <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-purple" />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-gray-100 p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-brand-purple" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-700">Rezlo</p>
                <p className="truncate text-[11px] text-gray-400">v1.0.0</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="hidden shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 lg:block"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className={cn("transition-all duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-[250px]")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={handleMenuToggle}
            className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <div className="relative hidden w-full max-w-xs sm:block">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                readOnly
                className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pr-14 pl-9 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-brand-purple/40 focus:ring-2 focus:ring-brand-purple/10"
              />
              <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                ⌘K
              </kbd>
            </div>

            <button
              type="button"
              className="relative cursor-pointer rounded-lg p-2.5 text-gray-500 hover:bg-gray-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-full p-0.5 hover:bg-gray-100"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-brand-purple">
                    {initials}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium text-gray-900">Admin</p>
                  <p className="truncate text-xs text-gray-500">{email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout} className="cursor-pointer gap-2.5">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
