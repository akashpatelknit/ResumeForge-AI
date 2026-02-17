# Resume Form API Integration Guide

## Overview

The resume form is now fully connected with the backend API. Here's how everything works together:

## API Endpoints

### 1. **POST /api/resumes** - Create New Resume
Creates a new resume for the authenticated user.

**Request:**
```json
{
  "title": "My Resume",
  "templateId": "modern",
  "personalInfo": { ... },
  "summary": "...",
  "experience": [...],
  "education": [...],
  "skills": [...],
  "projects": [...],
  "achievements": [...],
  "certifications": [...],
  "languages": [...]
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "user-id",
  "title": "My Resume",
  "templateId": "modern",
  "personalInfo": { ... },
  "summary": "...",
  "experience": [...],
  "education": [...],
  "skills": [...],
  "projects": [...],
  "achievements": [...],
  "certifications": [...],
  "languages": [...],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 2. **GET /api/resumes** - Get All Resumes
Fetches all resumes for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "My Resume",
    ...
  }
]
```

### 3. **GET /api/resumes/[id]** - Get Single Resume
Fetches a specific resume by ID.

**Response:**
```json
{
  "id": "uuid",
  "title": "My Resume",
  ...
}
```

### 4. **PUT /api/resumes/[id]** - Update Resume
Updates an existing resume.

**Request:**
```json
{
  "title": "Updated Title",
  "templateId": "professional",
  "personalInfo": { ... },
  "summary": "...",
  ...
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Updated Title",
  ...
}
```

### 5. **DELETE /api/resumes/[id]** - Delete Resume
Deletes a resume.

**Response:**
```json
{
  "success": true
}
```

## Client-Side Utilities

### API Functions (`lib/api/resumes.ts`)

```typescript
import { 
  saveResume, 
  deleteResume, 
  fetchResume, 
  fetchResumes 
} from "@/lib/api/resumes";

// Save (create or update)
const savedResume = await saveResume({
  id: "resume-id", // Optional - if provided, updates; if not, creates
  title: "My Resume",
  templateId: "modern",
  personalInfo: { ... },
  summary: "...",
  experience: [...],
  education: [...],
  skills: [...],
  projects: [...],
});

// Delete
await deleteResume("resume-id");

// Fetch single resume
const resume = await fetchResume("resume-id");

// Fetch all resumes
const resumes = await fetchResumes();
```

### Hooks

#### `useLoadResume(resumeId?)`
Loads a resume from the API and sets it in the store.

```typescript
import { useLoadResume } from "@/hooks/useLoadResume";

export function MyComponent() {
  const resume = useLoadResume("resume-id");

  return resume ? <div>{resume.title}</div> : <div>Loading...</div>;
}
```

#### `useAutoSave(delay?)`
Automatically saves resume changes to the database (debounced).

```typescript
import { useAutoSave } from "@/hooks/useAutoSave";

export function ResumeEditor() {
  useAutoSave(3000); // Auto-save every 3 seconds

  return <ResumeForm />;
}
```

## Integration Steps

### Step 1: Initialize a Resume on Load

```typescript
"use client";

import { useLoadResume } from "@/hooks/useLoadResume";
import ResumeForm from "@/components/builder/ResumeForm";

export default function DashboardPage({ params }: { params: { id: string } }) {
  const resume = useLoadResume(params.id);

  if (!resume) {
    return <div>Loading...</div>;
  }

  return <ResumeForm />;
}
```

### Step 2: Enable Auto-Save

```typescript
"use client";

import { useAutoSave } from "@/hooks/useAutoSave";
import ResumeForm from "@/components/builder/ResumeForm";

export default function ResumeEditor() {
  // Auto-save every 30 seconds
  useAutoSave(30000);

  return <ResumeForm />;
}
```

### Step 3: Manual Save in Form

The `ResumeForm` component already includes a save button that calls `saveResume()`:

```typescript
const handleSave = async () => {
  if (!currentResume) return;

  await saveResume({
    id: currentResume.id,
    title: currentResume.title,
    templateId: currentResume.templateId,
    personalInfo: currentResume.personalInfo,
    summary: currentResume.summary,
    experience: currentResume.experience,
    education: currentResume.education,
    skills: currentResume.skills,
    projects: currentResume.projects,
    achievements: currentResume.achievements,
    certifications: currentResume.certifications,
    languages: currentResume.languages,
  });
};
```

### Step 4: Handle Resume List

```typescript
"use client";

import { useEffect, useState } from "react";
import { fetchResumes } from "@/lib/api/resumes";
import { Resume } from "@/types/resume";

export default function ResumeList() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const data = await fetchResumes();
        setResumes(data);
      } finally {
        setLoading(false);
      }
    };

    loadResumes();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {resumes.map((resume) => (
        <div key={resume.id}>
          <h3>{resume.title}</h3>
          <p>{resume.summary}</p>
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

All API functions use `toast.error()` for error notifications (via `sonner`):

```typescript
try {
  await saveResume(data);
  // Success toast shown automatically
} catch (error) {
  // Error toast shown automatically
  console.error(error);
}
```

## Authentication

All endpoints require authentication via Clerk. The `auth()` function from `@clerk/nextjs/server` validates the user's session.

If not authenticated, endpoints return:
```json
{
  "error": "Unauthorized"
}
```
HTTP Status: 401

## Data Structure

### Resume Object
```typescript
interface Resume {
  id: string;                          // UUID
  userId: string;                      // Clerk user ID
  title: string;                       // "Frontend Developer Resume"
  templateId: string;                  // "modern", "professional", etc.
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  achievements?: string[];
  certifications?: Certification[];
  languages?: Language[];
  isFavorite?: boolean;
  thumbnail?: string;
  atsScore?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### PersonalInfo Object
```typescript
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}
```

### Experience Object
```typescript
interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;           // "2023-01"
  endDate: string | null;      // null = current
  description: string;
  achievements: string[];
}
```

### Education Object
```typescript
interface Education {
  id: string;
  institution: string;
  degree: string;              // "B.S.", "M.A."
  field: string;               // "Computer Science"
  location: string;
  startDate: string;           // "2019-09"
  endDate: string;             // "2023-05"
  gpa?: string;
  achievements?: string[];
}
```

### Skill Object
```typescript
interface Skill {
  id: string;
  category: string;            // "Frontend", "Backend", etc.
  items: string[];             // ["React", "TypeScript", ...]
}
```

### Project Object
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  highlights: string[];
}
```

### Certification Object
```typescript
interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;                // "2023-01"
  credentialId?: string;
}
```

### Language Object
```typescript
interface Language {
  id: string;
  name: string;
  proficiency: string;         // "Native", "Fluent", "Professional", "Basic"
}
```

## Best Practices

1. **Always use `useLoadResume()` when loading a resume** - It automatically handles setting the resume in the Zustand store.

2. **Enable `useAutoSave()`** - Prevents data loss by auto-saving periodically.

3. **Show loading states** - Use `isLoading` from the store while fetching data.

4. **Handle errors gracefully** - API functions automatically show toasts, but you can also wrap in try/catch.

5. **Never directly call Prisma/database functions** - Always go through the API endpoints.

6. **Validate data before sending** - Check that required fields are filled before saving.

## Example: Complete Resume Editor Page

```typescript
"use client";

import { useLoadResume } from "@/hooks/useLoadResume";
import { useAutoSave } from "@/hooks/useAutoSave";
import ResumeForm from "@/components/builder/ResumeForm";
import { Card } from "@/components/ui/card";

export default function ResumeEditor({ params }: { params: { id: string } }) {
  // Load resume on mount
  const resume = useLoadResume(params.id);

  // Enable auto-save (every 30 seconds)
  useAutoSave(30000);

  if (!resume) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading resume...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{resume.title}</h1>
        <p className="text-gray-600">Last edited {resume.updatedAt}</p>
      </div>

      <ResumeForm />
    </div>
  );
}
```

## Troubleshooting

### Issue: "Unauthorized" Error
- **Solution:** Check that user is authenticated with Clerk
- Verify Clerk middleware is properly configured
- Check browser cookies for Clerk session

### Issue: "Failed to save resume"
- **Solution:** Check browser console for error details
- Verify all required fields are filled
- Check API response status (PUT /api/resumes/[id])

### Issue: Resume not loading
- **Solution:** Verify resume ID is correct
- Check that user owns the resume
- Look at network tab for API response status

### Issue: Auto-save not working
- **Solution:** Ensure `useAutoSave()` hook is called
- Check that resume changes are being made in the store
- Verify API endpoint is accessible

## Future Enhancements

- [ ] Implement version history/undo-redo
- [ ] Add real-time collaboration
- [ ] Add rich text editor for descriptions
- [ ] Add file upload for profile images
- [ ] Implement batch operations (multi-delete, etc.)
- [ ] Add resume templates with preview
- [ ] Implement ATS scoring API
