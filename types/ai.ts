export interface JobDescriptionAnalysis {
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  experienceLevel: string;
  matchScore: number; // 0-100
  suggestions: string[];
}

export interface BulletPointImprovement {
  original: string;
  improved: string;
  reasoning: string;
  score: number;
}

export interface ATSScore {
  overall: number;
  breakdown: {
    keywords: number;
    formatting: number;
    experience: number;
    education: number;
  };
  suggestions: string[];
}
