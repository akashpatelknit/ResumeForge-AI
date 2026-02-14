"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  Home,
  FileText,
  Layout,
  BarChart3,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: <Home size={20} /> },
  {
    name: "My Resumes",
    href: "/dashboard/resumes",
    icon: <FileText size={20} />,
  },
  {
    name: "Templates",
    href: "/dashboard/template",
    icon: <Layout size={20} />,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 size={20} />,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: <Settings size={20} />,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col p-6 transition-all duration-300 z-40 lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="mb-12 flex items-center gap-2">
          <div className="h-8 w-8 bg-linear-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RF</span>
          </div>
          <div className="font-bold text-gray-900">ResumeForge</div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <button
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-linear-to-r from-purple-50 to-blue-50 text-purple-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            </Link>
          ))}
        </nav>

        {/* Upgrade CTA */}
        <div className="mb-6">
          <Button
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
            size="lg"
          >
            Upgrade to Pro
          </Button>
        </div>

        {/* User Profile */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://avatar.vercel.sh/user" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 text-sm">John Doe</p>
                <p className="text-xs text-gray-500">john@example.com</p>
              </div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
