import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Rocket } from "lucide-react";

const Hero = () => (
  <section className="relative min-h-[90vh] overflow-hidden flex items-center">
    {/* Animated gradient background */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50" />
    <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-200/20 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-200/20 blur-3xl" />

    {/* Grid pattern */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
    />

    <div className="container relative mx-auto px-4 py-20 lg:px-6">
      <div className="mx-auto max-w-4xl text-center">
        <Badge
          variant="secondary"
          className="mb-6 gap-2 px-4 py-2 text-sm font-medium"
        >
          <Rocket className="h-4 w-4" />
          Trusted by 10,000+ job seekers
        </Badge>

        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Land Your Dream Job with{" "}
          <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
            AI-Optimized Resumes
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 md:text-xl leading-relaxed">
          Stop getting rejected by ATS systems. ResumeForge AI analyzes job
          descriptions, optimizes your content, and generates stunning resumes
          that get you hired — in minutes, not hours.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-8 text-base text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Start Building for Free
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 px-8 text-base hover:bg-gray-50"
          >
            See Examples
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          No credit card required • Free forever plan
        </p>

        {/* App mockup */}
        <div className="mt-16">
          <div className="relative mx-auto max-w-3xl rounded-xl border bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 border-b px-4 py-3 bg-gray-50">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-gray-500">
                resumeforge.ai/editor
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6 bg-white">
              <div className="col-span-1 space-y-3">
                <div className="h-3 w-full rounded bg-purple-200" />
                <div className="h-3 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
                <div className="mt-4 h-3 w-full rounded bg-purple-200" />
                <div className="h-3 w-5/6 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-2/3 rounded bg-gray-200" />
              </div>
              <div className="col-span-2 rounded-lg border bg-gray-50 p-4 space-y-2">
                <div className="h-4 w-1/2 rounded bg-purple-300" />
                <div className="h-2 w-full rounded bg-gray-200" />
                <div className="h-2 w-5/6 rounded bg-gray-200" />
                <div className="h-2 w-full rounded bg-gray-200" />
                <div className="mt-3 h-3 w-1/3 rounded bg-purple-200" />
                <div className="h-2 w-full rounded bg-gray-200" />
                <div className="h-2 w-4/5 rounded bg-gray-200" />
                <div className="h-2 w-full rounded bg-gray-200" />
                <div className="h-2 w-2/3 rounded bg-gray-200" />
                <div className="mt-3 h-3 w-1/3 rounded bg-purple-200" />
                <div className="h-2 w-full rounded bg-gray-200" />
                <div className="h-2 w-3/4 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Avatar stack social proof */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {[
              { bg: "bg-purple-600", text: "S" },
              { bg: "bg-blue-600", text: "M" },
              { bg: "bg-pink-600", text: "A" },
              { bg: "bg-green-600", text: "J" },
              { bg: "bg-yellow-600", text: "K" },
            ].map((avatar, i) => (
              <div
                key={i}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${avatar.bg}`}
              >
                {avatar.text}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-500">
            Join 10,000+ professionals
          </span>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
