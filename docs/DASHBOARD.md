# ResumeForge AI - Dashboard Documentation

## Overview

A modern, professional admin dashboard for the ResumeForge AI resume builder SaaS application. The dashboard provides users with resume analytics, management tools, and AI-powered recommendations.

## Project Structure

```
components/
├── shared/
│   ├── DashboardSidebar.tsx    # Left navigation sidebar
│   └── DashboardHeader.tsx     # Top header with search & notifications
├── dashboard/
│   ├── StatsCard.tsx           # Individual stat cards (4 cards)
│   ├── QuickActions.tsx        # Quick action buttons
│   ├── RecentResumes.tsx       # Recent resumes table
│   ├── ActivityChart.tsx       # Line chart for downloads/views
│   └── AIInsights.tsx          # AI recommendations sidebar
app/
├── (app)/
│   ├── layout.tsx              # App layout with sidebar
│   └── dashboard/
│       └── page.tsx            # Main dashboard home page
```

## Components Documentation

### 1. **DashboardSidebar** (`components/shared/DashboardSidebar.tsx`)

Left navigation sidebar with 240px width on desktop.

**Features:**

- Logo with gradient background (RF badge)
- 5 main navigation items:
  - Dashboard (Home icon)
  - My Resumes (FileText icon)
  - Templates (Layout icon)
  - Analytics (BarChart3 icon)
  - Settings (Settings icon)
- User profile section at bottom with avatar
- "Upgrade to Pro" CTA button with gradient
- Mobile hamburger menu that slides in
- Active state highlighting with purple gradient
- Responsive: Collapses on mobile, full on desktop

**Props:** None (uses `usePathname()` internally)

### 2. **DashboardHeader** (`components/shared/DashboardHeader.tsx`)

Top header bar with page title, search, notifications, and user menu.

**Features:**

- Page title and description
- Search input (hidden on mobile)
- Notifications bell with red indicator dot
- User avatar dropdown menu
- Responsive layout

**Props:**

```tsx
interface DashboardHeaderProps {
  title: string;
  description?: string;
}
```

### 3. **StatsCard** (`components/dashboard/StatsCard.tsx`)

Individual statistic card with icon, trend, and badge support.

**Features:**

- Large bold number display (text-4xl)
- Icon in white rounded box
- Optional trend indicator (up/down arrow with percentage)
- Optional badge (Excellent, etc)
- Accent color gradient (purple, blue, green, pink)
- Hover effect (subtle lift + shadow)
- Updated time display
- Responsive grid layout

**Props:**

```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number | string; direction: "up" | "down" };
  badge?: { label: string; color: "green" | "blue" | "purple" | "pink" };
  accentColor: "purple" | "blue" | "green" | "pink";
  updated?: string;
}
```

**Stats Cards:**

1. **Total Resumes** - 12 resumes, +2 trend, purple accent
2. **Total Downloads** - 48 downloads, +15% trend, blue accent
3. **ATS Score Average** - 87/100, Excellent badge, green accent
4. **AI Optimizations** - 24 optimizations, +8 trend, pink accent

### 4. **QuickActions** (`components/dashboard/QuickActions.tsx`)

3-column grid of action cards for common tasks.

**Features:**

- Gradient backgrounds on icons
- Hover effects (scale + shadow)
- 3 action cards:
  1. Create New Resume (purple-blue gradient)
  2. Import from LinkedIn (blue gradient)
  3. Generate Cover Letter (purple-pink gradient)
- Links to respective pages
- Icon scaling on hover

### 5. **RecentResumes** (`components/dashboard/RecentResumes.tsx`)

Table showing 5 most recent resumes with management actions.

**Features:**

- Responsive table with horizontal scroll on mobile
- Columns:
  - Resume Title with thumbnail emoji
  - Template Used
  - Last Modified (relative time)
  - ATS Score with progress bar
  - Actions (edit, download, more)
- Row hover effects
- Dropdown menu for duplicate/delete
- "View All" link to full resumes page
- Icons: EditIcon, Download, Copy, Trash

**Sample Data:**

```tsx
- Full Stack Developer Resume | Modern | 2 hours ago | 87
- Senior Frontend Engineer CV | Professional | Yesterday | 91
- Product Manager Resume | Minimal | 3 days ago | 82
- UX Designer Portfolio | Modern | 1 week ago | 75
- Data Scientist Resume | Professional | 2 weeks ago | 79
```

### 6. **ActivityChart** (`components/dashboard/ActivityChart.tsx`)

Area chart showing downloads and views over the last 7 days.

**Features:**

- Recharts AreaChart with dual data series
- Gradient fills:
  - Purple for downloads
  - Blue for views
- Custom tooltip on hover
- Clean grid lines
- X-axis: Days of week (Mon-Sun)
- Y-axis: Count
- Responsive height and width
- Legend with circle icons
- 7-day sample data

### 7. **AIInsights** (`components/dashboard/AIInsights.tsx`)

Right sidebar with 3-4 AI recommendations.

**Features:**

- Sparkles icon header with gradient background
- Priority levels: high (red), medium (yellow), low (blue)
- 3 insights with:
  1. Add Quantifiable Metrics (high priority)
  2. Keyword Optimization Opportunity (high priority)
  3. Template Recommendation (medium priority)
- "Get AI Optimization" button with gradient
- Priority badges
- Colored left borders

## Design System

### Colors

- **Primary Gradient:** purple-600 to blue-600
- **Secondary Colors:**
  - Green: Success/improved metrics
  - Pink: AI features/recommendations
  - Yellow: Warnings
  - Red: Alerts/dangers
- **Neutral:**
  - Background: gray-50
  - Cards: white
  - Text: gray-900 (headings), gray-600 (body)

### Typography

- **Headings:** `font-bold text-2xl to text-3xl`
- **Subheadings:** `font-semibold text-lg`
- **Body:** `text-sm to text-base`
- **Stats Numbers:** `text-3xl to text-4xl font-bold`

### Spacing

- Card padding: `p-6`
- Grid gaps: `gap-6`
- Section margins: `mb-8`
- Consistent spacing patterns throughout

### Components Used

- **shadcn/ui:** Card, Button, Badge, Table, Avatar, Progress, DropdownMenu
- **lucide-react:** Icons (20px, 16px sizes)
- **recharts:** Charts and data visualization
- **Tailwind CSS:** Styling and responsive design

## Responsive Design

### Mobile (< 768px)

- Sidebar hidden, hamburger menu in top-left
- Stats cards: 1 column
- Quick actions: Stack vertically
- Table: Horizontal scroll with essential columns only
- Header search: Hidden
- Font sizes: Reduced for smaller screens

### Tablet (768px - 1024px)

- Sidebar collapsible
- Stats cards: 2 columns
- Quick actions: 2-3 columns
- Full table view with horizontal scroll

### Desktop (> 1024px)

- Full sidebar always visible (240px width)
- Stats cards: 4 columns
- Full table view
- All features visible and optimized

## Animations

- **Page Load:** `animate-in fade-in slide-in-from-bottom-4` with staggered delays
- **Card Hover:** `transition-all duration-200` with shadow and scale effects
- **Sidebar:** `transition-all duration-300` for slide-in animation
- **Charts:** Smooth animations from recharts library

## Usage

### Navigate to Dashboard

```
Visit: /dashboard
```

### File Structure

```
app/(app)/dashboard/page.tsx        → Main dashboard
components/shared/DashboardSidebar  → Navigation
components/shared/DashboardHeader   → Top bar
components/dashboard/               → Individual components
```

### Extending the Dashboard

**Add a new dashboard section:**

```tsx
// 1. Create component in components/dashboard/
// 2. Import in app/(app)/dashboard/page.tsx
// 3. Add to grid/layout with proper spacing

import { YourComponent } from "@/components/dashboard/YourComponent";

// In page.tsx:
<div className="animate-in fade-in slide-in-from-bottom-4 delay-300">
  <YourComponent />
</div>;
```

## Performance Considerations

- All components are Client Components (`'use client'`)
- Recharts handles large datasets efficiently
- Table uses virtualization for scrolling
- Images/thumbnails could be optimized with Next.js Image component
- Consider adding data caching/SWR for real data

## Future Enhancements

- [ ] Real data integration from backend API
- [ ] Real-time notifications
- [ ] Export dashboard data
- [ ] Custom date range selection for charts
- [ ] Dark mode support
- [ ] More analytics views
- [ ] Resume comparison tool
- [ ] Template usage analytics
- [ ] User behavior heatmaps

## Color Reference

The dashboard uses a modern SaaS color palette:

- **Purple:** `from-purple-600 to-blue-600` (primary gradient)
- **Success:** `text-green-600`, `bg-green-100`
- **Warning:** `text-yellow-600`, `bg-yellow-100`
- **Danger:** `text-red-600`, `bg-red-100`
- **Info:** `text-blue-600`, `bg-blue-100`
- **Neutral:** `gray-50` (bg), `gray-900` (text)

## Browser Support

- Chrome/Edge: Latest
- Firefox: Latest
- Safari: Latest
- Mobile browsers: iOS 14+, Android 8+

## Accessibility

- All interactive elements have hover states
- Semantic HTML structure
- Proper contrast ratios
- Icon labels and descriptions
- Keyboard navigation support
- ARIA labels where needed

## Dependencies

- Next.js 16.1+
- React 19+
- lucide-react (icons)
- recharts (charts)
- shadcn/ui (components)
- Tailwind CSS (styling)
