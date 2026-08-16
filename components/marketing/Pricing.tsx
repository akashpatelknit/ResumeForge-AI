"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: ["1 resume", "3 templates", "PDF export", "Basic ATS check"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "Everything you need to land the job",
    features: [
      "Unlimited resumes",
      "All templates",
      "AI optimization",
      "Cover letters",
      "ATS scoring",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team management",
      "Custom branding",
      "API access",
      "Dedicated support",
      "SSO",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => (
  <section id="pricing" className="py-20 lg:py-32">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Simple, <span className="text-gradient">Transparent Pricing</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          No hidden fees. Start free, upgrade when you're ready.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <motion.div
            key={tier.name}
            whileHover={{ y: tier.popular ? -10 : -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className={tier.popular ? "lg:-mt-4 lg:mb-4" : ""}
          >
            <div
              className={
                tier.popular
                  ? "rounded-xl bg-gradient-hero p-[1.5px] shadow-xl shadow-purple-500/20"
                  : ""
              }
            >
              <Card
                className={`relative flex h-full flex-col transition-shadow duration-300 ${
                  tier.popular
                    ? "border-0 bg-gradient-hero-soft shadow-none hover:shadow-2xl hover:shadow-purple-500/10"
                    : "border hover:border-purple-300/60 hover:shadow-lg"
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-hero text-white border-0 px-4 shadow-md">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground">{tier.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <ul className="flex-1 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-[hsl(142,71%,45%)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-4 transition-transform duration-200 active:scale-[0.98] ${tier.popular ? "bg-gradient-hero text-white hover:opacity-90 hover:scale-[1.02]" : "hover:scale-[1.02]"}`}
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Pricing;
