import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/landing/Footer";
import { siteConfig, pageOpenGraph, pageTwitter } from "@/config/site";

const title = "Privacy Policy | Rezlo";
const description = "How Rezlo collects, uses, and protects your data.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
  openGraph: pageOpenGraph({ title, description, path: "/privacy" }),
  twitter: pageTwitter({ title, description }),
};

const LAST_UPDATED = "August 20, 2026";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-16 lg:px-6 lg:py-20">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This policy is written to accurately describe how Rezlo currently handles data. It has not been
            reviewed by a lawyer. If you need this document to hold up for formal legal or compliance purposes,
            have it reviewed by a qualified attorney before relying on it.
          </div>

          <div className="mt-10 space-y-10 text-base leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">1. Who we are</h2>
              <p>
                Rezlo (&quot;Rezlo,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is an AI-powered resume building and job application
                platform. This Privacy Policy explains what information we collect when you use Rezlo, how we use
                it, who we share it with, and the choices you have.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">2. Information we collect</h2>
              <p className="font-semibold text-foreground">Account information</p>
              <p>
                We use Clerk as our authentication provider. When you sign up, Clerk collects and stores your name,
                email address, and authentication credentials (including any OAuth identity, such as Google, if you
                sign in that way). We receive your user ID, name, and email from Clerk to associate activity with
                your account.
              </p>
              <p className="mt-4 font-semibold text-foreground">Resume and application content</p>
              <p>
                We store the resume content you create or upload — including work history, education, skills,
                contact details, and any other information you choose to include — along with job descriptions
                you paste in for AI tailoring or ATS scoring, and any cover letters or outreach messages you
                generate or save.
              </p>
              <p className="mt-4 font-semibold text-foreground">Gmail access (outreach feature)</p>
              <p>
                If you connect your Google account to use Rezlo&apos;s outreach feature, we request a Gmail OAuth scope
                that allows Rezlo to send email on your behalf, at your explicit action, for messages you initiate
                through the product. We do not read your inbox, and we do not access, store, or send email outside
                of the outreach messages you create and choose to send. You can revoke this access at any time from
                your Google Account permissions or from Rezlo&apos;s account settings.
              </p>
              <p className="mt-4 font-semibold text-foreground">Payment information</p>
              <p>
                Subscription payments are processed by Razorpay. We do not store your full card or payment
                credentials on our servers — Razorpay handles that directly and shares with us only what&apos;s needed
                to manage your subscription status (such as plan tier, payment status, and transaction
                identifiers).
              </p>
              <p className="mt-4 font-semibold text-foreground">Usage analytics</p>
              <p>
                We collect basic usage data — such as which features you use, resume creation and edit events, and
                general application activity — to understand how Rezlo is used and to improve it. We do not sell
                this data.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">3. How we use your information</h2>
              <ul className="ml-6 list-disc space-y-2">
                <li>To provide the core product: building, storing, and exporting your resumes</li>
                <li>
                  To power AI features — resume tailoring, ATS scoring, and cover letter or outreach message
                  generation — which involves sending relevant resume and job description text to our AI
                  providers (see Section 4)
                </li>
                <li>To send outreach emails you compose and explicitly choose to send, via your connected Gmail account</li>
                <li>To process subscription payments and manage your plan</li>
                <li>To maintain account security, prevent abuse, and enforce our Terms of Service</li>
                <li>To understand feature usage and improve the product</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">4. Third parties we work with</h2>
              <p>We share data with the following third-party service providers, only as needed to operate Rezlo:</p>
              <ul className="ml-6 mt-3 list-disc space-y-2">
                <li>
                  <span className="font-semibold text-foreground">Clerk</span> — authentication and account
                  management (name, email, credentials)
                </li>
                <li>
                  <span className="font-semibold text-foreground">Google (Gmail API, Google OAuth)</span> — sign-in
                  and, if you opt in, sending outreach emails on your behalf
                </li>
                <li>
                  <span className="font-semibold text-foreground">Google AI (Gemini) and other AI providers</span> —
                  processing resume and job description text to generate AI-tailored content, scores, and
                  suggestions
                </li>
                <li>
                  <span className="font-semibold text-foreground">Razorpay</span> — payment processing for paid
                  subscriptions
                </li>
              </ul>
              <p className="mt-4">
                Each of these providers processes data under their own privacy policy and terms. We only send them
                the data necessary for the specific function they perform for Rezlo, and we do not permit them to
                use your data for purposes unrelated to providing their service to us.
              </p>
              <p className="mt-4">
                We do not sell your personal data to third parties, and we do not share your resume content with
                other users or with employers directly — any sharing of resume content with a third party (like an
                employer via an outreach email) happens only when you take that action yourself.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">5. Data retention</h2>
              <p>
                We retain your account and resume data for as long as your account remains active. If you delete
                your account, we delete your resumes, generated content, and connected OAuth tokens within a
                reasonable period, except where we&apos;re required to retain limited records (such as payment records)
                for legal, tax, or accounting purposes.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">6. Your rights</h2>
              <p>You can, at any time:</p>
              <ul className="ml-6 mt-3 list-disc space-y-2">
                <li>Access and export the resume and account data associated with your account</li>
                <li>Correct inaccurate account information</li>
                <li>Revoke Gmail/Google OAuth access from your Google Account settings or from within Rezlo</li>
                <li>Delete your account and associated data from your account settings, or by contacting us</li>
              </ul>
              <p className="mt-4">
                If you are located in a jurisdiction that grants additional data rights (such as the EU/UK GDPR or
                California&apos;s CCPA), you may have further rights over your data; contact us using the details below
                and we will respond to verified requests.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">7. Data security</h2>
              <p>
                We use industry-standard measures to protect your data in transit and at rest, including encrypted
                connections (HTTPS/TLS) and access controls on our databases and infrastructure. No system is
                perfectly secure, and we cannot guarantee absolute security, but we take reasonable steps
                appropriate to the sensitivity of the data we hold.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">8. Children&apos;s privacy</h2>
              <p>
                Rezlo is not directed at children under 16, and we do not knowingly collect data from children
                under 16. If you believe a child has provided us with personal data, contact us and we will delete
                it.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">9. Changes to this policy</h2>
              <p>
                We may update this Privacy Policy as Rezlo&apos;s features change. If we make material changes, we&apos;ll
                update the &quot;Last updated&quot; date above and, where appropriate, notify you directly.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">10. Contact us</h2>
              <p>
                For privacy questions, data access, or deletion requests, contact us at{" "}
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
