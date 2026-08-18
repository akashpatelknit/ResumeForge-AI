"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Creating a new template design is a real engineering task (a new
// component in components/pdf/template + a config/templates.ts entry), not
// something an admin form can do — this is a placeholder until that flow
// exists.
export function AddTemplateButton() {
  return (
    <Button
      className="gap-2 bg-brand-purple text-white hover:bg-brand-purple/90"
      onClick={() => toast.info("Adding new template designs isn't wired up yet — coming in a follow-up pass.")}
    >
      <Plus className="h-4 w-4" />
      Add Template
    </Button>
  );
}
