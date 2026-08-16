import Navbar from "@/components/marketing/Navbar";
import TemplateShowcase from "@/components/marketing/TemplateShowcase";
import FinalCTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";

export default function TemplatesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <TemplateShowcase />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
