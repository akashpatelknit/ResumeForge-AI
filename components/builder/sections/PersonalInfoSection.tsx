"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/store/resumeStore";
import GenerateWithAI from "@/components/builder/ai/GenerateWithAI";

export default function PersonalInfoSection() {
  const { currentResume, updatePersonalInfo, updateSummary } = useResumeStore();

  if (!currentResume) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={currentResume.personalInfo.fullName}
              onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={currentResume.personalInfo.email}
              onChange={(e) => updatePersonalInfo({ email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={currentResume.personalInfo.phone}
              onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={currentResume.personalInfo.location}
              onChange={(e) => updatePersonalInfo({ location: e.target.value })}
              placeholder="San Francisco, CA"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={currentResume.personalInfo.linkedin || ""}
              onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/johndoe"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              value={currentResume.personalInfo.github || ""}
              onChange={(e) => updatePersonalInfo({ github: e.target.value })}
              placeholder="github.com/johndoe"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="summary">Professional Summary</Label>
          <GenerateWithAI<string>
            endpoint="/api/ai/generate-summary"
            title="Generate with AI"
            description={
              currentResume.summary?.trim()
                ? "Paste notes, a LinkedIn About section, or a job description you're targeting — or leave blank to polish your current summary"
                : "Paste notes, a LinkedIn About section, or a job description you're targeting"
            }
            placeholder="e.g. 5 years as a backend engineer, mostly Node.js and Postgres... or paste a job posting to tailor toward"
            buildBody={(rawInput) => ({
              rawInput,
              existingSummary: currentResume.summary,
              resumeContext: { name: currentResume.personalInfo.fullName },
            })}
            parseResult={(json) => (json as { summary: string }).summary}
            renderPreview={(summary) => (
              <div className="rounded-md border bg-gray-50 p-3 text-sm text-gray-800">
                {summary}
              </div>
            )}
            onUse={updateSummary}
            isInputValid={(rawInput) =>
              !!rawInput.trim() || !!currentResume.summary?.trim()
            }
            emptyInputHint="Add some notes or a job description above — there's no existing summary to regenerate yet."
            idleLabel={(rawInput) =>
              rawInput.trim() ? "Generate" : "Regenerate from current summary"
            }
          />
        </div>
        <Textarea
          id="summary"
          value={currentResume.summary}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="Brief overview of your professional background and key strengths..."
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          2-3 sentences highlighting your expertise and career goals
        </p>
      </div>
    </div>
  );
}
