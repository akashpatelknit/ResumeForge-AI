# ResumeForge AI Dashboard - Implementation Guide

## Quick Start

### 1. View the Dashboard
Navigate to: `http://localhost:3000/dashboard`

### 2. File Locations
All dashboard files are organized in the following structure:

```
project-root/
├── app/(app)/
│   ├── layout.tsx                    ← App layout with sidebar
│   └── dashboard/
│       └── page.tsx                  ← Main dashboard page
├── components/
│   ├── shared/
│   │   ├── DashboardSidebar.tsx     ← Navigation sidebar
│   │   └── DashboardHeader.tsx      ← Top header bar
│   ├── dashboard/
│   │   ├── StatsCard.tsx            ← Individual stats
│   │   ├── QuickActions.tsx         ← Action buttons grid
│   │   ├── RecentResumes.tsx        ← Resumes table
│   │   ├── ActivityChart.tsx        ← Downloads/views chart
│   │   └── AIInsights.tsx           ← AI recommendations
│   └── ui/
│       ├── card.tsx
│       ├── button.tsx
│       ├── badge.tsx
│       ├── table.tsx
│       ├── avatar.tsx
│       ├── progress.tsx
│       └── dropdown-menu.tsx
└── DASHBOARD.md                      ← Full documentation

```

## Component Breakdown

### 1. DashboardSidebar

**Location:** `components/shared/DashboardSidebar.tsx`

**Features:**
- Fixed left sidebar (240px width)
- Logo with gradient badge
- 5 navigation items
- Active route highlighting
- Mobile hamburger menu
- User profile with avatar
- "Upgrade to Pro" CTA button

**Customization:**
```tsx
// Change navigation items
const navItems: NavItem[] = [
  { name: 'Custom Item', href: '/custom', icon: <Icon size={20} /> },
];

// Modify logo
<div className='h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600'>
  {/* Change logo color gradient here */}
</div>

// Update user profile
<p className='font-medium text-gray-900 text-sm'>Your Name</p>
<p className='text-xs text-gray-500'>your.email@example.com</p>
```

### 2. DashboardHeader

**Location:** `components/shared/DashboardHeader.tsx`

**Features:**
- Page title with description
- Search bar with magnifying icon
- Bell icon with notification dot
- User avatar dropdown menu

**Usage:**
```tsx
<DashboardHeader
  title="Your Page Title"
  description="Optional description text here"
/>
```

**Customization:**
```tsx
// Add more menu items to dropdown
<DropdownMenuItem>Custom Option</DropdownMenuItem>

// Change search placeholder
placeholder='Search something...'

// Toggle notification bell
{/* Remove or conditionally render */}
<Button variant='ghost' size='icon' className='relative'>
```

### 3. StatsCard

**Location:** `components/dashboard/StatsCard.tsx`

**Purpose:** Display key metrics with trends and badges

**Props:**
```tsx
<StatsCard
  title="Card Title"
  value="999"
  icon={<IconComponent size={20} />}
  trend={{ value: '+15%', direction: 'up' }}
  badge={{ label: 'Excellent', color: 'green' }}
  accentColor="purple"
  updated="2 mins ago"
/>
```

**Accent Color Options:**
- `purple` - Deep purple gradient
- `blue` - Deep blue gradient
- `green` - Emerald green gradient
- `pink` - Pink/rose gradient

**Badge Color Options:**
- `green` - Success
- `blue` - Info
- `purple` - Primary
- `pink` - Secondary

**Customization:**
```tsx
// Add more accent colors
const accentGradients = {
  red: 'from-red-500/10 to-red-500/5 border-l-4 border-red-500',
  orange: 'from-orange-500/10 to-orange-500/5 border-l-4 border-orange-500',
};

// Customize the card background
className={`p-6 bg-gradient-to-br ${accentGradients[accentColor]}`}
```

### 4. QuickActions

**Location:** `components/dashboard/QuickActions.tsx`

**Purpose:** 3-column grid of action cards for common tasks

**Current Actions:**
1. Create New Resume
2. Import from LinkedIn
3. Generate Cover Letter

**Customization:**
```tsx
// Add or modify actions
const actions: QuickAction[] = [
  {
    title: 'Your Action',
    description: 'Brief description',
    icon: <IconComponent size={28} />,
    href: '/path',
    gradient: 'from-color-600 to-color-700',
    iconColor: 'text-white',
  },
];
```

### 5. RecentResumes

**Location:** `components/dashboard/RecentResumes.tsx`

**Purpose:** Table showing 5 most recent resumes with actions

**Features:**
- Responsive table
- Progress bar for ATS scores
- Action dropdown menu
- Emoji thumbnails

**Current Columns:**
- Resume Title
- Template Used
- Last Modified
- ATS Score
- Actions

**Customization:**
```tsx
// Modify sample data
const recentResumes: Resume[] = [
  {
    id: '1',
    title: 'Unique Resume Title',
    template: 'Template Name',
    lastModified: 'Time ago',
    atsScore: 85,
    thumbnail: '📊',
  },
];

// Add columns
<TableHead className='text-gray-600 font-semibold'>New Column</TableHead>

// Modify actions
<DropdownMenuItem>New Action</DropdownMenuItem>
```

### 6. ActivityChart

**Location:** `components/dashboard/ActivityChart.tsx`

**Purpose:** Visualize downloads and views over 7 days

**Features:**
- Area chart with gradient fills
- Dual data series (downloads & views)
- Custom tooltip on hover
- Week view (Mon-Sun)

**Current Data:**
```tsx
const chartData = [
  { day: 'Mon', downloads: 4, views: 24 },
  { day: 'Tue', downloads: 3, views: 21 },
  // ... more days
];
```

**Customization:**
```tsx
// Change chart type
<LineChart>                          {/* Change to LineChart */}
  <Line dataKey='downloads' />        {/* Use Line instead of Area */}
</LineChart>

// Add more data series
{
  day: 'Mon',
  downloads: 4,
  views: 24,
  newMetric: 12,                     {/* Add new column */}
}

// Modify colors
<stop offset='5%' stopColor='#9333ea' />  {/* Change hex color */}

// Update gradients
<defs>
  <linearGradient id='colorNewMetric' x1='0' y1='0' x2='0' y2='1'>
    {/* Define new gradient */}
  </linearGradient>
</defs>
```

### 7. AIInsights

**Location:** `components/dashboard/AIInsights.tsx`

**Purpose:** Display AI recommendations and insights

**Current Insights:**
1. Add Quantifiable Metrics (High priority)
2. Keyword Optimization (High priority)
3. Template Recommendation (Medium priority)

**Customization:**
```tsx
// Add or modify insights
const insights: Insight[] = [
  {
    id: '1',
    title: 'Insight Title',
    description: 'Detailed description of the insight',
    icon: <IconComponent size={20} />,
    priority: 'high',    // 'high', 'medium', 'low'
  },
];

// Add priority levels
const priorityColors = {
  critical: 'border-red-300 bg-red-50',    {/* Add new level */}
};
```

## Styling Guide

### Typography Scale

```tsx
// Headings
text-2xl font-bold        {/* Page title */}
text-3xl font-bold        {/* Large heading */}
text-xl font-bold         {/* Section heading */}
text-lg font-semibold     {/* Subheading */}

// Body
text-base                 {/* Regular text */}
text-sm                   {/* Small text */}
text-xs                   {/* Extra small text */}

// Stats
text-4xl font-bold        {/* Large numbers */}
text-3xl font-bold        {/* Medium numbers */}
```

### Spacing Systems

```tsx
// Cards
p-6                       {/* 24px padding */}

// Grids
gap-6                     {/* 24px gap */}
gap-8                     {/* 32px gap */}

// Sections
mb-8                      {/* 32px bottom margin */}
mb-4                      {/* 16px bottom margin */}
```

### Color Palette

```tsx
// Primary
bg-gradient-to-r from-purple-600 to-blue-600    {/* Primary gradient */}

// Accents
bg-purple-100 text-purple-700                   {/* Purple badge */}
bg-blue-100 text-blue-700                       {/* Blue badge */}
bg-green-100 text-green-700                     {/* Green badge */}
bg-pink-100 text-pink-700                       {/* Pink badge */}

// Neutral
bg-gray-50                                      {/* Page background */}
bg-white                                        {/* Card background */}
text-gray-900                                   {/* Primary text */}
text-gray-600                                   {/* Secondary text */}
text-gray-400                                   {/* Tertiary text */}
```

## Responsive Design

### Breakpoints Used

```tsx
// Mobile (default)
<Component className='...' />

// Tablet (768px+)
<Component className='md:...' />

// Desktop (1024px+)
<Component className='lg:...' />
```

### Responsive Examples

```tsx
// Stats Grid
grid-cols-1           {/* 1 column mobile */}
md:grid-cols-2        {/* 2 columns tablet */}
lg:grid-cols-4        {/* 4 columns desktop */}

// Sidebar
translate-x-0 lg:translate-x-0    {/* Visible on large screens */}
-translate-x-full lg:translate-x-0 {/* Hidden by default, visible on lg */}

// Padding
p-6 lg:p-8            {/* Smaller padding mobile, larger desktop */}
gap-6 lg:gap-8        {/* Different gaps by screen size */}
```

## Animations

### Built-in Animations

```tsx
// Fade in with slide
animate-in fade-in slide-in-from-bottom-4

// Staggered animations
delay-100         {/* First element */}
delay-200         {/* Second element */}
delay-300         {/* Third element */}

// Transitions
transition-all duration-200     {/* Smooth 200ms transition */}
transition-all duration-300     {/* Longer 300ms transition */}
```

### Custom Animation Example

```tsx
<div className='animate-in fade-in slide-in-from-bottom-4 delay-100'>
  {/* This element fades in and slides up from bottom with 100ms delay */}
</div>
```

## Data Integration

### Connecting Real Data

To connect real data, update the component props:

```tsx
// In page.tsx
const [resumes, setResumes] = useState([]);

useEffect(() => {
  // Fetch from API
  fetch('/api/resumes')
    .then(res => res.json())
    .then(data => setResumes(data));
}, []);

// Pass to component
<RecentResumes data={resumes} />
```

### API Integration Points

1. **Stats Cards** - Fetch from `/api/stats` or `/api/dashboard/metrics`
2. **Recent Resumes** - Fetch from `/api/resumes?limit=5&sort=recent`
3. **Activity Chart** - Fetch from `/api/analytics/activity?period=7d`
4. **AI Insights** - Fetch from `/api/ai/recommendations`

## Performance Optimization

### Using React Hooks Efficiently

```tsx
// Memoize expensive components
export const StatsCard = memo(function StatsCard(props) {
  return <div>{/* Component */}</div>;
});

// Use useCallback for event handlers
const handleAction = useCallback(() => {
  // Action logic
}, [dependencies]);

// Use useMemo for derived data
const processedData = useMemo(() => {
  return data.map(item => ({...item, processed: true}));
}, [data]);
```

### Image Optimization

```tsx
// Use Next.js Image component instead of img
import Image from 'next/image';

<Image
  src={thumbnail}
  alt='Resume thumbnail'
  width={40}
  height={40}
/>
```

## Accessibility

### ARIA Labels

```tsx
// Add ARIA labels to interactive elements
<Button
  variant='ghost'
  size='icon'
  aria-label='Open user menu'
>
  <UserIcon size={20} />
</Button>
```

### Semantic HTML

```tsx
// Use semantic elements
<main className='flex-1 overflow-auto'>
  {/* Main content */}
</main>

<nav className='space-y-2'>
  {/* Navigation items */}
</nav>
```

## Troubleshooting

### Common Issues

**Stats cards not showing:**
- Check if icons are properly imported from lucide-react
- Verify accentColor prop is one of: 'purple', 'blue', 'green', 'pink'

**Sidebar not appearing on mobile:**
- Ensure `isOpen` state is present in component
- Check CSS classes for mobile visibility

**Charts not displaying:**
- Verify recharts is installed: `npm install recharts`
- Check data array format matches expected structure

**Styling not applied:**
- Clear `.next` build directory: `rm -rf .next`
- Rebuild: `npm run dev`
- Check Tailwind CSS config includes component paths

## Advanced Customization

### Adding New Stats Card

```tsx
// app/(app)/dashboard/page.tsx
<StatsCard
  title='Custom Metric'
  value='999'
  icon={<CustomIcon size={20} />}
  trend={{ value: '+50%', direction: 'up' }}
  accentColor='blue'
  updated='Last updated 1 hour ago'
/>
```

### Adding New Chart

```tsx
// Create components/dashboard/CustomChart.tsx
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function CustomChart() {
  return (
    <Card className='p-6'>
      <h2 className='text-xl font-bold mb-6'>Your Chart Title</h2>
      <BarChart data={chartData}>
        {/* Chart definition */}
      </BarChart>
    </Card>
  );
}

// Import in dashboard page
import { CustomChart } from '@/components/dashboard/CustomChart';
```

## Deployment Checklist

- [ ] Replace placeholder user data with real user info
- [ ] Connect to backend API endpoints
- [ ] Remove console.log statements
- [ ] Test on mobile devices
- [ ] Verify all links navigate correctly
- [ ] Check loading states and error handling
- [ ] Optimize images and assets
- [ ] Run production build: `npm run build`
- [ ] Test in production environment

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide React Icons](https://lucide.dev)
- [Recharts](https://recharts.org)

## License

This dashboard implementation is part of the ResumeForge AI application.
