import { Template } from "@/types/template";

// Only one template active for now (single-column, ATS-friendly — a port
// of the classic Anubhav Singh / xprilion LaTeX resume template, see
// components/pdf/template/ModernTemplate.tsx). Kept as an array, and the
// template registry (components/pdf/template/index.tsx) is keyed by id,
// specifically so adding more later is just appending another entry here
// plus a new component in the registry — no restructuring needed.
export const sampleTemplates: Template[] = [
  {
    id: "modern",
    name: "Classic ATS",
    description: "Clean single-column layout, optimized for ATS parsing",
    category: "modern",
    type: "resume",
    thumbnail:
      "https://api.dicebear.com/7.x/shapes/svg?seed=modern1&backgroundColor=8b5cf6",
    fullPreview:
      "https://api.dicebear.com/7.x/shapes/svg?seed=modern1&backgroundColor=8b5cf6",
    features: [
      "Single-column layout",
      "ATS-optimized",
      "Custom sections support",
      "Clean typography",
    ],
    rating: 4.8,
    usageCount: 1234,
    isPremium: false,
    bestFor: ["Software Engineers", "Product Managers", "Most roles"],
  },
];
