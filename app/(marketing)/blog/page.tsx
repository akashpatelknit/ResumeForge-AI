import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/landing/Footer";
import { getAllPosts } from "@/lib/blog";
import { siteConfig, pageOpenGraph, pageTwitter } from "@/config/site";

const title = "Resume & Job Search Advice | Rezlo Blog";
const description =
  "Practical, no-fluff advice on ATS optimization, resume writing, and job search strategy from the team building Rezlo.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
  openGraph: pageOpenGraph({ title, description, path: "/blog" }),
  twitter: pageTwitter({ title, description }),
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 text-center lg:px-6">
            <h1 className="mx-auto mb-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              The <span className="text-gradient">Rezlo</span> Blog
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              Practical advice on resumes, ATS systems, and job search strategy — no fluff.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto max-w-3xl px-4 lg:px-6">
            <div className="flex flex-col gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-8"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {" · "}
                    {post.readingTime}
                  </p>
                  <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-brand-purple sm:text-2xl">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {post.description}
                  </p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-purple">
                    Read more &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
