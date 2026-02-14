import React from "react";
import ResumeCard from "./ResumeCard";
import { Resume } from "@/types/resume";

interface ResumeGridViewProps {
  resumes: Resume[];
  selectedResumes: string[];
  onToggleSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function ResumeGridView({
  resumes,
  selectedResumes,
  onToggleSelect,
  onToggleFavorite,
}: ResumeGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resumes.map((resume, index) => (
        <div
          key={resume.id}
          style={{ animationDelay: `${index * 50}ms` }}
          className="animate-slideUp"
        >
          <ResumeCard
            resume={resume}
            isSelected={selectedResumes.includes(resume.id)}
            onToggleSelect={onToggleSelect}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      ))}
    </div>
  );
}
