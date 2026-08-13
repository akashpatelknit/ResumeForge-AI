import { DEFAULT_LATEX_SOURCE } from "../defaultTemplate";
import { CLASSIC_ATS_LATEX_SOURCE } from "./classicAtsTemplate";

export interface LatexTemplateOption {
  id: string;
  name: string;
  description: string;
  source: string;
}

export const LATEX_TEMPLATES: LatexTemplateOption[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Minimal starting point",
    source: DEFAULT_LATEX_SOURCE,
  },
  {
    id: "classic-ats",
    name: "Classic ATS",
    description: "Compact single-column layout with fancyhdr sections",
    source: CLASSIC_ATS_LATEX_SOURCE,
  },
];
