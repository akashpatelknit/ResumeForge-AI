import type { Metadata } from "next";
import LandingPageClient from "@/components/landing/LandingPageClient";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "Rezlo — AI Resume Builder & Job Application Assistant" },
  description:
    "Drop your resume, get hired faster. Build ATS-optimized resumes with AI, track applications on a Kanban board, and send AI-drafted outreach — free to start.",
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    url: siteConfig.url,
    title: "Rezlo — AI Resume Builder & Job Application Assistant",
    description:
      "Drop your resume, get hired faster. Build ATS-optimized resumes with AI, track applications on a Kanban board, and send AI-drafted outreach — free to start.",
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: siteConfig.name,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            description: siteConfig.description,
            url: siteConfig.url,
            offers: [
              {
                "@type": "Offer",
                name: "Free",
                price: "0",
                priceCurrency: "USD",
              },
              {
                "@type": "Offer",
                name: "Pro",
                priceCurrency: "USD",
              },
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "10000",
            },
            author: {
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.url,
            },
          }),
        }}
      />
      <LandingPageClient />
    </>
  );
}
