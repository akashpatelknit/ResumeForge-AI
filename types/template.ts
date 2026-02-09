export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: "modern" | "professional" | "minimal" | "creative";
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  features: string[];
  isPremium: boolean;
}
