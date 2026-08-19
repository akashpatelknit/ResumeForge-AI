import Link from "next/link";

export default function BuildFromScratch() {
  return (
    <Link
      href="/create"
      className="inline-flex items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground active:scale-[0.98]"
    >
      Don&apos;t have a resume?{" "}
      <span className="ml-1 font-medium text-foreground underline underline-offset-2">
        Build one from scratch
      </span>
    </Link>
  );
}
