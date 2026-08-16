import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function BuildFromScratch() {
  return (
    <Link
      href="/create"
      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground active:scale-[0.98]"
    >
      <Sparkles className="h-3.5 w-3.5 animate-hero-sparkle transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-brand-purple" />
      Don&apos;t have a resume?{" "}
      <span className="font-medium text-foreground/80 underline-offset-4 group-hover:text-foreground group-hover:underline">
        Build one from scratch
      </span>
    </Link>
  );
}
