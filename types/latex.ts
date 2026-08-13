export interface LatexDiagnostic {
  line: number;
  column?: number;
  message: string;
  severity: "error" | "warning";
}
