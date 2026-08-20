import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/landing/Footer";
import { siteConfig, pageOpenGraph, pageTwitter } from "@/config/site";

const title = "Terms of Service | Rezlo";
const description = "The terms that govern your use of Rezlo.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
  openGraph: pageOpenGraph({ title, description, path: "/terms" }),
  twitter: pageTwitter({ title, description }),
};

const LAST_UPDATED = "August 20, 2026";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-16 lg:px-6 lg:py-20">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This document is written to accurately describe how Rezlo currently operates. It has not been reviewed
            by a lawyer. If you need enforceable legal terms, have this reviewed by a qualified attorney before
            relying on it.
          </div>

          <div className="mt-10 space-y-10 text-base leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">1. Acceptance of terms</h2>
              <p>
                By creating an account or using Rezlo (&quot;the Service&quot;), you agree to these Terms of Service. If you
                don&apos;t agree, don&apos;t use the Service. We may update these terms from time to time; continued use
                after an update constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">2. What Rezlo is</h2>
              <p>
                Rezlo is an AI-powered resume building and job application platform. It helps you build resumes,
                score them against job descriptions, track applications, and — if you connect your Google account
                — send outreach emails on your behalf through your own Gmail account.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">3. Your account</h2>
              <p>
                You must provide accurate information when creating an account and are responsible for maintaining
                the security of your login credentials. You&apos;re responsible for all activity that happens under
                your account. Notify us promptly if you suspect unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">4. Acceptable use</h2>
              <p>You agree not to use Rezlo to:</p>
              <ul className="ml-6 mt-3 list-disc space-y-2">
                <li>
                  Send unsolicited bulk email, spam, or abusive messages through the outreach feature — outreach is
                  intended for genuine, individually-relevant job applications and networking, not mass or
                  automated blasting
                </li>
                <li>Send content that is harassing, deceptive, fraudulent, or impersonates another person or company</li>
                <li>Upload resume content or job descriptions that infringe someone else&apos;s intellectual property or contain unlawful material</li>
                <li>Attempt to circumvent usage limits, security controls, or rate limits on the Service</li>
                <li>Reverse-engineer, scrape, or resell access to the Service without our written permission</li>
                <li>Use the Service to build a competing product</li>
              </ul>
              <p className="mt-4">
                Because the outreach feature sends email through your own connected Gmail account, misuse can
                affect your personal email reputation and deliverability, in addition to violating these Terms. We
                reserve the right to suspend or terminate accounts that we determine, in good faith, are using the
                outreach feature to send spam or abusive messages.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">5. Subscriptions and billing</h2>
              <p>
                Rezlo offers a Free plan with limited resumes and AI generations per month, and a paid Pro plan
                billed monthly in Indian Rupees (INR) through Razorpay, our payment processor. Pro may include a
                free trial period; if you don&apos;t cancel before the trial ends, your card will be charged for the
                first billing period automatically.
              </p>
              <p className="mt-4">
                Subscriptions renew automatically each billing cycle until cancelled. You can cancel anytime from
                your account settings; cancellation takes effect at the end of the current billing period, and you
                retain Pro access until then. We do not automatically prorate or refund partial billing periods
                except where required by law or at our discretion for billing errors.
              </p>
              <p className="mt-4">
                We may change pricing going forward; we&apos;ll give notice before a price change takes effect for
                existing subscribers.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">6. Your content</h2>
              <p>
                You retain ownership of the resume content, job descriptions, and other material you upload or
                create in Rezlo. You grant us a limited license to store, process, and transmit that content solely
                to provide the Service to you — including sending it to our AI providers to generate tailored
                content, scores, and suggestions, as described in our{" "}
                <a href="/privacy" className="font-medium text-brand-purple underline">
                  Privacy Policy
                </a>
                . We don&apos;t use your resume content to train AI models, and we don&apos;t share it with other users.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">7. AI-generated content</h2>
              <p>
                Rezlo uses AI to help draft, score, and tailor resume and outreach content. AI-generated suggestions
                can be inaccurate or imperfect — you&apos;re responsible for reviewing and verifying any AI-generated
                content before using it, including for factual accuracy about your own experience. Don&apos;t represent
                AI-generated claims about your qualifications as accurate if they aren&apos;t true.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">8. Account termination</h2>
              <p>
                You may delete your account at any time from account settings, which removes your resumes and
                connected OAuth tokens as described in our Privacy Policy. We may suspend or terminate your access
                if you violate these Terms, including the Acceptable Use section above, or if required by law. We&apos;ll
                make reasonable efforts to notify you before termination except in cases of serious or repeated
                abuse.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">9. Disclaimers</h2>
              <p>
                Rezlo is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not guarantee
                that using Rezlo will result in interviews, job offers, or any particular employment outcome — ATS
                scores and AI suggestions are informational aids, not guarantees. We do not warrant that the
                Service will be uninterrupted, error-free, or secure at all times.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">10. Limitation of liability</h2>
              <p>
                To the maximum extent permitted by law, Rezlo and its team are not liable for any indirect,
                incidental, special, or consequential damages arising from your use of the Service, including lost
                job opportunities, lost income, or data loss. Our total liability for any claim relating to the
                Service is limited to the amount you paid us in the twelve months preceding the claim, or 100 INR if
                you have not made any payment.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">11. Third-party services</h2>
              <p>
                Rezlo relies on third-party services — including Clerk, Google (Gmail/OAuth), Google AI, and
                Razorpay — to operate. Your use of those integrations is also subject to those providers&apos; own terms.
                We&apos;re not responsible for outages, changes, or issues originating from third-party providers outside
                our control.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">12. Changes to the Service</h2>
              <p>
                We may add, change, or remove features at any time as Rezlo evolves. We&apos;ll try to give notice of
                changes that materially reduce functionality you rely on, but we don&apos;t guarantee that every feature
                will remain available indefinitely.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">13. Contact us</h2>
              <p>
                Questions about these Terms can be sent to{" "}
                <a href="mailto:support@rezlo.app" className="font-medium text-brand-purple underline">
                  support@rezlo.app
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
