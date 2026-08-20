import type { Metadata } from "next";
import TemplatesPageClient from "@/components/marketing/TemplatesPageClient";
import { siteConfig, pageOpenGraph, pageTwitter } from "@/config/site";

const title = "Resume Templates — ATS-Optimized Designs | Rezlo";
const description =
  "Browse professionally designed, ATS-optimized resume templates. Pick a style and start building with Rezlo's AI-powered resume builder — free to use.";
const ogDescription =
  "Browse ATS-optimized resume templates and start building instantly with Rezlo's AI.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: `${siteConfig.url}/templates`,
  },
  openGraph: pageOpenGraph({ title, description: ogDescription, path: "/templates" }),
  twitter: pageTwitter({ title, description }),
};

export default function TemplatesPage() {
  return <TemplatesPageClient />;
}
