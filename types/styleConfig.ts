// Per-resume presentation settings — independent of `templateId`, which
// selects the structural React component (see components/pdf/template/).
// This selects appearance within whatever structure that component defines.
export interface ResumeStyleMargins {
  topBottom: number; // inches
  betweenSections: number; // pt
  betweenTitlesAndContent: number; // pt
  betweenContentBlocks: number; // pt
}

export type PaperFormat = "a4" | "letter" | "legal";
export type DateFormat = "short-name" | "numeric" | "full-name" | "year-only";
export type DateLocationAlign = "left" | "right";

// react-pdf's 14 standard PDF fonts don't need Font.register/a font file —
// anything else does, and none of the templates currently register one
// (see components/pdf/template/ModernTemplate.tsx). Scoped to the 3 base
// families so this control always actually changes the rendered PDF.
export type PdfFontFamily = "Helvetica" | "Times-Roman" | "Courier";

export interface ResumeStyleConfig {
  accentColor: string;
  paperFormat: PaperFormat;
  margins: ResumeStyleMargins;
  dateFormat: DateFormat;
  dateLocationAlign: DateLocationAlign;
  // null when the active template doesn't offer a choice — see
  // TEMPLATE_SKILLS_LAYOUT_OPTIONS in components/builder/layout/LayoutPanel.tsx.
  skillsLayout: string | null;
  primaryFont: PdfFontFamily;
  secondaryFont: PdfFontFamily;
  headingSizePct: number;
  bodySizePct: number;
  lineSpacingPct: number;
}

// Matches the template's original, pre-Layout-tab look (plain black text,
// no theming) — this is also what "Reset Layout" restores.
export const DEFAULT_STYLE_CONFIG: ResumeStyleConfig = {
  accentColor: "#000000",
  paperFormat: "a4",
  margins: {
    topBottom: 0.5,
    betweenSections: 10,
    betweenTitlesAndContent: 4,
    betweenContentBlocks: 6,
  },
  dateFormat: "short-name",
  dateLocationAlign: "left",
  skillsLayout: null,
  primaryFont: "Helvetica",
  secondaryFont: "Helvetica",
  headingSizePct: 100,
  bodySizePct: 100,
  lineSpacingPct: 100,
};

export const FONT_OPTIONS: { value: PdfFontFamily; label: string }[] = [
  { value: "Helvetica", label: "Arial" },
  { value: "Times-Roman", label: "Times New Roman" },
  { value: "Courier", label: "Courier" },
];

// react-pdf's standard fonts don't synthesize bold from fontWeight — each
// weight is its own named font, and the bold variant isn't just the base
// name + "-Bold" (Times-Roman's bold is "Times-Bold", not
// "Times-Roman-Bold"). Templates that render bold text need this instead of
// guessing the suffix.
export const PDF_BOLD_FONT_MAP: Record<PdfFontFamily, string> = {
  Helvetica: "Helvetica-Bold",
  "Times-Roman": "Times-Bold",
  Courier: "Courier-Bold",
};

export const PAPER_SIZE_MAP: Record<PaperFormat, "A4" | "LETTER" | "LEGAL"> = {
  a4: "A4",
  letter: "LETTER",
  legal: "LEGAL",
};

export const ACCENT_COLOR_PRESETS = [
  "#bfdbfe", // blue
  "#bbf7d0", // green
  "#fef3c7", // yellow
  "#e9d5ff", // purple
  "#bae6fd", // cyan
];

export const PAPER_FORMAT_OPTIONS: { value: PaperFormat; label: string }[] = [
  { value: "a4", label: 'A4 (8.27" x 11.69")' },
  { value: "letter", label: 'Letter (8.5" x 11")' },
  { value: "legal", label: 'Legal (8.5" x 14")' },
];

export const DATE_FORMAT_OPTIONS: { value: DateFormat; label: string }[] = [
  { value: "short-name", label: "Short Name (Jan YYYY)" },
  { value: "full-name", label: "Full Name (January YYYY)" },
  { value: "numeric", label: "Numeric (01/YYYY)" },
  { value: "year-only", label: "Year Only (YYYY)" },
];
