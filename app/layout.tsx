import type { Metadata } from "next";
import "./globals.css";
import "./index.css";

export const metadata: Metadata = {
  title: "Resume Builder",
  description: "AI-powered resume builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
