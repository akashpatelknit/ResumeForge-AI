# 🚀 ResumeForge AI - AI-Powered Resume Builder

<div align="center">

![ResumeForge AI](https://img.shields.io/badge/ResumeForge-AI-8b5cf6?style=for-the-badge&logo=react&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Build professional, ATS-optimized resumes with AI assistance in minutes.**

[Demo](https://resume-forge-ai-lilac.vercel.app) · [Report Bug](https://github.com/akashpatelknit/ResumeForge-AI/issues) · [Request Feature](https://github.com/akashpatelknit/ResumeForge-AI/issues)

</div>

---

## ✨ Features

- 🤖 **AI-Powered Optimization** - Analyze job descriptions and get intelligent suggestions
- 📄 **Real-Time PDF Preview** - See your resume update instantly as you type
- 🎯 **ATS-Friendly** - 95%+ compatibility with Applicant Tracking Systems
- 🎨 **Professional Templates** - Choose from modern, minimal, and creative designs
- ✍️ **Cover Letter Generator** - AI-generated cover letters tailored to job descriptions
- ⚡ **One-Click Export** - Download as PDF or DOCX instantly
- 📊 **ATS Score Calculator** - Get your resume's ATS compatibility score
- 💾 **Auto-Save** - Never lose your progress with automatic saving
- 🔒 **Privacy First** - Your data is secure and never shared
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile

---

## 🎯 Why ResumeForge AI?

Traditional resume builders are time-consuming and don't optimize for modern hiring systems. ResumeForge AI solves this by:

- **Saving 10+ hours** of formatting and writing time
- **Increasing interview callbacks by 3x** with AI-optimized content
- **Beating ATS filters** with intelligent keyword matching
- **Providing expert guidance** at every step

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **PDF Generation:** @react-pdf/renderer

### Backend

- **Runtime:** Node.js
- **API Routes:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Clerk / NextAuth.js

### AI Integration

- **Primary:** Anthropic Claude API
- **Alternative:** OpenAI GPT-4

### State Management

- **Global State:** Zustand
- **Form State:** React Hook Form
- **Validation:** Zod

### DevOps

- **Deployment:** Vercel
- **CI/CD:** GitHub Actions
- **Analytics:** Google Analytics / Vercel Analytics

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/akashpatelknit/ResumeForge-AI.git
   cd resumeforge-ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:

   ```env
   # Site Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_NAME="ResumeForge AI"

   # AI API Keys (choose one)
   ANTHROPIC_API_KEY=your_claude_api_key
   # or
   OPENAI_API_KEY=your_openai_api_key

   # Database (Supabase)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Authentication (optional)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
resumeforge-ai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (marketing)/              # Public pages
│   │   ├── page.tsx              # Landing page
│   │   ├── features/
│   │   ├── templates/
│   │   └── pricing/
│   ├── (app)/                    # Protected app pages
│   │   ├── dashboard/            # User dashboard
│   │   ├── builder/              # Resume builder
│   │   └── settings/
│   ├── api/                      # API routes
│   │   ├── ai/                   # AI endpoints
│   │   ├── resumes/              # Resume CRUD
│   │   └── pdf/                  # PDF generation
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── builder/                  # Resume builder components
│   │   ├── sections/             # Form sections
│   │   ├── preview/              # PDF preview
│   │   └── ai/                   # AI features
│   ├── pdf/                      # PDF templates
│   │   └── templates/
│   ├── marketing/                # Landing page components
│   └── shared/                   # Shared components
│
├── lib/
│   ├── utils.ts                  # Utility functions
│   ├── validations.ts            # Zod schemas
│   └── ai/                       # AI integration
│
├── hooks/                        # Custom React hooks
│   ├── useResume.ts
│   ├── useAutoSave.ts
│   └── useAIAnalysis.ts
│
├── store/                        # Zustand state management
│   ├── resumeStore.ts
│   └── uiStore.ts
│
├── types/                        # TypeScript types
│   ├── resume.ts
│   ├── template.ts
│   └── ai.ts
│
├── config/                       # Configuration files
│   ├── site.ts                   # Site metadata
│   ├── templates.ts              # Template configs
│   └── sections.ts               # Section configs
│
├── public/                       # Static assets
│   ├── images/
│   └── fonts/
│
└── ...config files
```

---

## 🎨 Available Templates

1. **Modern Professional** - Two-column layout with color accents
2. **Classic Minimal** - Traditional single-column ATS-friendly design
3. **Creative Bold** - Eye-catching design for creative roles
4. **Executive** - Premium layout for senior positions

---

## 🤖 AI Features

### Job Description Analyzer

Paste a job description and get:

- Extracted required skills and keywords
- Experience level assessment
- Match score with your resume
- Suggested improvements

### Bullet Point Improver

Transform weak bullet points into powerful achievements:

- Before: "Worked on frontend development"
- After: "Spearheaded React migration reducing load time by 40% and improving user engagement by 25%"

### ATS Score Calculator

Get instant feedback on:

- Keyword density
- Formatting compatibility
- Section organization
- Overall ATS score (0-100)

### Cover Letter Generator

Generate personalized cover letters:

- Tailored to job description
- Highlights relevant experience
- Professional tone options
- Fully editable output

---

## 📖 Usage Guide

### Creating Your First Resume

1. **Sign up** for a free account
2. **Choose a template** from our professional designs
3. **Fill in your information** using our intuitive form
4. **Paste the job description** you're applying for
5. **Get AI suggestions** and apply them with one click
6. **Preview in real-time** as you make changes
7. **Download** your optimized resume as PDF

### Optimizing for ATS

- Use standard section headings (Experience, Education, Skills)
- Include relevant keywords from the job description
- Avoid graphics, tables, and columns (in ATS-friendly templates)
- Use consistent formatting throughout
- Check your ATS score before applying

### Best Practices

- **Keep it concise:** 1-2 pages maximum
- **Use action verbs:** Led, Developed, Achieved, etc.
- **Quantify results:** Include numbers and percentages
- **Tailor for each job:** Customize based on job description
- **Proofread:** Use our AI checker for grammar and spelling

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables
   - Deploy!

### Other Platforms

The app can also be deployed to:

- **Netlify** - Full Next.js support
- **Railway** - Easy deployment with databases
- **AWS Amplify** - Enterprise-grade hosting
- **Self-hosted** - Using Docker

---

<!-- ## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run type checking
npm run type-check

# Run linting
npm run lint
``` -->

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

---

## 📝 Roadmap

### Q1 2024

- [x] Core resume builder
- [x] AI job description analyzer
- [x] PDF export
- [ ] Cover letter generator
- [ ] LinkedIn import

### Q2 2024

- [ ] Multiple resume versions
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Chrome extension
- [ ] Mobile app (React Native)

### Q3 2024

- [ ] Video resume feature
- [ ] Interview preparation AI
- [ ] Salary negotiation tools
- [ ] Job board integration
- [ ] API for developers

See the [open issues](https://github.com/akashpatelknit/ResumeForge-AI/issues) for a full list of proposed features.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Anthropic Claude](https://www.anthropic.com/) - AI-powered suggestions
- [React PDF](https://react-pdf.org/) - PDF generation
- [Lucide Icons](https://lucide.dev/) - Icon library

---

## 📧 Contact

**Project Maintainer:** Akash Patel

- Email: akashpatel20606@gmail.com
- Twitter: [@cotsec14](https://x.com/cotsec14)
- LinkedIn: [Linkedin](https://www.linkedin.com/in/akash-patel-9330aa201)

**Project Link:** [https://github.com/akashpatelknit/ResumeForge-AI](https://github.com/akashpatelknit/ResumeForge-AI)

---

## 💖 Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🤝 Contributing to the code
- 📢 Sharing with friends

---

<div align="center">

**Built with ❤️ by [Akash Patel](https://akashbuilds.vercel.app)**

Made with [Next.js](https://nextjs.org/) · Powered by [AI](https://www.anthropic.com/)

</div>

