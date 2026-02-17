"use client";

import Sidebar from "@/components/shared/Sidebar";
import DashboardHeader from "@/components/shared/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <DashboardHeader />

        <main className="p-4 animate-fadeIn">{children}</main>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
