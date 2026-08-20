import type { Metadata } from "next";
import TemplatesPageClient from "@/components/marketing/TemplatesPageClient";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "Resume Templates — ATS-Optimized Designs | Rezlo" },
  description:
    "Browse professionally designed, ATS-optimized resume templates. Pick a style and start building with Rezlo's AI-powered resume builder — free to use.",
  alternates: {
    canonical: `${siteConfig.url}/templates`,
  },
  openGraph: {
    url: `${siteConfig.url}/templates`,
    title: "Resume Templates — ATS-Optimized Designs | Rezlo",
    description:
      "Browse professionally designed, ATS-optimized resume templates. Pick a style and start building with Rezlo's AI-powered resume builder — free to use.",
  },
};

export default function TemplatesPage() {
  return <TemplatesPageClient />;
}
