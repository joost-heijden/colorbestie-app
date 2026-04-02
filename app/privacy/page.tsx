import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ColorBestie privacy policy — how we handle your data.",
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-black text-[var(--text)] md:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Last updated: February 25, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--text)]">
          <Section title="1. Introduction">
            <p>
              ColorBestie (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our
              mobile application and website (collectively, the &quot;Service&quot;).
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p className="font-semibold">Account Information</p>
            <p>
              When you sign in with Google, we receive your name, email address, and profile picture.
              This information is used to create and manage your account.
            </p>

            <p className="mt-3 font-semibold">Uploaded Images</p>
            <p>
              When you upload a sketch or photo, it is temporarily stored on our servers to generate your
              marker-style color preview. Uploaded images are stored securely and associated with your account.
            </p>

            <p className="mt-3 font-semibold">Generated Previews</p>
            <p>
              The color previews generated from your uploads are stored in your gallery so you can access
              them later. You can delete these at any time.
            </p>

            <p className="mt-3 font-semibold">Usage Data</p>
            <p>
              We collect basic usage data such as pages visited and features used to improve the Service.
              This data is not personally identifiable.
            </p>

            <p className="mt-3 font-semibold">Local Data</p>
            <p>
              Some preferences (marker selections, learning progress, streak data) are stored locally on
              your device using localStorage and are never sent to our servers.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-inside list-disc space-y-1">
              <li>To provide and maintain the Service</li>
              <li>To generate marker-style color previews from your uploads</li>
              <li>To manage your account and subscription</li>
              <li>To process payments through Stripe</li>
              <li>To send you relevant notifications (if enabled)</li>
              <li>To improve the Service based on usage patterns</li>
            </ul>
          </Section>

          <Section title="4. Third-Party Services">
            <p>We use the following third-party services:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li><strong>Google Authentication</strong> — for sign-in (Google Privacy Policy applies)</li>
              <li><strong>Google Gemini AI</strong> — for generating color previews from your uploads</li>
              <li><strong>Supabase</strong> — for secure file storage</li>
              <li><strong>Stripe</strong> — for payment processing (Stripe Privacy Policy applies)</li>
            </ul>
            <p className="mt-2">
              Your uploaded images are sent to Google Gemini AI for processing. Google may process this
              data according to their own privacy policy.
            </p>
          </Section>

          <Section title="5. Data Storage and Security">
            <p>
              Your data is stored securely using industry-standard encryption. Account data is stored in a
              PostgreSQL database. Uploaded images and generated previews are stored in Supabase cloud storage
              with signed URLs that expire after a limited time.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your account data for as long as your account is active. Uploaded images and generated
              previews are kept until you delete them or close your account. You can delete individual previews
              from your gallery at any time.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Delete your generated previews at any time</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at privacy@colorbestie.app.
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              The Service is not directed to children under 13. We do not knowingly collect personal information
              from children under 13. If you believe we have collected data from a child, please contact us
              and we will promptly delete it.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2 font-semibold">privacy@colorbestie.app</p>
          </Section>
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
