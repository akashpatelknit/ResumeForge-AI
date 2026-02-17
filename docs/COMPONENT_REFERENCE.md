# Dashboard Components - Quick Reference

## Component Showcase

### 1. Sidebar Navigation

```
┌─────────────────────────────────┐
│                                 │
│  [Logo] ResumeForge              │
│                                 │
│  🏠 Dashboard ← Active           │
│  📄 My Resumes                   │
│  📐 Templates                    │
│  📊 Analytics                    │
│  ⚙️  Settings                    │
│                                 │
│ ─────────────────────────────── │
│                                 │
│  [Upgrade to Pro] (Gradient)     │
│                                 │
│                                 │
│  👤 John Doe                     │
│     john@example.com             │
│                                 │
└─────────────────────────────────┘
```

**Props:** None (uses `usePathname()`)
**File:** `components/shared/DashboardSidebar.tsx`

---

### 2. Dashboard Header

```
┌─────────────────────────────────────────────────────────┐
│ Welcome back, John                        🔍 📳 👤      │
│ Here's what's happening with your resumes today.        │
└─────────────────────────────────────────────────────────┘
```

**Props:**

- `title: string` - Main heading
- `description?: string` - Subheading

**File:** `components/shared/DashboardHeader.tsx`

---

### 3. Stats Card

```
┌──────────────────────────────┐
│ 📄 Total Resumes    [+2 ↑]   │
│ Updated 2 mins ago          │
│                              │
│            12                │
└──────────────────────────────┘

Color Variations:
🟣 Purple   🔵 Blue   🟢 Green   🩷 Pink
```

**Props:**

```tsx
{
  title: string
  value: string | number
  icon: ReactNode
  trend?: { value: string, direction: 'up' | 'down' }
  badge?: { label: string, color: 'green' | 'blue' | 'purple' | 'pink' }
  accentColor: 'purple' | 'blue' | 'green' | 'pink'
  updated?: string
}
```

**File:** `components/dashboard/StatsCard.tsx`

---

### 4. Quick Actions Grid

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  ➕ Create      │  │  💼 Import      │  │  📝 Generate   │
│  New Resume     │  │  from LinkedIn  │  │  Cover Letter  │
│                 │  │                 │  │                │
│ Start from      │  │ Auto-fill from  │  │ AI-powered     │
│ scratch or      │  │ your profile    │  │ cover letter   │
│ use template    │  │                 │  │ builder        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Props:** None (static component)
**File:** `components/dashboard/QuickActions.tsx`

---

### 5. Recent Resumes Table

```
┌────────────────────────┬───────────┬────────────┬──────────┬─────────┐
│ Resume Title           │ Template  │ Modified   │ ATS ▓▓▓▓ │ Actions │
├────────────────────────┼───────────┼────────────┼──────────┼─────────┤
│ 📄 Full Stack Dev      │ Modern    │ 2h ago     │ 87 ✎ ⬇  │ ⋯       │
│ 📑 Senior Frontend     │ Prof      │ Yesterday  │ 91 ✎ ⬇  │ ⋯       │
│ 📋 Product Manager     │ Minimal   │ 3d ago     │ 82 ✎ ⬇  │ ⋯       │
└────────────────────────┴───────────┴────────────┴──────────┴─────────┘

[View All Resumes →]
```

**Props:** None (uses sample data)
**File:** `components/dashboard/RecentResumes.tsx`

---

### 6. Activity Chart

```
│
│                             ■▔▔■
│                    ■▔▔■    │    ■      Views
│         ■▔▔■      │    ■   │     ■
│        │    ■    │     ■  │       ■   Downloads
│ ═══■  │     ─────┴──────────────
│    └─────────────────────────────
└────────────────────────────────→
 Mon  Tue  Wed  Thu  Fri  Sat  Sun

[Custom Tooltip on Hover]
```

**Props:** None (uses 7-day sample data)
**File:** `components/dashboard/ActivityChart.tsx`

---

### 7. AI Insights Card

```
┌────────────────────────────────────────┐
│ ✨ AI Recommendations                  │
│ Personalized tips to improve resumes   │
│                                        │
│ 🎯 Add Quantifiable Metrics [HIGH]    │
│    Strengthen with specific numbers    │
│                                        │
│ 📈 Keyword Optimization [HIGH]         │
│    Could improve score by 12%          │
│                                        │
│ ⚡ Template Recommendation [MEDIUM]    │
│    Professional template scores higher │
│                                        │
│ [Get AI Optimization] (Gradient)       │
└────────────────────────────────────────┘
```

**Props:** None (uses sample insights)
**File:** `components/dashboard/AIInsights.tsx`

---

## Dashboard Layout Structure

```
┌───────────────────────────────────────────────────────────────────┐
│ [≡] ResumeForge    │   Welcome back, John          🔍 📳 👤      │
│                    │   Here's what's happening...                 │
├────────────────────┼───────────────────────────────────────────────┤
│                    │                                               │
│ [Dashboard] ◄──    │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ [My Resumes]       │  │  12    │  │  48    │  │ 87/100 │  │  24    │
│ [Templates]        │  │Resumes │  │Downloads  │ATS Avg │  │AI Opts │
│ [Analytics]        │  └────────┘  └────────┘  └────────┘  └────────┘
│ [Settings]         │
│ ─────────────      │  Quick Actions
│ [Upgrade Pro]      │  ┌────────────────┐ ┌────────────────┐ ┌─────────────┐
│ ─────────────      │  │ ➕ Create New  │ │ 💼 Import      │ │ 📝 Generate │
│                    │  │ Resume         │ │ LinkedIn       │ │ Cover Letter│
│ [👤] John Doe      │  └────────────────┘ └────────────────┘ └─────────────┘
│ john@example.com   │
│                    │  Recent Resumes Table (5 items)
│                    │  ┌──────────────┬────┬────────┬─────┬────┐
│                    │  │ Title        │Tmpl│ Modif  │ ATS │Act │
│                    │  ├──────────────┼────┼────────┼─────┼────┤
│                    │  │ Full Stack..  │Mod │ 2h ago │ 87% │ ✎ ⬇│ ⋯
│                    │  │ Senior FE...  │Prof│ 1d ago │ 91% │ ✎ ⬇│ ⋯
│                    │  └──────────────┴────┴────────┴─────┴────┘
│                    │
│                    │  Activity Chart                │ AI Insights
│                    │  ┌──────────────────────────┐  │ ┌─────────┐
│                    │  │  Downloads & Views       │  │ │ 7 Day   │
│                    │  │  Mon-Sun Line Chart      │  │ │ Trend   │
│                    │  │  [Area Chart Viz]        │  │ │ Section │
│                    │  └──────────────────────────┘  │ └─────────┘
│                    │
└────────────────────┴───────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
DashboardLayout (app/(app)/layout.tsx)
├── DashboardSidebar
│   ├── Logo
│   ├── Navigation Items
│   ├── Upgrade Button
│   └── User Profile
│
└── DashboardPage (app/(app)/dashboard/page.tsx)
    ├── DashboardHeader
    │   ├── Title & Description
    │   ├── Search Input
    │   ├── Notifications Bell
    │   └── User Avatar Menu
    │
    ├── Stats Cards Container
    │   ├── StatsCard (Total Resumes)
    │   ├── StatsCard (Total Downloads)
    │   ├── StatsCard (ATS Score)
    │   └── StatsCard (AI Optimizations)
    │
    ├── QuickActions
    │   ├── Create Resume Card
    │   ├── Import LinkedIn Card
    │   └── Generate Cover Letter Card
    │
    ├── Main Content Grid
    │   ├── Left Column (2/3 width)
    │   │   ├── RecentResumes Table
    │   │   └── ActivityChart
    │   │
    │   └── Right Sidebar (1/3 width)
    │       └── AIInsights
    │
    └── [Future sections to be added]
```

---

## Color System Reference

### Brand Gradient

```css
from-purple-600 to-blue-600
(Used for primary CTAs, stats accents)
```

### Stat Card Accents

```css
Purple:  from-purple-500/10 to-purple-500/5   border-l-4 border-purple-500
Blue:    from-blue-500/10 to-blue-500/5       border-l-4 border-blue-500
Green:   from-green-500/10 to-green-500/5     border-l-4 border-green-500
Pink:    from-pink-500/10 to-pink-500/5       border-l-4 border-pink-500
```

### Badge Status Colors

```css
Success (Green):  bg-green-100  text-green-700
Info (Blue):      bg-blue-100   text-blue-700
Primary (Purple): bg-purple-100 text-purple-700
Secondary (Pink): bg-pink-100   text-pink-700
```

### Neutral Palette

```css
Background:  bg-gray-50
Cards:       bg-white
Primary:     text-gray-900
Secondary:   text-gray-600
Tertiary:    text-gray-400
Borders:     border-gray-200
```

---

## Icon Size Reference

### Sidebar Navigation

- Icons: 20px (lucide-react `size={20}`)

### Stats Cards

- Card icons: 20px (lucide-react `size={20}`)
- Trend indicators: 16px
- Badges: 12px

### Quick Actions

- Action icons: 28px (lucide-react `size={28}`)

### Table Actions

- Action buttons: 16px
- Icons in buttons: 16px

### Charts

- N/A (handled by recharts)

### AI Insights

- Insight icons: 20px
- Priority badges: small text

---

## Responsive Behavior

### Mobile (< 768px)

- Sidebar: Hidden (hamburger menu)
- Stats: 1 column
- Quick Actions: Stack vertically
- Table: Horizontal scroll
- Header search: Hidden
- Chart: Simplified

### Tablet (768px - 1024px)

- Sidebar: Collapsible
- Stats: 2 columns
- Quick Actions: 2-3 columns
- Table: Scrollable
- Header search: Visible
- Chart: Full

### Desktop (> 1024px)

- Sidebar: Always visible (240px)
- Stats: 4 columns
- Quick Actions: 3 columns (full width)
- Table: Full view
- Header search: Visible
- Chart: Full with legend

---

## Animation Timing

### Page Load

```css
Stats Cards:    fade-in slide-in (0ms)
Quick Actions:  fade-in slide-in (100ms delay)
Recent Resumes: fade-in slide-in (200ms delay)
Activity Chart: fade-in slide-in (200ms delay)
AI Insights:    fade-in slide-in (200ms delay)
```

### Interactions

```css
Card Hover:     transition-all duration-200
Button Hover:   transition-all duration-200
Sidebar Toggle: transition-all duration-300
```

---

## Data Interfaces

### StatsCard.tsx

```typescript
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

### RecentResumes.tsx

```typescript
interface Resume {
  id: string;
  title: string;
  template: string;
  lastModified: string;
  atsScore: number;
  thumbnail?: string;
}
```

### ActivityChart.tsx

```typescript
interface ChartData {
  day: string;
  downloads: number;
  views: number;
}
```

### AIInsights.tsx

```typescript
interface Insight {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: "high" | "medium" | "low";
}
```

---

## Quick Copy-Paste Examples

### Add New Stat Card

```tsx
<StatsCard
  title="Users"
  value="1,234"
  icon={<Users size={20} />}
  trend={{ value: "+12%", direction: "up" }}
  accentColor="blue"
/>
```

### Add New Quick Action

```tsx
{
  title: 'Batch Upload',
  description: 'Upload multiple resumes at once',
  icon: <Upload size={28} />,
  href: '/dashboard/upload',
  gradient: 'from-green-600 to-emerald-600',
  iconColor: 'text-white',
}
```

### Add New Table Column

```tsx
<TableHead className="text-gray-600 font-semibold">New Column Name</TableHead>;
{
  /* Then add corresponding TableCell in TableRow */
}
```

### Add New Chart Series

```tsx
<Area
  type="monotone"
  dataKey="newSeries"
  stroke="#10b981"
  strokeWidth={2}
  fillOpacity={1}
  fill="url(#colorNewSeries)"
  name="New Series"
/>
```

---

## Best Practices

✅ **DO:**

- Keep component props focused and simple
- Use Tailwind classes for styling (no inline styles)
- Import icons from lucide-react
- Use TypeScript for type safety
- Create reusable components
- Document prop interfaces
- Use responsive design utilities
- Add hover/focus states to interactive elements

❌ **DON'T:**

- Mix inline styles with Tailwind
- Create new color variables (use predefined palette)
- Leave console.log statements in components
- Hardcode user data (parameterize it)
- Create overly complex components (break into smaller pieces)
- Skip TypeScript types
- Ignore mobile responsiveness
- Use non-standard animation durations

---

This quick reference should help you navigate and extend the dashboard effectively!
