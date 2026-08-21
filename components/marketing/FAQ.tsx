import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Billing-specific FAQ shown on /pricing only (this component has no other
// importers). Answers reflect the actual subscription implementation:
// cancellation is immediate via /api/subscription/cancel (no refund logic
// there), the trial is a real 7-day Razorpay `start_at` delay, and Razorpay
// Checkout is the only payment surface (no code-level method restrictions).
// While billingEnabled is false none of that is reachable at all (see
// PlatformConfig in prisma/schema.prisma) — a different, beta-accurate set
// of answers below avoids referencing charges/trials/refunds that can't
// actually happen yet.
const billingFaqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes — cancel your Pro subscription anytime from Settings → Billing. Cancellation takes effect immediately: you keep Free-plan access and won't be charged again.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Payments are processed securely through Razorpay, which supports UPI, credit/debit cards, net banking, and popular wallets.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — every Pro subscription starts with a 7-day free trial. You won't be charged until the trial ends, and you can cancel anytime before then.",
  },
  {
    q: "Do you offer refunds?",
    a: "We don't offer refunds for partial billing periods, but you can cancel anytime and you won't be charged again — there's no long-term commitment.",
  },
];

const betaFaqs = [
  {
    q: "Is this really free?",
    a: "Yes — we're in early access and every feature is free for every account right now, no credit card required. This is temporary, not a permanent free tier: we'll announce pricing before anything changes.",
  },
  {
    q: "Will I lose access when billing turns on?",
    a: "No — if you sign up during early access, you keep your current free allowance permanently, even after paid plans launch. Nothing changes for you automatically.",
  },
  {
    q: "Do I need a credit card to sign up?",
    a: "No. There's no checkout during early access — just create an account and start using every feature immediately.",
  },
  {
    q: "What happens after early access ends?",
    a: "New signups will move to regular Free/Pro plans with normal limits. Accounts created during early access are grandfathered in at their current allowance.",
  },
];

const FAQ = ({ billingEnabled }: { billingEnabled: boolean }) => {
  const faqs = billingEnabled ? billingFaqs : betaFaqs;

  return (
    <section className="py-8 lg:py-12">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white px-6 shadow-sm">
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
};

export default FAQ;
