import { Card, CardContent } from "@/components/ui/card";
import { Bot, FileText, Target, Sparkles, FileEdit, Zap } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Optimization",
    description:
      "Our AI analyzes your experience and tailors every bullet point for maximum impact and relevance.",
    gradient: "from-[hsl(271,81%,56%)] to-[hsl(239,84%,67%)]",
  },
  {
    icon: FileText,
    title: "Real-Time PDF Preview",
    description:
      "See your resume update live as you type. What you see is exactly what employers will receive.",
    gradient: "from-[hsl(221,83%,53%)] to-[hsl(199,89%,48%)]",
  },
  {
    icon: Target,
    title: "ATS-Friendly Templates",
    description:
      "Every template is tested against major ATS systems to ensure your resume never gets filtered out.",
    gradient: "from-[hsl(142,71%,45%)] to-[hsl(160,84%,39%)]",
  },
  {
    icon: Sparkles,
    title: "Smart Keyword Matching",
    description:
      "Paste any job description and instantly see which keywords to add for a perfect match.",
    gradient: "from-[hsl(330,81%,60%)] to-[hsl(271,81%,56%)]",
  },
  {
    icon: FileEdit,
    title: "Cover Letter Generator",
    description:
      "Generate tailored cover letters that complement your resume — personalized for each application.",
    gradient: "from-[hsl(45,93%,48%)] to-[hsl(25,95%,53%)]",
  },
  {
    icon: Zap,
    title: "One-Click Export",
    description:
      "Download polished PDFs, share links, or export to Word — all with a single click.",
    gradient: "from-[hsl(199,89%,48%)] to-[hsl(221,83%,53%)]",
  },
];

const Features = () => (
  <section id="features" className="py-20 lg:py-32">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Everything You Need to{" "}
          <span className="text-gradient">Get Hired</span>
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Powerful features designed to make your job search effortless and your
          resume unforgettable.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card
            key={f.title}
            className="group border bg-card card-hover cursor-default"
          >
            <CardContent className="flex flex-col gap-4 p-6">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-lg`}
              >
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
