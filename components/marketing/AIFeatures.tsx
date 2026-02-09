import { Card, CardContent } from "@/components/ui/card";
import { Search, PenLine, Gauge } from "lucide-react";

const aiFeatures = [
  {
    icon: Search,
    title: "Job Description Analyzer",
    description:
      "Paste any job listing and our AI instantly extracts required skills, keywords, and qualifications — showing you exactly what to include.",
    example: {
      label: "Extracted Keywords",
      items: ["React", "TypeScript", "CI/CD", "Agile", "REST APIs"],
    },
  },
  {
    icon: PenLine,
    title: "Bullet Point Enhancer",
    description:
      "Transform weak bullet points into powerful, quantified achievements that grab attention and demonstrate impact.",
    before: "Worked on frontend projects",
    after:
      "Led frontend development of 3 revenue-generating features, increasing user engagement by 40%",
  },
  {
    icon: Gauge,
    title: "ATS Score Calculator",
    description:
      "Get a real-time compatibility score showing how well your resume matches the target job — with actionable suggestions to improve.",
    score: 92,
  },
];

const AIFeatures = () => (
  <section className="py-20 lg:py-32">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Powered by <span className="text-gradient">Advanced AI</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Under the hood, cutting-edge AI works to make your resume
          irresistible.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {aiFeatures.map((f) => (
          <Card key={f.title} className="border card-hover">
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>

              {/* Visual example */}
              <div className="mt-2 rounded-lg border bg-muted/50 p-4">
                {f.example && (
                  <div className="flex flex-wrap gap-2">
                    {f.example.items.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
                {f.before && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 font-semibold text-destructive">
                        Before:
                      </span>
                      <span className="text-muted-foreground">{f.before}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 font-semibold text-[hsl(142,71%,45%)]">
                        After:
                      </span>
                      <span>{f.after}</span>
                    </div>
                  </div>
                )}
                {f.score && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative h-20 w-20">
                      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="6"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke="hsl(142, 71%, 45%)"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${(f.score / 100) * 213.6} 213.6`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                        {f.score}%
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ATS Compatibility
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default AIFeatures;
