import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "I landed 3 interviews in my first week after using ResumeForge AI. The ATS optimization made all the difference — got 3x more callbacks.",
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    result: "3x more interviews",
  },
  {
    quote:
      "Creating a polished resume used to take me days. Now it takes minutes and looks way more professional. I got my dream job within a month!",
    name: "Marcus Johnson",
    role: "Product Manager at Stripe",
    result: "Hired in 30 days",
  },
  {
    quote:
      "The AI suggestions improved my resume content dramatically. The keyword matching feature is a game-changer for anyone applying online.",
    name: "Emily Rodriguez",
    role: "UX Designer at Airbnb",
    result: "5 offers received",
  },
];

const Testimonials = () => (
  <section id="testimonials" className="py-20 lg:py-32 bg-gradient-hero-soft">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Success <span className="text-gradient">Stories</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          See how ResumeForge AI helped professionals land their dream jobs.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.name} className="border card-hover">
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[hsl(45,93%,48%)] text-[hsl(45,93%,48%)]"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                "{t.quote}"
              </p>
              <div className="rounded-md bg-[hsl(142,71%,45%,0.1)] px-3 py-1.5 text-xs font-semibold text-[hsl(142,71%,45%)]">
                📈 {t.result}
              </div>
              <div className="mt-auto flex items-center gap-3 border-t pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero font-semibold text-white text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
