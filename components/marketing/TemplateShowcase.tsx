"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const templates = [
  { name: "Modern", tag: "Popular", lines: [90, 65, 80, 50, 70, 85] },
  { name: "Professional", tag: "Classic", lines: [85, 70, 60, 75, 55, 65] },
  { name: "Minimal", tag: "Clean", lines: [70, 50, 80, 40, 60, 75] },
  { name: "Creative", tag: "Bold", lines: [60, 80, 45, 75, 65, 55] },
];

const TemplateShowcase = () => {
  const navigate = useRouter();
  return (
    <section id="templates" className="py-20 lg:py-32 bg-gradient-hero-soft">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Professional Templates That{" "}
            <span className="text-gradient">Stand Out</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Every template is tested against 50+ ATS systems.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t) => (
            <Card
              key={t.name}
              className="group overflow-hidden card-hover cursor-pointer"
            >
              <div className="relative bg-muted/50 p-6">
                <div className="mx-auto flex w-full max-w-[140px] flex-col gap-2 rounded-lg bg-background p-4 shadow-sm transition-transform duration-300 group-hover:scale-105">
                  <div className="h-3 w-3/4 rounded bg-primary/30" />
                  <div className="h-px w-full bg-border" />
                  {t.lines.map((w, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded bg-muted-foreground/15"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold">{t.name}</h3>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {t.tag}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate.push("/templates")}
          >
            Browse All Templates <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TemplateShowcase;
