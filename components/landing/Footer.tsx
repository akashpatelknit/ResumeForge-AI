import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-2 text-center text-[12px] text-muted-foreground">
      © {new Date().getFullYear()} Rezlo ·{" "}
      <Link href="/pricing" className="transition-colors hover:text-foreground">
        Pricing
      </Link>{" "}
      ·{" "}
      <Link href="/about" className="transition-colors hover:text-foreground">
        About
      </Link>
    </footer>
  );
}
