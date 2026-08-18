"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { CreditCard, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  if (name) {
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("");
    if (initials) return initials.toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? "U";
}

interface ProfileMenuProps {
  className?: string;
  align?: "start" | "center" | "end";
}

// Custom replacement for Clerk's prebuilt <UserButton /> — same auth/session
// plumbing (useUser / useClerk are headless hooks, not UI), but styled to
// match the app's own design system instead of Clerk's default branding.
export default function ProfileMenu({ className, align = "end" }: ProfileMenuProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded || !user) {
    return <div className={cn("h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-200", className)} />;
  }

  const fullName = user.fullName || user.firstName || "User";
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const initials = getInitials(user.fullName, email);

  const handleSignOut = () => {
    void signOut({ redirectUrl: "/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open profile menu"
          className={cn(
            "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-linear-to-br from-brand-purple via-brand-blue to-brand-pink p-[2px] transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 focus-visible:ring-offset-2",
            className,
          )}
        >
          <Avatar className="ring-2 ring-white">
            <AvatarImage src={user.imageUrl} alt={fullName} />
            <AvatarFallback className="bg-linear-to-br from-brand-purple to-brand-blue text-xs font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        sideOffset={10}
        className="w-64 overflow-hidden rounded-2xl border-gray-100 p-0 shadow-xl shadow-purple-900/5"
      >
        {/* User identity — non-clickable header row */}
        <div className="flex items-center gap-3 bg-linear-to-br from-brand-purple/5 via-brand-blue/5 to-brand-pink/5 px-4 py-3.5">
          <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
            <AvatarImage src={user.imageUrl} alt={fullName} />
            <AvatarFallback className="bg-linear-to-br from-brand-purple to-brand-blue text-sm font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{fullName}</p>
            <p className="truncate text-xs text-gray-500">{email}</p>
          </div>
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="p-1.5">
          <DropdownMenuItem
            asChild
            className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-700 focus:bg-purple-50 focus:text-brand-purple"
          >
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-700 focus:bg-purple-50 focus:text-brand-purple"
          >
            <Link href="/dashboard/settings">
              <CreditCard className="h-4 w-4" />
              Billing
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="p-1.5">
          <DropdownMenuItem
            variant="destructive"
            onClick={handleSignOut}
            className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
