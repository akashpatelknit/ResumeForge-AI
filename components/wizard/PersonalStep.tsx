import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PersonalInfo } from "@/types/resume";
import StepShell from "./StepShell";

interface PersonalStepProps {
  personalInfo: PersonalInfo;
  summary: string;
  onChangePersonalInfo: (updates: Partial<PersonalInfo>) => void;
  onChangeSummary: (summary: string) => void;
}

export default function PersonalStep({
  personalInfo,
  summary,
  onChangePersonalInfo,
  onChangeSummary,
}: PersonalStepProps) {
  return (
    <StepShell title="Let's start with you" description="The basics — how employers reach you.">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={personalInfo.fullName}
              onChange={(e) => onChangePersonalInfo({ fullName: e.target.value })}
              placeholder="Jordan Rivera"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={personalInfo.email}
              onChange={(e) => onChangePersonalInfo({ email: e.target.value })}
              placeholder="jordan@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={personalInfo.phone}
              onChange={(e) => onChangePersonalInfo({ phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={personalInfo.location}
              onChange={(e) => onChangePersonalInfo({ location: e.target.value })}
              placeholder="Austin, TX"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={personalInfo.linkedin || ""}
              onChange={(e) => onChangePersonalInfo({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/jordanrivera"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              value={personalInfo.github || ""}
              onChange={(e) => onChangePersonalInfo({ github: e.target.value })}
              placeholder="github.com/jordanrivera"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="summary">Professional summary</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => onChangeSummary(e.target.value)}
            placeholder="2-3 sentences on your background and what you're looking for..."
            rows={4}
            className="resize-none"
          />
        </div>
      </div>
    </StepShell>
  );
}
