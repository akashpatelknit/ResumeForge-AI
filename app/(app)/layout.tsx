"use client";

import React from "react";
import { DashboardSidebar } from "@/components/shared/DashboardSidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default layout;
