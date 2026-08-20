export const siteConfig = {
  name: "Rezlo",
  title: "AI Resume Builder - Create ATS-Optimized Resumes in Minutes",
  description:
    "Build professional, ATS-optimized resumes with AI assistance. Get hired faster with intelligent job matching, real-time PDF preview, and expert templates. Free resume builder trusted by 10,000+ job seekers.",
  // Short-form default used for og:description (Open Graph truncates around 125 chars on mobile).
  ogDescription:
    "AI-powered resume builder that helps you get hired faster. Free to start.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://rezlo.vercel.app",
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || "https://rezlo.vercel.app"}/images/opengraph.png`,
  links: {
    twitter: "https://twitter.com/rezlo",
    github: "https://github.com/akashpatelknit/Rezlo",
    linkedin: "https://linkedin.com/company/rezlo",
  },
  keywords: [
    "AI resume builder",
    "ATS resume",
    "professional resume",
    "CV maker",
    "resume templates",
    "job application",
    "resume optimizer",
    "cover letter generator",
    "resume ATS checker",
    "free resume builder",
    "AI job matching",
    "career tools",
    "resume formatting",
    "professional CV",
    "resume download PDF",
  ],
  authors: [
    {
      name: "Rezlo Team",
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://rezlo.vercel.app",
    },
  ],
};

export type SiteConfig = typeof siteConfig;

/**
 * Shared Open Graph defaults (image, siteName, type, locale) for every public page.
 * Next.js does not deep-merge nested `metadata.openGraph` objects between a layout and
 * its page, so a page-level `openGraph` silently drops the layout's image/siteName
 * unless it's included here explicitly.
 */
export function pageOpenGraph({
  title,
  description = siteConfig.ogDescription,
  path = "",
}: {
  title: string;
  description?: string;
  path?: string;
}) {
  return {
    type: "website" as const,
    locale: "en_US",
    url: `${siteConfig.url}${path}`,
    title,
    description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 3420,
        height: 1970,
        alt: `${siteConfig.name} - AI-Powered Resume Builder`,
      },
    ],
  };
}

/** Shared Twitter card defaults (image, card type, handles) for every public page. */
export function pageTwitter({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: [siteConfig.ogImage],
    creator: "@rezlo",
    site: "@rezlo",
  };
}
