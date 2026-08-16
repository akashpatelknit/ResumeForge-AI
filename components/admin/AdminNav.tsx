"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/plans", label: "Plans & Pricing" },
  { href: "/admin/templates", label: "Templates" },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-slate-100"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">{email}</span>
        <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800">
          Log out
        </Button>
      </div>
    </div>
  );
}
