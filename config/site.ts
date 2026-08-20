export const siteConfig = {
  name: "Rezlo",
  title: "AI Resume Builder - Create ATS-Optimized Resumes in Minutes",
  description:
    "Build professional, ATS-optimized resumes with AI assistance. Get hired faster with intelligent job matching, real-time PDF preview, and expert templates. Free resume builder trusted by 10,000+ job seekers.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://rezlo.vercel.app",
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || "https://rezlo.vercel.app"}/opengraph-image`,
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
