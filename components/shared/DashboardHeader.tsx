import { Search, Bell } from "lucide-react";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";

export default function DashboardHeader() {
  const { user, isLoaded, isSignedIn } = useUser();
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4">
        {/* Page Title */}
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.firstName || "User"}
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 w-80 hover:bg-gray-150 transition-colors group">
            <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <input
              type="text"
              placeholder="Search resumes, templates..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
            />
            <kbd className="hidden lg:block px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group">
            <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Avatar Dropdown */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
