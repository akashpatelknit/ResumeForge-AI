"use client";
import React, { useState } from "react";
import {
  Home,
  FileText,
  Layout,
  BarChart3,
  Settings,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", icon: Home, href: "/dashboard", active: true },
  { name: "My Resumes", icon: FileText, href: "/resumes", active: false },
  { name: "Templates", icon: Layout, href: "/templates", active: false },
  { name: "Analytics", icon: BarChart3, href: "/analytics", active: false },
  { name: "Settings", icon: Settings, href: "/settings", active: false },
];

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Overlay for mobile */}
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
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ResumeForge
                </h1>
                <p className="text-xs text-gray-500 font-medium">AI Powered</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${
                      item.active
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200"
                        : "text-gray-700 hover:bg-gray-100 hover:translate-x-1"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${item.active ? "" : "group-hover:scale-110 transition-transform"}`}
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                </a>
              );
            })}
          </nav>

          {/* Upgrade CTA */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-2xl p-4 text-white mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Pro
                  </span>
                </div>
                <p className="text-sm font-medium mb-3 leading-relaxed">
                  Unlock unlimited resumes & premium templates
                </p>
                <Button className="w-full bg-white text-purple-700 hover:bg-gray-100 font-semibold shadow-lg">
                  Upgrade Now
                </Button>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 px-2">
              <Avatar className="w-10 h-10 ring-2 ring-purple-100">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  Sarah Johnson
                </p>
                <p className="text-xs text-gray-500 truncate">
                  sarah@example.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
