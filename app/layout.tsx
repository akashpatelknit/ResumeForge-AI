import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { AuthModal } from "@/components/auth/AuthModal";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { siteConfig, pageOpenGraph, pageTwitter } from "@/config/site";
import "./globals.css";
import "./index.css";

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
  authors: siteConfig.authors,
  creator: siteConfig.name,
  publisher: siteConfig.name,

  // Open Graph metadata (Facebook, LinkedIn, etc.)
  openGraph: pageOpenGraph({ title: siteConfig.title }),

  // Twitter Card metadata
  twitter: pageTwitter({
    title: siteConfig.title,
    description: siteConfig.ogDescription,
  }),

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

  alternates: {
    canonical: siteConfig.url,
  },

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

  other: {
    "msapplication-TileColor": "#7C3AED",
    "theme-color": "#ffffff",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head suppressHydrationWarning>
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
        </head>
        <body
          className="min-h-screen bg-background font-sans antialiased"
          suppressHydrationWarning
        >
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
            <AuthModal />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
