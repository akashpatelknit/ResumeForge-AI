"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
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
  const [open, setOpen] = useState(false);
  const openAuthModal = useAuthModalStore((state) => state.open);

  return (
    <header className="w-full">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Image src="/rezlo.png" alt="Rezlo" width={28} height={28} className="h-7 w-7 rounded-lg" />
          Rezlo
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

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="sm:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav className="mt-8 flex flex-col gap-5 px-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
