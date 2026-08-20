"use client";

import { Palette, LayoutGrid, Calendar, Wrench, Type, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/resumeStore";
import {
  DATE_FORMAT_OPTIONS,
  DEFAULT_STYLE_CONFIG,
  PAPER_FORMAT_OPTIONS,
  type DateFormat,
  type PaperFormat,
} from "@/types/styleConfig";
import AccentColorPicker from "@/components/builder/layout/AccentColorPicker";
import LabeledSlider from "@/components/builder/layout/LabeledSlider";
import DateLocationAlignToggle from "@/components/builder/layout/DateLocationAlignToggle";
import FontSelect from "@/components/builder/layout/FontSelect";
import PercentStepper from "@/components/builder/layout/PercentStepper";

// Which templates offer a choice of skills layout, and what those choices
// are. Empty/missing = the control is disabled, matching the reference
// panel's "not available for the current template" state. Today only
// "modern" is a real template (see config/templates.ts) and it doesn't
// offer a skills-layout choice yet — this map is the seam to extend once
// more templates exist, without touching the panel itself.
const TEMPLATE_SKILLS_LAYOUT_OPTIONS: Record<string, string[]> = {};

function LayoutSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-b border-gray-100 pb-6 last:border-b-0">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Icon className="size-4 text-gray-500" />
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function LayoutPanel() {
  const { currentResume, updateStyleConfig } = useResumeStore();

  if (!currentResume) return null;

  const { styleConfig, templateId } = currentResume;
  const skillsLayoutOptions = TEMPLATE_SKILLS_LAYOUT_OPTIONS[templateId] ?? [];

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Customize how this resume looks</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto gap-1.5 px-2 py-1 text-xs text-gray-500 hover:text-gray-900"
          onClick={() => updateStyleConfig(DEFAULT_STYLE_CONFIG)}
        >
          <RotateCcw className="size-3.5" />
          Reset Layout
        </Button>
      </div>

      <LayoutSection icon={Palette} title="Accent Color">
        <AccentColorPicker
          value={styleConfig.accentColor}
          onChange={(accentColor) => updateStyleConfig({ accentColor })}
        />
      </LayoutSection>

      <LayoutSection icon={LayoutGrid} title="Format">
        <Select
          value={styleConfig.paperFormat}
          onValueChange={(paperFormat: PaperFormat) =>
            updateStyleConfig({ paperFormat })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAPER_FORMAT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </LayoutSection>

      <LayoutSection icon={Wrench} title="Margins & Paddings">
        <LabeledSlider
          label="Top & Bottom"
          value={styleConfig.margins.topBottom}
          unit=" in"
          min={0}
          max={1.5}
          step={0.05}
          onChange={(topBottom) =>
            updateStyleConfig({ margins: { ...styleConfig.margins, topBottom } })
          }
        />
        <LabeledSlider
          label="Between Sections"
          value={styleConfig.margins.betweenSections}
          unit=" pt"
          min={0}
          max={30}
          step={1}
          onChange={(betweenSections) =>
            updateStyleConfig({
              margins: { ...styleConfig.margins, betweenSections },
            })
          }
        />
        <LabeledSlider
          label="Between Titles & Content"
          value={styleConfig.margins.betweenTitlesAndContent}
          unit=" pt"
          min={0}
          max={20}
          step={1}
          onChange={(betweenTitlesAndContent) =>
            updateStyleConfig({
              margins: { ...styleConfig.margins, betweenTitlesAndContent },
            })
          }
        />
        <LabeledSlider
          label="Between Content Blocks"
          value={styleConfig.margins.betweenContentBlocks}
          unit=" pt"
          min={0}
          max={20}
          step={1}
          onChange={(betweenContentBlocks) =>
            updateStyleConfig({
              margins: { ...styleConfig.margins, betweenContentBlocks },
            })
          }
        />
      </LayoutSection>

      <LayoutSection icon={Calendar} title="Date format">
        <Select
          value={styleConfig.dateFormat}
          onValueChange={(dateFormat: DateFormat) =>
            updateStyleConfig({ dateFormat })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_FORMAT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </LayoutSection>

      <LayoutSection icon={LayoutGrid} title="Date and Location Alignment">
        <DateLocationAlignToggle
          value={styleConfig.dateLocationAlign}
          onChange={(dateLocationAlign) =>
            updateStyleConfig({ dateLocationAlign })
          }
        />
      </LayoutSection>

      <LayoutSection icon={Wrench} title="Skills Layout">
        {skillsLayoutOptions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-400">
            Skills layout customization is not available for the current
            template.
          </p>
        ) : (
          <Select
            value={styleConfig.skillsLayout ?? skillsLayoutOptions[0]}
            onValueChange={(skillsLayout) => updateStyleConfig({ skillsLayout })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skillsLayoutOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </LayoutSection>

      <LayoutSection icon={Type} title="Formatting">
        <FontSelect
          label="Primary Font (Headings)"
          value={styleConfig.primaryFont}
          onChange={(primaryFont) => updateStyleConfig({ primaryFont })}
        />
        <FontSelect
          label="Secondary Font (Body)"
          value={styleConfig.secondaryFont}
          onChange={(secondaryFont) => updateStyleConfig({ secondaryFont })}
        />

        <div className="space-y-1.5">
          <p className="text-sm text-gray-700">Heading Size</p>
          <PercentStepper
            value={styleConfig.headingSizePct}
            min={50}
            max={200}
            onChange={(headingSizePct) => updateStyleConfig({ headingSizePct })}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm text-gray-700">Body Size</p>
          <PercentStepper
            value={styleConfig.bodySizePct}
            min={50}
            max={200}
            onChange={(bodySizePct) => updateStyleConfig({ bodySizePct })}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm text-gray-700">Line Spacing</p>
          <PercentStepper
            value={styleConfig.lineSpacingPct}
            min={80}
            max={200}
            onChange={(lineSpacingPct) => updateStyleConfig({ lineSpacingPct })}
          />
        </div>
      </LayoutSection>
    </div>
  );
}
