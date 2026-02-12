import { Template } from "@/types/template";

export const templates: Template[] = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Two-column layout with color accents",
    thumbnail: "/images/templates/modern.png",
    category: "modern",
    type: "resume",
    isPremium: false,
  },
  {
    id: "professional",
    name: "Classic Professional",
    description: "ATS-friendly single column",
    thumbnail: "/images/templates/professional.png",
    category: "professional",
    type: "resume",
    isPremium: false,
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Simple and elegant",
    thumbnail: "/images/templates/minimal.png",
    category: "minimal",
    type: "resume",
    isPremium: false,
  },
];
