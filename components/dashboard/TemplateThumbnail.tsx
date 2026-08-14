// A small CSS-only mockup of the "Classic ATS" resume layout (bold name +
// contact row, underlined section headers, bullet-line bars, a skills pill
// row) used as the template gallery thumbnail. Stands in for a real
// rendered preview image — there's no PDF-to-image pipeline yet — but
// unlike an abstract placeholder graphic it actually resembles the
// template's real structure (see components/pdf/template/ModernTemplate.tsx),
// so a resume-shaped grid of gray bars beats a generic icon.
//
// Two fixed size variants rather than fluid percentage-based sizing: CSS
// percentage heights only resolve reliably against a definite-height
// *direct* parent, and this mockup nests several levels deep (section >
// entry > bullet), so a fluid version would silently collapse most bars to
// 0 height. Discrete "card" (small grid thumbnail) and "modal" (large
// preview) class sets sidestep that entirely.
interface TemplateThumbnailProps {
  variant?: "card" | "modal";
  className?: string;
}

interface SizeClasses {
  headerBar: string;
  ruleGap: string;
  lineBar: string;
  lineGap: string;
}

// Hoisted out of TemplateThumbnail — defining a component inline in a
// parent's render body recreates it (and resets its state) on every
// render; these two are declared once, at module scope, and take the
// active size variant's classes as props instead.
function Rule({ headerBar, ruleGap, isModal }: SizeClasses & { isModal: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${ruleGap} ${isModal ? "mt-1" : "mt-0.5"}`}>
      <div className={`${headerBar} bg-gray-800 rounded-full shrink-0`} />
      <div className="flex-1 h-px bg-gray-800" />
    </div>
  );
}

function Lines({
  widths,
  lineBar,
  lineGap,
}: Pick<SizeClasses, "lineBar" | "lineGap"> & { widths: number[] }) {
  return (
    <div className={`flex flex-col ${lineGap}`}>
      {widths.map((w, i) => (
        <div
          key={i}
          className={`${lineBar} bg-gray-200 rounded-full`}
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

export default function TemplateThumbnail({
  variant = "card",
  className = "",
}: TemplateThumbnailProps) {
  const isModal = variant === "modal";

  const pad = isModal ? "p-10" : "p-4";
  const sectionGap = isModal ? "gap-7" : "gap-3.5";
  const nameBar = isModal ? "h-4 w-52" : "h-2 w-20";
  const metaBar = isModal ? "h-2.5" : "h-1";
  const headerBar = isModal ? "h-2.5 w-32" : "h-1.5 w-14";
  const ruleGap = isModal ? "mb-3" : "mb-1.5";
  const lineBar = isModal ? "h-2" : "h-1";
  const lineGap = isModal ? "gap-2" : "gap-1";
  const entryGap = isModal ? "gap-4" : "gap-2";
  const pill = isModal ? "h-3.5" : "h-1.5";

  const size: SizeClasses = { headerBar, ruleGap, lineBar, lineGap };

  return (
    <div
      className={`h-full w-full bg-white flex flex-col ${pad} ${sectionGap} overflow-hidden ${className}`}
    >
      {/* Header — name + email row, contact links row (mirrors ModernTemplate) */}
      <div className="shrink-0">
        <div className="flex items-start justify-between">
          <div className={`${nameBar} bg-gray-900 rounded-full`} />
          <div className={`${metaBar} w-16 bg-gray-300 rounded-full mt-0.5`} />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className={`${metaBar} w-24 bg-gray-300 rounded-full`} />
          <div className={`${metaBar} w-14 bg-gray-300 rounded-full`} />
        </div>
      </div>

      {/* Professional Summary */}
      <div className="shrink-0">
        <Rule {...size} isModal={isModal} />
        <Lines widths={[96, 88, 62]} lineBar={lineBar} lineGap={lineGap} />
      </div>

      {/* Experience — two entries, each with its own bullet lines */}
      <div className="flex-1 min-h-0">
        <Rule {...size} isModal={isModal} />
        <div className={`flex flex-col ${entryGap}`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className={`${metaBar} w-28 bg-gray-500 rounded-full`} />
              <div className={`${metaBar} w-12 bg-gray-300 rounded-full`} />
            </div>
            <Lines widths={[92, 78, 84]} lineBar={lineBar} lineGap={lineGap} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className={`${metaBar} w-20 bg-gray-500 rounded-full`} />
              <div className={`${metaBar} w-12 bg-gray-300 rounded-full`} />
            </div>
            <Lines widths={[85, 70]} lineBar={lineBar} lineGap={lineGap} />
          </div>
        </div>
      </div>

      {/* Skills — pill row */}
      <div className="shrink-0">
        <Rule {...size} isModal={isModal} />
        <div className="flex flex-wrap gap-1.5">
          {[15, 12, 18, 10, 14, 11].map((w, i) => (
            <div
              key={i}
              className={`${pill} bg-gray-100 border border-gray-200 rounded-full`}
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
