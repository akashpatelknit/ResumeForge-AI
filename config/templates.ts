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
  {
    id: "classic",
    name: "Classic",
    description: "Centered header, no-bullet skills list — a widely-used FAANG-style layout.",
    category: "classic",
    type: "resume",
    thumbnail:
      "https://api.dicebear.com/7.x/shapes/svg?seed=classic1&backgroundColor=1f2937",
    fullPreview:
      "https://api.dicebear.com/7.x/shapes/svg?seed=classic1&backgroundColor=1f2937",
    features: [
      "Centered header",
      "ATS-optimized",
      "Custom sections support",
      "Compact skills list",
    ],
    rating: 4.7,
    usageCount: 0,
    isPremium: false,
    // Matches the seed content already wired to this templateId — see
    // lib/seedResumeData.ts's classicSeed.
    bestFor: ["Designers", "Marketers", "Content Creators"],
  },
  {
    id: "coming-soon-1",
    name: "Two-Column Modern",
    description: "A sidebar layout with a skills column — in the works.",
    category: "professional",
    type: "resume",
    thumbnail: "",
    fullPreview: "",
    rating: 0,
    usageCount: 0,
    isPremium: false,
    bestFor: [],
    comingSoon: true,
  },
  {
    id: "coming-soon-2",
    name: "Minimal Creative",
    description: "A lighter, design-forward layout — in the works.",
    category: "minimal",
    type: "resume",
    thumbnail: "",
    fullPreview: "",
    rating: 0,
    usageCount: 0,
    isPremium: false,
    bestFor: [],
    comingSoon: true,
  },
];
