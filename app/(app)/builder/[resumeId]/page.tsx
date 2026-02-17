"use client";

import { use, useEffect, useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import ResumeForm from "@/components/builder/ResumeForm";
import PDFPreview from "@/components/builder/preview/PDFPreview";
import BuilderToolbar from "@/components/builder/BuilderToolbar";
import AIOptimizeButton from "@/components/builder/AIOptimizeButton";
import { AppResume } from "@/types/resume";
import { useAuth } from "@clerk/nextjs";

export function createEmptyResume(
  userId: string,
  templateId: string,
): AppResume {
  return {
    id: crypto.randomUUID(),
    userId,
    title: "Untitled Resume",
    templateId,
    createdAt: new Date(),
    updatedAt: new Date(),
    personalInfo: {
      fullName: "Akash Patel",
      email: "akashpatel20606@gmail.com",
      phone: "+91-9369201975",
      location: "India",
      linkedin: "linkedin.com/in/akash-patel-9330aa201",
      github: "github.com/akashpatelknit",
      portfolio: "",
    },

    summary:
      "Full Stack Developer with 3+ years of experience building scalable web applications using React, Node.js, and modern JavaScript technologies. Skilled in developing responsive UIs, scalable APIs, and deploying production-ready applications.",
    experience: [
      {
        id: "exp-1",
        company: "Tata Consultancy Services (TCS)",
        position: "Full Stack Developer",
        location: "Remote / India",
        startDate: "2023-05",
        endDate: "Present",
        description:
          "Worked on scalable full-stack enterprise applications across frontend, backend, and cloud deployment.",

        achievements: [
          "Delivered 15+ full-stack features across React, Spring Boot, and PostgreSQL improving engagement by 35% while owning the complete lifecycle from UI to deployment.",
          "Built reusable React components and scalable APIs handling 100K+ daily requests with JWT auth, rate limiting, and Redis caching.",
          "Optimized PostgreSQL queries reducing execution time by 60% and deployed services using AWS, Docker, and CI/CD pipelines reducing deployment time by 70% with automated testing.",
        ],
      },

      {
        id: "exp-2",
        company: "Flabs - Pathology Lab Software",
        position: "Full Stack Developer",
        location: "Remote / India",
        startDate: "2022-01",
        endDate: "2023-04",
        description:
          "Developed healthcare SaaS platform features serving 200+ labs.",

        achievements: [
          "Built full-stack healthcare SaaS features using React and Node.js improving workflow efficiency by 45% with APIs handling 50K+ daily requests.",
          "Implemented real-time WebSocket updates reducing latency by 80% and optimized MongoDB schemas improving query performance by 45%.",
          "Implemented JWT authentication, RBAC, and maintained test coverage above 80% across frontend and backend services.",
        ],
      },
    ],

    education: [
      {
        id: "edu-1",
        institution: "KNIT Sultanpur",
        degree: "Bachelor of Technology",
        field: "Computer Science",
        location: "Sultanpur, India",
        startDate: "2018",
        endDate: "2022",
      },
    ],

    skills: [
      {
        id: "skill-1",
        category: "Frontend",
        items: [
          "React.js",
          "Next.js",
          "Redux",
          "React Query",
          "TypeScript",
          "JavaScript (ES6+)",
          "HTML5",
          "CSS3",
        ],
      },
      {
        id: "skill-2",
        category: "Styling",
        items: [
          "Tailwind CSS",
          "Sass/SCSS",
          "Styled Components",
          "Material UI",
          "Responsive Design",
        ],
      },
      {
        id: "skill-3",
        category: "Backend",
        items: [
          "Node.js",
          "Express.js",
          "NestJS",
          "Spring Boot",
          "REST APIs",
          "GraphQL",
          "Microservices",
        ],
      },
      {
        id: "skill-4",
        category: "Databases",
        items: [
          "MongoDB",
          "PostgreSQL",
          "Redis",
          "SQL",
          "Database Design",
          "Query Optimization",
        ],
      },
      {
        id: "skill-5",
        category: "DevOps & Tools",
        items: [
          "Docker",
          "AWS (EC2, S3, RDS)",
          "Git/GitHub",
          "CI/CD",
          "Jest",
          "React Testing Library",
          "Postman",
        ],
      },
      {
        id: "skill-6",
        category: "Core",
        items: [
          "Full Stack Development",
          "System Design",
          "API Integration",
          "JWT Authentication",
          "OAuth",
        ],
      },
    ],
    projects: [
      {
        id: "proj-1",
        name: "Homekrew - Full-Stack Home Services Platform",
        description:
          "Complete service marketplace with customer, vendor, and admin systems covering full frontend to backend deployment.",

        technologies: [
          "React.js",
          "Next.js",
          "Redux",
          "TypeScript",
          "Tailwind CSS",
          "Node.js",
          "Express.js",
          "MongoDB",
          "Redis",
          "Socket.io",
          "JWT",
          "AWS",
          "Docker",
        ],

        link: "",

        highlights: [
          "Architected and developed full marketplace platform with customer, vendor, and admin dashboards using React and scalable Node.js APIs.",
          "Implemented JWT authentication, RBAC, and real-time updates with Socket.io supporting secure multi-role workflows.",
          "Built admin dashboard with analytics, vendor management, and integrated Razorpay & Stripe payment systems.",
          "Optimized performance using MongoDB indexing, Redis caching, and frontend lazy loading reducing API response time by 60% and page load by 50%.",
        ],
      },

      {
        id: "proj-2",
        name: "E-Commerce Platform with Admin CMS",
        description:
          "Full-featured e-commerce platform supporting product discovery, cart, checkout, and order management workflows.",

        technologies: [
          "React.js",
          "Node.js",
          "Express.js",
          "MongoDB",
          "JWT",
          "Stripe API",
          "Tailwind CSS",
          "Redux",
          "Axios",
          "Nodemailer",
        ],

        link: "",

        highlights: [
          "Developed responsive React UI supporting catalog browsing, filtering, cart, and checkout workflows with mobile-first optimization.",
          "Built scalable Node.js and MongoDB backend APIs managing products, inventory, and order processing.",
          "Created admin CMS with secure authentication and role-based access control for product and order management.",
          "Integrated Stripe payments with webhook handling and automated notification workflows.",
        ],
      },
    ],

    achievements: [],
    certifications: [],
    languages: [],

    isFavorite: false,
    thumbnail: "",
    atsScore: 0,
  };
}

export default function BuilderPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { currentResume, setCurrentResume, loadResume } = useResumeStore();
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();
  const { resumeId } = use(params);

  console.log("Current Resume in BuilderPage:", currentResume);

  useEffect(() => {
    if (!userId) return;

    if (resumeId) {
      loadResume(resumeId, userId);
    }

    setIsLoading(false);
  }, [resumeId, setCurrentResume, userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <BuilderToolbar />

      {/* Main Builder Interface */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Form Editor */}
          <div className="space-y-4">
            <ResumeForm />
          </div>

          {/* Right: PDF Preview */}
          <div className="sticky top-6 h-fit">
            <PDFPreview resume={currentResume} />
          </div>
          <AIOptimizeButton />
        </div>
      </div>
    </div>
  );
}
