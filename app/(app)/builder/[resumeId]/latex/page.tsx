import { redirect } from "next/navigation";

// The LaTeX editor was folded into the main builder page
// (app/(app)/builder/[resumeId]/page.tsx) as a Form/LaTeX toggle, so both
// modes share one PDF preview pipeline instead of maintaining two separate
// editor pages. This redirect exists for anyone with the old URL open/bookmarked.
export default async function LatexBuilderRedirect({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { resumeId } = await params;
  redirect(`/builder/${resumeId}`);
}
