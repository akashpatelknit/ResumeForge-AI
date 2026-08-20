import type { Metadata } from "next";
import LandingPageClient from "@/components/landing/LandingPageClient";
import { siteConfig, pageOpenGraph, pageTwitter } from "@/config/site";

const title = "Rezlo — AI Resume Builder & Job Application Assistant";
const description =
  "Drop your resume, get hired faster. Build ATS-optimized resumes with AI, track applications on a Kanban board, and send AI-drafted outreach — free to start.";
const ogDescription =
  "AI reads your resume, scores it against jobs, and helps you apply — all in one place.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: pageOpenGraph({ title, description: ogDescription }),
  twitter: pageTwitter({ title, description }),
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
