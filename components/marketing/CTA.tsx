import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => (
  <section className="py-20 lg:py-32">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero px-6 py-20 text-center text-white md:px-16 md:py-24">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to Land Your Dream Job?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-white/80 leading-relaxed">
            Join thousands of professionals who've already created standout,
            ATS-optimized resumes with AI.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 px-8 text-base font-semibold shadow-lg"
            >
              Start Building for Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-4 text-sm text-white/60">No credit card required</p>
          <a
            href="#templates"
            className="mt-2 inline-block text-sm text-white/70 underline underline-offset-4 hover:text-white transition-colors"
          >
            Or explore templates →
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default FinalCTA;
