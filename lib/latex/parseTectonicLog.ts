import "server-only";
import type { LatexDiagnostic } from "@/types/latex";

const RUSTC_STYLE_ERROR = /^(error|warning)(?:\[[^\]]*\])?:\s*(.+)$/;
const RUSTC_STYLE_LOCATION = /-->\s*[^:]*:(\d+)(?::(\d+))?/;

// Classic (pdf/xe)latex log fallback, e.g. "l.12 \foo{bar}"
const CLASSIC_ERROR = /^!\s*(.+)$/;
const CLASSIC_LOCATION = /^l\.(\d+)\b/;

export function parseTectonicLog(log: string): LatexDiagnostic[] {
  const diagnostics: LatexDiagnostic[] = [];
  const lines = log.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const rustcMatch = lines[i].match(RUSTC_STYLE_ERROR);
    if (rustcMatch) {
      const severity = rustcMatch[1] === "warning" ? "warning" : "error";
      const message = rustcMatch[2].trim();

      // Location is typically on the next line ("--> file:line:col"),
      // but scan a few lines ahead in case there's a blank line first.
      let line: number | undefined;
      let column: number | undefined;
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const locMatch = lines[j].match(RUSTC_STYLE_LOCATION);
        if (locMatch) {
          line = parseInt(locMatch[1], 10);
          column = locMatch[2] ? parseInt(locMatch[2], 10) : undefined;
          break;
        }
      }

      if (line !== undefined) {
        diagnostics.push({ line, column, message, severity });
        continue;
      }
    }

    // Fallback: classic TeX engine log style ("! message" ... "l.N ...")
    const classicMatch = lines[i].match(CLASSIC_ERROR);
    if (classicMatch) {
      const message = classicMatch[1].trim();
      let line: number | undefined;
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const locMatch = lines[j].match(CLASSIC_LOCATION);
        if (locMatch) {
          line = parseInt(locMatch[1], 10);
          break;
        }
      }
      if (line !== undefined) {
        diagnostics.push({ line, message, severity: "error" });
      }
    }
  }

  return diagnostics;
}
