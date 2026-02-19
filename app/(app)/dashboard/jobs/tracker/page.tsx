"use client";
import { useState } from "react";
import {
  Briefcase,
  Plus,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Clock,
  MapPin,
  ExternalLink,
  Edit3,
  FileText,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedDate: string | null;
  updatedDate: string;
  matchScore: number;
  tags: string[];
  location: string;
  salary: string;
  notes: string;
  url: string;
}

interface Column {
  id: string;
  label: string;
  color: string;
  icon: React.ElementType;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS: Column[] = [
  { id: "wishlist", label: "Wishlist", color: "gray", icon: Target },
  { id: "applied", label: "Applied", color: "blue", icon: Clock },
  { id: "interview", label: "Interview", color: "yellow", icon: MessageSquare },
  { id: "offer", label: "Offer", color: "green", icon: CheckCircle2 },
  { id: "rejected", label: "Rejected", color: "red", icon: XCircle },
];

const SAMPLE_APPLICATIONS: Application[] = [
  {
    id: "1",
    company: "Google",
    role: "Senior Full Stack Developer",
    status: "interview",
    appliedDate: "2024-02-10",
    updatedDate: "2024-02-15",
    matchScore: 92,
    tags: ["Remote", "Full-time"],
    location: "Mountain View, CA",
    salary: "$180k - $220k",
    notes: "Phone screen scheduled for Friday 3 PM",
    url: "https://careers.google.com/job/123",
  },
  {
    id: "2",
    company: "Meta",
    role: "Frontend Engineer",
    status: "applied",
    appliedDate: "2024-02-15",
    updatedDate: "2024-02-15",
    matchScore: 78,
    tags: ["Hybrid", "Full-time"],
    location: "Menlo Park, CA",
    salary: "$160k - $200k",
    notes: "",
    url: "https://meta.com/careers/job/456",
  },
  {
    id: "3",
    company: "Netflix",
    role: "Senior React Developer",
    status: "applied",
    appliedDate: "2024-02-12",
    updatedDate: "2024-02-14",
    matchScore: 85,
    tags: ["Remote", "Full-time"],
    location: "Los Gatos, CA",
    salary: "$190k - $240k",
    notes: "Hiring manager: Sarah Chen",
    url: "https://netflix.com/jobs/789",
  },
  {
    id: "4",
    company: "Stripe",
    role: "Full Stack Engineer",
    status: "wishlist",
    appliedDate: null,
    updatedDate: "2024-02-16",
    matchScore: 88,
    tags: ["Remote", "Full-time"],
    location: "San Francisco, CA",
    salary: "$170k - $210k",
    notes: "Wait for referral from John",
    url: "https://stripe.com/jobs/101",
  },
  {
    id: "5",
    company: "Airbnb",
    role: "Software Engineer",
    status: "offer",
    appliedDate: "2024-01-20",
    updatedDate: "2024-02-18",
    matchScore: 90,
    tags: ["Hybrid", "Full-time"],
    location: "San Francisco, CA",
    salary: "$175k - $215k",
    notes: "Offer received! Deadline: Feb 25",
    url: "https://airbnb.com/careers/202",
  },
  {
    id: "6",
    company: "Amazon",
    role: "SDE II",
    status: "rejected",
    appliedDate: "2024-02-01",
    updatedDate: "2024-02-08",
    matchScore: 72,
    tags: ["Onsite", "Full-time"],
    location: "Seattle, WA",
    salary: "$150k - $180k",
    notes: "Rejected after phone screen",
    url: "https://amazon.jobs/303",
  },
  {
    id: "7",
    company: "Uber",
    role: "Senior Engineer",
    status: "interview",
    appliedDate: "2024-02-05",
    updatedDate: "2024-02-17",
    matchScore: 81,
    tags: ["Hybrid", "Full-time"],
    location: "San Francisco, CA",
    salary: "$165k - $200k",
    notes: "Final round next Tuesday",
    url: "https://uber.com/careers/404",
  },
  {
    id: "8",
    company: "Microsoft",
    role: "Software Engineer II",
    status: "applied",
    appliedDate: "2024-02-14",
    updatedDate: "2024-02-14",
    matchScore: 76,
    tags: ["Hybrid", "Full-time"],
    location: "Redmond, WA",
    salary: "$155k - $190k",
    notes: "",
    url: "https://microsoft.com/jobs/505",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCompanyInitial = (company: string) => company.charAt(0).toUpperCase();

const getColumnColor = (color: string) => {
  const colors: Record<
    string,
    { bg: string; border: string; text: string; badge: string }
  > = {
    gray: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-700",
      badge: "bg-gray-100 text-gray-700",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-700",
    },
    yellow: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-700",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      badge: "bg-green-100 text-green-700",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      badge: "bg-red-100 text-red-700",
    },
  };
  return colors[color] ?? colors.gray;
};

const getMatchScoreColor = (score: number) => {
  if (score >= 85) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
  if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "Not applied";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── Shared Card Component ────────────────────────────────────────────────────

function AppCard({
  app,
  onDragStart,
  onClick,
}: {
  app: Application;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, app: Application) => void;
  onClick: (app: Application) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, app)}
      onClick={() => onClick(app)}
      className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group min-w-0"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {getCompanyInitial(app.company)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-gray-900 truncate leading-tight">
              {app.role}
            </h4>
            <p className="text-xs text-gray-500 truncate">{app.company}</p>
          </div>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded cursor-pointer border-none bg-transparent shrink-0 ml-1"
        >
          <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-1 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{app.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{formatDate(app.updatedDate)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2.5">
        {app.tags.map((tag, i) => (
          <span
            key={i}
            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium"
          >
            {tag}
          </span>
        ))}
        {app.matchScore && (
          <span
            className={`px-1.5 py-0.5 text-xs rounded font-semibold border ${getMatchScoreColor(app.matchScore)}`}
          >
            {app.matchScore}%
          </span>
        )}
      </div>

      {app.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2">
          <p className="text-xs text-amber-700 line-clamp-2">{app.notes}</p>
        </div>
      )}

      <div className="flex items-center pt-2 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(app.url, "_blank");
          }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer border-none bg-transparent"
        >
          <ExternalLink className="w-3 h-3" /> View
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer border-none bg-transparent"
        >
          <Edit3 className="w-3 h-3" /> Edit
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ApplicationTracker() {
  const [applications, setApplications] =
    useState<Application[]>(SAMPLE_APPLICATIONS);
  const [selectedCard, setSelectedCard] = useState<Application | null>(null);
  const [draggedCard, setDraggedCard] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<string>("applied");

  const stats = {
    total: applications.length,
    inProgress: applications.filter((a) =>
      ["applied", "interview"].includes(a.status),
    ).length,
    interviews: applications.filter((a) => a.status === "interview").length,
    responseRate:
      Math.round(
        (applications.filter(
          (a) => a.status !== "wishlist" && a.status !== "applied",
        ).length /
          applications.filter((a) => a.status !== "wishlist").length) *
          100,
      ) || 0,
  };

  const getApplicationsByStatus = (status: string): Application[] =>
    applications.filter((app) => app.status === status);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    card: Application,
  ) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    newStatus: string,
  ) => {
    e.preventDefault();
    if (draggedCard && draggedCard.status !== newStatus) {
      setApplications((apps) =>
        apps.map((app) =>
          app.id === draggedCard.id
            ? {
                ...app,
                status: newStatus,
                updatedDate: new Date().toISOString().split("T")[0],
              }
            : app,
        ),
      );
    }
    setDraggedCard(null);
  };

  const activeTabIndex = COLUMNS.findIndex((c) => c.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Application Tracker
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Manage your job applications in one place
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-gray-300 transition-all cursor-pointer">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-gray-300 transition-all cursor-pointer">
              <ArrowUpDown className="w-4 h-4" /> Sort
            </button>
            <button className="sm:hidden p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition-all cursor-pointer">
              <Filter className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border-none">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Application</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Stats — 2 cols on mobile, 4 on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {[
            {
              label: "Total",
              sublabel: "All stages",
              value: stats.total,
              icon: Briefcase,
              iconColor: "text-gray-400",
            },
            {
              label: "In Progress",
              sublabel: "Applied & interviews",
              value: stats.inProgress,
              icon: TrendingUp,
              iconColor: "text-blue-500",
            },
            {
              label: "Interviews",
              sublabel: "Active conversations",
              value: stats.interviews,
              icon: MessageSquare,
              iconColor: "text-amber-500",
            },
            {
              label: "Response Rate",
              sublabel: "Of applications sent",
              value: `${stats.responseRate}%`,
              icon: Target,
              iconColor: "text-green-500",
            },
          ].map(({ label, sublabel, value, icon: Icon, iconColor }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate pr-1">
                  {label}
                </span>
                <Icon className={`w-4 h-4 ${iconColor} shrink-0`} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                {sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MOBILE VIEW: Tabbed single-column ── */}
      <div className="block lg:hidden">
        {/* Tab navigation */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() =>
              activeTabIndex > 0 && setActiveTab(COLUMNS[activeTabIndex - 1].id)
            }
            disabled={activeTabIndex === 0}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            className="flex-1 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex gap-1.5">
              {COLUMNS.map((col) => {
                const colors = getColumnColor(col.color);
                const ColIcon = col.icon;
                const count = getApplicationsByStatus(col.id).length;
                const isActive = activeTab === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => setActiveTab(col.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? `${colors.bg} ${colors.border} ${colors.text}`
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <ColIcon className="w-3.5 h-3.5" />
                    {col.label}
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? colors.badge : "bg-gray-100 text-gray-500"}`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() =>
              activeTabIndex < COLUMNS.length - 1 &&
              setActiveTab(COLUMNS[activeTabIndex + 1].id)
            }
            disabled={activeTabIndex === COLUMNS.length - 1}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shrink-0 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Active column */}
        {(() => {
          const column = COLUMNS.find((c) => c.id === activeTab)!;
          const columnApps = getApplicationsByStatus(activeTab);
          const ColumnIcon = column.icon;
          return columnApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
              <ColumnIcon className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">
                No applications here
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Add a new one to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {columnApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onDragStart={handleDragStart}
                  onClick={setSelectedCard}
                />
              ))}
            </div>
          );
        })()}
      </div>

      {/* ── DESKTOP VIEW: 5-column Kanban ── */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-3 w-full min-w-0">
        {COLUMNS.map((column) => {
          const columnApps = getApplicationsByStatus(column.id);
          const colors = getColumnColor(column.color);
          const ColumnIcon = column.icon;
          return (
            <div
              key={column.id}
              className="min-w-0 flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div
                className={`${colors.bg} border ${colors.border} rounded-xl p-3 mb-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <ColumnIcon className={`w-4 h-4 ${colors.text} shrink-0`} />
                    <h3
                      className={`font-semibold text-sm ${colors.text} truncate`}
                    >
                      {column.label}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ml-1 ${colors.badge}`}
                  >
                    {columnApps.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3 min-h-32">
                {columnApps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
                    <ColumnIcon className="w-7 h-7 text-gray-300 mb-1.5" />
                    <p className="text-xs text-gray-400">No applications</p>
                  </div>
                ) : (
                  columnApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onDragStart={handleDragStart}
                      onClick={setSelectedCard}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Detail Modal ── */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl sm:mx-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-0 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {getCompanyInitial(selectedCard.company)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-0.5 truncate">
                      {selectedCard.role}
                    </h2>
                    <p className="text-gray-500 text-sm truncate">
                      {selectedCard.company}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent p-1 ml-2 shrink-0 text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Location
                  </p>
                  <p className="text-sm text-gray-900 truncate">
                    {selectedCard.location}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Salary Range
                  </p>
                  <p className="text-sm text-gray-900 truncate">
                    {selectedCard.salary}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Applied Date
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedCard.appliedDate
                      ? new Date(selectedCard.appliedDate).toLocaleDateString()
                      : "Not yet"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Match Score
                  </p>
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-lg font-semibold border ${getMatchScoreColor(selectedCard.matchScore)}`}
                  >
                    {selectedCard.matchScore}%
                  </span>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Notes
                </p>
                <textarea
                  defaultValue={selectedCard.notes}
                  placeholder="Add notes about this application..."
                  className="w-full h-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => window.open(selectedCard.url, "_blank")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" /> View Job Posting
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer border-none">
                  <FileText className="w-4 h-4" /> View Resume Used
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
