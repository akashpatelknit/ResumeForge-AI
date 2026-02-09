import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const traditional = [
  "Hours of manual formatting",
  "Generic templates",
  "No ATS optimization",
  "Write everything from scratch",
  "Guessing keywords",
];

const forge = [
  "Ready in under 5 minutes",
  "AI-tailored to each job",
  "95% ATS pass rate",
  "AI writes & enhances bullets",
  "Smart keyword matching",
];

const BeforeAfter = () => (
  <section className="py-20 lg:py-32">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Why ResumeForge AI <span className="text-gradient">Wins</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          See the difference AI makes in your job search.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Traditional */}
        <Card className="border-destructive/20 bg-destructive/3">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-muted-foreground">
              Traditional Resume Builder
            </h3>
            <ul className="space-y-3">
              {traditional.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ResumeForge */}
        <Card className="border-primary/20 bg-primary/[0.03] shadow-lg shadow-primary/5">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold">ResumeForge AI</h3>
            <ul className="space-y-3">
              {forge.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(142,71%,45%)]" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

export default BeforeAfter;
