"use client";

import React from "react";
import AddToTrackerPrompt from "@/components/shared/AddToTrackerPrompt";
import { useTrackerPromptStore } from "@/store/trackerPromptStore";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pending = useTrackerPromptStore((s) => s.pending);
  const clearPending = useTrackerPromptStore((s) => s.clear);

  return (
    <div className="flex h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">{children}</main>

      {pending && (
        <AddToTrackerPrompt
          key={`${pending.companyName}-${pending.roleTitle}-${pending.jobDescription.length}`}
          source="tailor"
          companyName={pending.companyName}
          roleTitle={pending.roleTitle}
          jobDescription={pending.jobDescription}
          onDismiss={clearPending}
        />
      )}
    </div>
  );
};

export default AppLayout;
