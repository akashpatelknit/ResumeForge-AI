import React from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResumeFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export default function ResumeFilters({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
}: ResumeFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-1">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search resumes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Filter Dropdown */}
      <Select value={filterCategory} onValueChange={setFilterCategory}>
        <SelectTrigger className="w-full sm:w-45">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Resumes</SelectItem>
          <SelectItem value="favorites">Favorites</SelectItem>
          <SelectItem value="recent">Recent</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Dropdown */}
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-full sm:w-45">
          <ArrowUpDown className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lastModified">Last Modified</SelectItem>
          <SelectItem value="name">Name (A-Z)</SelectItem>
          <SelectItem value="atsScore">ATS Score</SelectItem>
          <SelectItem value="downloads">Most Downloads</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
