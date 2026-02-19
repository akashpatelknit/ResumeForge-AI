"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Layout,
  BarChart3,
  Settings,
  Menu,
  X,
  Zap,
  Target,
  Bot,
  Mic,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Briefcase,
  Search,
  Linkedin,
  Mail,
  Users,
  MessageSquare,
  BookOpen,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface NavChild {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavItem {
  name: string;
  icon: React.ElementType;
  href?: string;
  children?: NavChild[];
}

const navigation: NavItem[] = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  {
    name: "Resumes",
    icon: FileText,
    children: [
      { name: "My Resumes", href: "/dashboard/resumes", icon: FileText },
      { name: "Create New", href: "/dashboard/resumes/new", icon: PlusCircle },
      { name: "Templates", href: "/dashboard/templates", icon: Layout },
    ],
  },
  {
    name: "Job Applications",
    icon: Target,
    children: [
      {
        name: "Application Tracker",
        href: "/dashboard/jobs/tracker",
        icon: Briefcase,
      },
      { name: "Job Analyzer", href: "/dashboard/jobs/analyzer", icon: Search },
    ],
  },
  {
    name: "AI Tools",
    icon: Bot,
    children: [
      {
        name: "LinkedIn Messages",
        href: "/dashboard/ai/linkedin",
        icon: Linkedin,
      },
      { name: "Cold Emails", href: "/dashboard/ai/cold-emails", icon: Mail },
      {
        name: "Cover Letters",
        href: "/dashboard/ai/cover-letters",
        icon: FileText,
      },
      {
        name: "Referral Messages",
        href: "/dashboard/ai/referrals",
        icon: Users,
      },
    ],
  },
  {
    name: "Interview Prep",
    icon: Mic,
    children: [
      {
        name: "Mock Interview",
        href: "/dashboard/interview/mock",
        icon: MessageSquare,
      },
      {
        name: "Question Bank",
        href: "/dashboard/interview/questions",
        icon: BookOpen,
      },
      { name: "STAR Generator", href: "/dashboard/interview/star", icon: Star },
    ],
  },
  { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["Resumes"]);
  const pathname = usePathname();

  const toggleSection = (name: string) => {
    setOpenSections((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name],
    );
  };

  const isChildActive = (children: NavChild[]) =>
    children.some((child) => pathname.startsWith(child.href));

  return (
    <>
      {/* Custom scrollbar styles */}
      <style>{`
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 999px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        /* Firefox */
        .sidebar-nav {
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }
      `}</style>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-none"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ResumeForge
                </h1>
                <p className="text-xs text-gray-500 font-medium">AI Powered</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;

              // Single link
              if (!item.children) {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href!);

                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-200"
                          : "text-gray-700 hover:bg-gray-100 hover:translate-x-1"
                      }`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 ${!isActive && "group-hover:scale-110 transition-transform"}`}
                    />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              }

              // Section with children
              const isOpen = openSections.includes(item.name);
              const hasActiveChild = isChildActive(item.children);

              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleSection(item.name)}
                    className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer border-none bg-transparent
                      ${
                        hasActiveChild
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="font-medium text-sm flex-1 text-left">
                      {item.name}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActiveRoute =
                          pathname === child.href ||
                          pathname.startsWith(child.href);

                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                              ${
                                isChildActiveRoute
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-100"
                                  : "text-gray-600 hover:bg-gray-100 hover:translate-x-1"
                              }`}
                          >
                            <ChildIcon className="w-4 h-4 shrink-0" />
                            <span className="text-sm font-medium">
                              {child.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Upgrade CTA */}
          <div className="p-4 border-t border-gray-100 shrink-0">
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 rounded-2xl p-4 text-white relative overflow-hidden">
              {/* Decorative blob */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Pro
                  </span>
                </div>
                <p className="text-sm font-medium mb-3 leading-relaxed opacity-90">
                  Unlock unlimited resumes & AI tools
                </p>
                <Button className="w-full bg-white text-blue-700 hover:bg-gray-50 font-semibold shadow-lg text-sm cursor-pointer">
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
