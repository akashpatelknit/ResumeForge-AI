"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useAuthModalStore } from "@/store/authModalStore";

const links = [
  { label: "Templates", href: "/templates" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

// Deliberately not the full marketing Header — nothing here should compete
// with the dropzone for attention. Just enough wayfinding to reach the
// relocated marketing content and to sign in.
export default function MinimalHeader() {
  const openAuthModal = useAuthModalStore((state) => state.open);

  return (
    <header className="w-full">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-hero">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          ResumeForge AI
        </Link>

        <nav className="flex items-center gap-6">
          <div className="hidden items-center gap-6 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <button
            onClick={() => openAuthModal("sign-in")}
            className="text-sm font-medium text-foreground transition-opacity hover:opacity-70"
          >
            Sign In
          </button>
        </nav>
      </div>
    </header>
  );
}
