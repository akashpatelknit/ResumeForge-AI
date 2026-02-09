import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is my data secure?",
    a: "Absolutely. We use bank-level AES-256 encryption, and your data is never shared with third parties. You can delete your account and all data at any time.",
  },
  {
    q: "How does the AI work?",
    a: "Our AI analyzes the job description you provide, extracts required skills and keywords, then tailors your resume content to match — ensuring maximum ATS compatibility and recruiter appeal.",
  },
  {
    q: "Can I edit after downloading?",
    a: "Yes! Your resume is always editable. Come back anytime to make changes, update your experience, or optimize for a new job description.",
  },
  {
    q: "What file formats are supported?",
    a: "We support PDF (recommended for ATS), DOCX for Microsoft Word, and shareable web links you can include in applications.",
  },
  {
    q: "Is there really a free plan?",
    a: "Yes! Our free plan lets you create 1 resume with 3 templates and PDF export. No credit card required, no time limits.",
  },
  {
    q: "How is this different from other resume builders?",
    a: "Unlike generic builders, ResumeForge AI uses artificial intelligence to tailor your resume for specific jobs, optimize for ATS systems, and enhance your bullet points — resulting in 3x more interviews on average.",
  },
];

const FAQ = () => (
  <section className="py-20 lg:py-32 bg-gradient-hero-soft">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-muted-foreground">
          Got questions? We've got answers.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default FAQ;
