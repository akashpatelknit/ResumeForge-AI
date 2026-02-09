import { Layout, UserPen, ClipboardPaste, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Layout,
    title: "Choose Your Template",
    description:
      "Browse our collection of ATS-tested, professionally designed templates for every industry.",
  },
  {
    icon: UserPen,
    title: "Import or Enter Your Info",
    description:
      "Paste your LinkedIn profile or type your experience — our AI structures it perfectly.",
  },
  {
    icon: ClipboardPaste,
    title: "Paste Job Description",
    description:
      "Drop in any job listing and watch AI highlight the keywords and skills you need.",
  },
  {
    icon: Sparkles,
    title: "AI Optimizes & Download",
    description:
      "Get a polished, keyword-optimized resume ready to submit — in under 5 minutes.",
  },
];

const HowItWorks = () => (
  <section className="relative py-20 lg:py-32 bg-gradient-hero-soft">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          How It Works
        </h2>
        <p className="text-lg text-muted-foreground">
          Four simple steps to your dream resume.
        </p>
      </div>

      <div className="relative mx-auto max-w-3xl">
        {/* Connecting line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block md:left-1/2 md:-translate-x-px" />

        <div className="space-y-12">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`relative flex items-start gap-6 md:gap-12 ${i % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""}`}
            >
              {/* Step number circle */}
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-hero text-white font-bold text-lg shadow-lg shadow-primary/20 md:absolute md:left-1/2 md:-translate-x-1/2">
                {i + 1}
              </div>

              {/* Content */}
              <div
                className={`flex-1 rounded-xl border bg-card p-6 shadow-sm md:w-[calc(50%-3rem)] ${i % 2 === 1 ? "md:mr-auto" : "md:ml-auto"}`}
              >
                <div
                  className={`mb-2 flex items-center gap-2 ${i % 2 === 1 ? "md:justify-end" : ""}`}
                >
                  <step.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
