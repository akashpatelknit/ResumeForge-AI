"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function TestPrismaPage() {
  const [resumes, setResumes] = useState<any[]>([]);

  const fetchResumes = async () => {
    const response = await fetch("/api/resumes");
    const data = await response.json();
    console.log("Fetched resumes:", data);
    setResumes(data);
  };

  const createResume = async () => {
    const response = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Untitled Resume",
        templateId: "modern",

        data: {
          personalInfo: {
            fullName: "John Doe",
            email: "john@example.com",
            phone: "+91 9999999999",
            location: "Bangalore, India",
          },

          summary:
            "Frontend developer with experience building modern web apps using React and Next.js.",

          experience: [
            {
              company: "Tech Corp",
              role: "Frontend Developer",
              startDate: "2022-01",
              endDate: "Present",
              description:
                "Built scalable UI systems and improved performance by 30%.",
            },
          ],

          education: [
            {
              institution: "XYZ University",
              degree: "B.Tech Computer Science",
              startDate: "2018",
              endDate: "2022",
            },
          ],

          skills: [
            { name: "React" },
            { name: "Next.js" },
            { name: "TypeScript" },
            { name: "Node.js" },
          ],

          projects: [
            {
              name: "Resume Builder",
              description: "Online resume builder with PDF export.",
              link: "https://example.com",
            },
          ],

          achievements: [{ title: "Hackathon Winner 2023" }],

          certifications: [{ name: "AWS Certified Developer" }],

          languages: ["English", "Hindi"],

          isFavorite: false,
          thumbnail: "",
          atsScore: 0,
        },
      }),
    });

    if (response.ok) {
      alert("Resume created!");
      fetchResumes();
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold mb-4">Prisma Test</h1>

      <div className="space-y-4">
        <Button onClick={createResume}>Create Resume</Button>
        <Button onClick={fetchResumes} variant="outline">
          Fetch Resumes
        </Button>

        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(resumes, null, 2)}
        </pre>
      </div>
    </div>
  );
}
