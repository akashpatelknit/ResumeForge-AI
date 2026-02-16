import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "./index.css";

// Site configuration
const siteConfig = {
  name: "ResumeForge AI",
  title: "AI Resume Builder - Create ATS-Optimized Resumes in Minutes",
  description:
    "Build professional, ATS-optimized resumes with AI assistance. Get hired faster with intelligent job matching, real-time PDF preview, and expert templates. Free resume builder trusted by 10,000+ job seekers.",
  url: "https://resume-forge-ai-lilac.vercel.app", // Replace with your actual domain
  ogImage: "https://resume-forge-ai-lilac.vercel.app/images/og-image.png", // Replace with your OG image
  links: {
    twitter: "https://twitter.com/resumeforgeai",
    github: "https://github.com/yourusername/resume-builder",
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
};

export const metadata: Metadata = {
  // Basic metadata
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,

  // Author and creator
  authors: [
    {
      name: "ResumeForge AI Team",
      url: siteConfig.url,
    },
  ],
  creator: "ResumeForge AI",
  publisher: "ResumeForge AI",

  // Open Graph metadata (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "ResumeForge AI - AI-Powered Resume Builder",
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@resumeforgeai", // Replace with your Twitter handle
    site: "@resumeforgeai",
  },

  // Icons and manifest
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },
  manifest: "/site.webmanifest",

  // Robots and indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification for search engines
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification
    yandex: "your-yandex-verification-code", // Optional
    // bing: "your-bing-verification-code", // Optional
  },

  // Alternate languages (if you support multiple languages)
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "en-US": `${siteConfig.url}/en-US`,
      // Add more languages as needed
      // 'es-ES': `${siteConfig.url}/es-ES`,
    },
  },

  // Category
  category: "technology",

  // App-specific metadata
  applicationName: siteConfig.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: false,
  },

  // Additional metadata
  other: {
    "msapplication-TileColor": "#8b5cf6",
    "theme-color": "#ffffff",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log(
    "process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:",
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    "DATABASE_URL:",
    process.env.DATABASE_URL,
  );
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Additional SEO tags */}
          <link rel="canonical" href={siteConfig.url} />

          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />

          {/* Schema.org structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: siteConfig.name,
                description: siteConfig.description,
                url: siteConfig.url,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Any",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                },
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
        </head>
        <body className="min-h-screen bg-background font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
