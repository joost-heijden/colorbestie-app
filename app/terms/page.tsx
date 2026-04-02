import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "ColorBestie terms and conditions of use.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--accent)]" />
            <span className="text-sm font-bold text-[var(--text)]">ColorBestie</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 md:px-8">
        <h1 className="text-3xl font-black text-[var(--text)] md:text-4xl">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Last updated: March 23, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--text)]">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using ColorBestie (&quot;the Service&quot;), you agree to be bound by these
              Terms &amp; Conditions. If you do not agree to these terms, please do not use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              ColorBestie is a mobile application and web service that generates alcohol-marker color
              reference previews from uploaded sketches and photos using artificial intelligence. The
              Service requires a paid subscription or credits to generate previews.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <p>
              To use the Service, you must create an account by signing in with Google, Apple, or email.
              You are responsible for maintaining the security of your account credentials. You must be
              at least 13 years of age to use the Service.
            </p>
          </Section>

          <Section title="4. Subscriptions and Payments">
            <p>
              ColorBestie offers paid subscriptions (monthly, yearly) and a lifetime access option.
              Subscriptions automatically renew unless cancelled before the end of the current billing period.
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Monthly and yearly subscriptions include a set number of credits per billing period.</li>
              <li>Lifetime access includes a one-time credit grant.</li>
              <li>Additional credit packs can be purchased separately by active subscribers.</li>
              <li>All payments are processed securely through Stripe.</li>
              <li>Refunds are handled according to the applicable app store or Stripe refund policies.</li>
            </ul>
          </Section>

          <Section title="5. Credits and Usage">
            <p>
              Each image generation consumes one credit. Credits are granted upon subscription activation
              or purchase. Unused credits from subscription periods do not carry over unless otherwise stated.
              Credit balances are non-transferable and non-refundable.
            </p>
          </Section>

          <Section title="6. User Content">
            <p>
              You retain ownership of all images you upload to the Service. By uploading content, you grant
              ColorBestie a limited license to process your images for the purpose of generating color
              previews. Generated previews are stored in your account and can be deleted at any time.
            </p>
            <p className="mt-2">
              You agree not to upload content that is illegal, offensive, or infringes on the rights of others.
            </p>
          </Section>

          <Section title="7. AI-Generated Content">
            <p>
              Color previews are generated using artificial intelligence (Google Gemini AI). Results are
              approximate and intended as creative references only. ColorBestie does not guarantee the
              accuracy of color matching or the suitability of generated previews for any specific purpose.
            </p>
          </Section>

          <Section title="8. Third-Party Services">
            <p>The Service integrates with the following third-party providers:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li><strong>Google Authentication</strong> &mdash; for account sign-in</li>
              <li><strong>Apple Authentication</strong> &mdash; for account sign-in</li>
              <li><strong>Google Gemini AI</strong> &mdash; for image processing and color preview generation</li>
              <li><strong>Supabase</strong> &mdash; for file storage and email authentication</li>
              <li><strong>Stripe</strong> &mdash; for payment processing</li>
            </ul>
            <p className="mt-2">
              Use of these services is subject to their respective terms and privacy policies.
            </p>
          </Section>

          <Section title="9. Intellectual Property">
            <p>
              The ColorBestie name, logo, mascot, and all associated branding are the intellectual property
              of ColorBestie. You may not reproduce, distribute, or create derivative works from any part
              of the Service without prior written consent.
            </p>
          </Section>

          <Section title="10. Account Termination">
            <p>
              You may delete your account at any time from the Profile page. Active subscriptions must be
              cancelled before account deletion. We reserve the right to suspend or terminate accounts that
              violate these terms.
            </p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p>
              ColorBestie is provided &quot;as is&quot; without warranties of any kind. We are not liable
              for any indirect, incidental, or consequential damages arising from your use of the Service.
              Our total liability shall not exceed the amount you paid for the Service in the preceding
              12 months.
            </p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>
              We may update these Terms &amp; Conditions from time to time. Continued use of the Service
              after changes constitutes acceptance of the updated terms. We will notify users of significant
              changes by posting the updated terms on this page.
            </p>
          </Section>

          <Section title="13. Governing Law">
            <p>
              These terms are governed by and construed in accordance with the laws of the Netherlands.
              Any disputes shall be resolved in the competent courts of the Netherlands.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              If you have questions about these Terms &amp; Conditions, please contact us at:
            </p>
            <p className="mt-2 font-semibold">support@colorbestie.app</p>
          </Section>
        </div>

        <div className="mt-10 border-t border-[var(--border)] pt-6">
          <Link href="/privacy" className="text-sm font-semibold text-[var(--accent)] underline underline-offset-2">
            Privacy Policy
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-[var(--text)]">{title}</h2>
      {children}
    </section>
  );
}
