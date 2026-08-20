import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/landing/Footer";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { siteConfig, pageOpenGraph, pageTwitter } from "@/config/site";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: { absolute: `${post.title} | Rezlo Blog` },
    description: post.description,
    alternates: {
      canonical: `${siteConfig.url}/blog/${slug}`,
    },
    openGraph: pageOpenGraph({ title: post.title, description: post.description, path: `/blog/${slug}` }),
    twitter: pageTwitter({ title: post.title, description: post.description }),
  };
}

const mdxComponents = {
  h2: (props: React.ComponentProps<"h2">) => (
    <h2 className="mt-10 mb-4 text-2xl font-bold tracking-tight text-foreground" {...props} />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3 className="mt-8 mb-3 text-xl font-bold tracking-tight text-foreground" {...props} />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p className="mt-4 text-base leading-relaxed text-muted-foreground" {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-muted-foreground" {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-relaxed text-muted-foreground" {...props} />
  ),
  li: (props: React.ComponentProps<"li">) => <li className="pl-1" {...props} />,
  strong: (props: React.ComponentProps<"strong">) => <strong className="font-semibold text-foreground" {...props} />,
  a: (props: React.ComponentProps<"a">) => (
    <a className="font-medium text-brand-purple underline underline-offset-2 hover:opacity-80" {...props} />
  ),
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <article className="py-16 lg:py-20">
          <div className="container mx-auto max-w-2xl px-4 lg:px-6">
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              &larr; Back to Blog
            </Link>

            <p className="mt-6 text-xs font-medium text-muted-foreground">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" · "}
              {post.readingTime}
              {" · "}
              {post.author}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>

            <div className="mt-8">
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
