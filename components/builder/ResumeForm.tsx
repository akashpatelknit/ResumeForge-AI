"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection from "./sections/EducationSection";
import SkillsSection from "./sections/SkillsSection";
import ProjectsSection from "./sections/ProjectsSection";
import CustomSectionsSection from "./sections/CustomSectionsSection";
import { useResumeStore } from "@/store/resumeStore";
import { Loader2, GripVertical } from "lucide-react";
import { getReorderableOrder, SECTION_LABELS, type SectionKey } from "@/lib/resumeSections";

// A single reorderable tab trigger. Dragging is deliberately confined to
// the GripVertical handle (via useDragControls + dragListener={false})
// rather than the whole tab — otherwise a plain click to switch tabs and a
// drag-to-reorder gesture would be indistinguishable.
//
// The handle is a SIBLING of TabsTrigger, absolutely positioned over its
// left edge — not a descendant. Radix's Trigger is a real <button> with
// its own pointer/focus handling (roving tabindex), and nesting the
// handle inside it let Radix's own pointerdown handling win the race
// before framer-motion's drag gesture could start, so dragging silently
// did nothing. Overlaying it as a sibling means the browser's hit-test
// routes the pointerdown straight to the handle, never touching the
// button underneath.
function ReorderableSectionTab({ sectionKey }: { sectionKey: SectionKey }) {
  const controls = useDragControls();

  return (
    <Reorder.Item value={sectionKey} as="div" dragListener={false} dragControls={controls} className="relative flex-1">
      <TabsTrigger value={sectionKey} className="w-full pl-5">
        {SECTION_LABELS[sectionKey]}
      </TabsTrigger>
      <span
        className="absolute top-1/2 left-1 z-10 -translate-y-1/2 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </span>
    </Reorder.Item>
  );
}

// Reads ?tab=projects&importGithub=1 (set by the dashboard's "Import from
// GitHub" quick action — see components/dashboard/QuickActions.tsx) so the
// builder can land directly on the Projects tab with the import modal
// already open, instead of the user having to navigate there manually.
// useSearchParams() requires a Suspense boundary, so this logic is split
// into its own component rather than reading it directly in ResumeForm.
function useInitialTabState() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "projects" ? "projects" : "personal";
  const autoOpenGithubImport = searchParams.get("importGithub") === "1";
  return { initialTab, autoOpenGithubImport };
}

function ResumeFormContent() {
  const { currentResume, saveResume, updateSectionOrder } = useResumeStore();
  const [isSaving, setIsSaving] = useState(false);
  const { initialTab, autoOpenGithubImport } = useInitialTabState();

  // "Personal" is intentionally excluded — it's locked first, not part of
  // the draggable set. See lib/resumeSections.ts.
  const reorderableTabs = useMemo(
    () => getReorderableOrder(currentResume?.sectionOrder),
    [currentResume?.sectionOrder],
  );

  const handleSave = async () => {
    if (!currentResume) return;

    setIsSaving(true);
    try {
      await saveResume();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <Tabs defaultValue={initialTab} className="w-full">
          {/* overflow-x-auto: 6 tabs at min-content width can exceed a
              narrow phone's viewport — this keeps the scroll contained to
              the tab strip instead of blowing out the page's horizontal
              bounds. */}
          <TabsList className="flex w-full gap-1 overflow-x-auto">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <Reorder.Group
              as="div"
              axis="x"
              values={reorderableTabs}
              onReorder={(newOrder) => updateSectionOrder(newOrder)}
              className="flex flex-5 gap-1"
            >
              {reorderableTabs.map((key) => (
                <ReorderableSectionTab key={key} sectionKey={key} />
              ))}
            </Reorder.Group>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-4">
            <PersonalInfoSection />
          </TabsContent>

          <TabsContent value="experience" className="space-y-4 mt-4">
            <ExperienceSection />
          </TabsContent>

          <TabsContent value="education" className="space-y-4 mt-4">
            <EducationSection />
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 mt-4">
            <SkillsSection />
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 mt-4">
            <ProjectsSection autoOpenGithubImport={autoOpenGithubImport} />
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <CustomSectionsSection />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Save/Cancel Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline">Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || !currentResume}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Resume"
          )}
        </Button>
      </div>
    </div>
  );
}

export default function ResumeForm() {
  return (
    <Suspense fallback={null}>
      <ResumeFormContent />
    </Suspense>
  );
}
