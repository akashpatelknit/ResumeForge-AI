import { Card, CardContent } from "@/components/ui/card";
import { Linkedin, CloudUpload, FileDown, Globe } from "lucide-react";

const integrations = [
  {
    icon: Linkedin,
    name: "LinkedIn",
    description:
      "Import your profile directly to auto-fill your resume in seconds.",
  },
  {
    icon: CloudUpload,
    name: "Google Drive",
    description: "Save and sync your resumes to Google Drive automatically.",
  },
  {
    icon: FileDown,
    name: "Dropbox",
    description:
      "Export resumes straight to your Dropbox for easy access anywhere.",
  },
  {
    icon: Globe,
    name: "Job Boards",
    description:
      "Optimized formatting for Indeed, LinkedIn Jobs, Glassdoor, and more.",
  },
];

const Integrations = () => (
  <section className="py-20 lg:py-32">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Works With Your <span className="text-gradient">Favorite Tools</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Seamless integrations to fit into your workflow.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {integrations.map((item) => (
          <Card key={item.name} className="border text-center card-hover">
            <CardContent className="flex flex-col items-center gap-3 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default Integrations;
