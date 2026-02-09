import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const columns = [
  { title: "Product", links: ["Features", "Templates", "Pricing", "Roadmap"] },
  { title: "Resources", links: ["Blog", "Help Center", "Guides", "API Docs"] },
  { title: "Company", links: ["About", "Careers", "Contact", "Press Kit"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "GDPR"] },
];

const Footer = () => (
  <footer className="border-t bg-background py-16">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
        {/* Brand + newsletter */}
        <div className="lg:col-span-2">
          <a href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-hero">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            ResumeForge AI
          </a>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            AI-powered resumes that get you hired. Build, optimize, and download
            in minutes.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              type="email"
              placeholder="Get resume tips"
              className="h-9 flex-1 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button
              size="sm"
              className="bg-gradient-hero text-white hover:opacity-90"
            >
              Subscribe
            </Button>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Separator className="my-8" />

      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ResumeForge AI. All rights reserved.
        </p>
        <div className="flex gap-4">
          {["LinkedIn", "Twitter", "GitHub"].map((social) => (
            <a
              key={social}
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {social}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
