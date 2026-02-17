"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/store/resumeStore";

export default function PersonalInfoSection() {
  const { currentResume, updatePersonalInfo, updateSummary } = useResumeStore();

  if (!currentResume) return null;

  console.log("Current Resume in PersonalInfoSection:", currentResume);

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
        <Label htmlFor="summary">Professional Summary</Label>
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
