"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, Menu } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuthModalStore } from "@/store/authModalStore";

const links = [
  { label: "Templates", href: "/templates" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

// Shared across every marketing page (home, features, templates, pricing,
// about) — a floating rounded pill bar per the reference design, quiet
// enough not to compete with each page's own hero content. /create keeps
// its own deliberately-stripped-down MinimalHeader instead of this.
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const openAuthModal = useAuthModalStore((state) => state.open);

  // The dropzone this scrolls to only exists on "/" — from any other page,
  // navigate there first (Next.js scrolls the `#resume-dropzone` anchor
  // into view once the page has rendered).
  const goToDropzone = () => {
    if (pathname === "/") {
      document.getElementById("resume-dropzone")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      router.push("/#resume-dropzone");
    }
  };

  return (
    <header className="w-full px-4 pt-6 sm:px-6">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between rounded-full border border-[#E5E5E5] bg-white/90 px-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:px-7">
        <Link href="/" className="flex items-center gap-2.5 text-[16px] font-bold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-purple via-brand-blue to-brand-pink">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          ResumeForge AI
        </Link>

        <nav className="hidden items-center gap-7 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-muted-foreground transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-200 hover:text-foreground hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 sm:flex">
          <SignedOut>
            <button
              onClick={() => openAuthModal("sign-in")}
              className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted/70"
            >
              Sign In
            </button>
            <button
              onClick={goToDropzone}
              className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] active:scale-[0.98]"
            >
              Get Started
            </button>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] active:scale-[0.98]"
            >
              Dashboard
            </button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="sm:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
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
              <SignedOut>
                <button
                  onClick={() => {
                    setOpen(false);
                    openAuthModal("sign-in");
                  }}
                  className="text-left text-base font-semibold text-foreground"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    goToDropzone();
                  }}
                  className="rounded-full bg-foreground px-4 py-2 text-left text-base font-semibold text-background"
                >
                  Get Started
                </button>
              </SignedOut>

              <SignedIn>
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/dashboard");
                  }}
                  className="rounded-full bg-foreground px-4 py-2 text-left text-base font-semibold text-background"
                >
                  Dashboard
                </button>
                <div className="pt-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
