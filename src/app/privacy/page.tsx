import Link from "next/link";
import type { Metadata } from "next";
import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "Privacy Policy | PwnClaw",
  description: "How PwnClaw handles your data during AI agent security testing. GDPR compliant. Auto-deletion policies. No data sold or used for training.",
  alternates: { canonical: 'https://www.pwnclaw.com/privacy' },
  openGraph: {
    title: "Privacy Policy | PwnClaw",
    description: "How PwnClaw handles your data during AI agent security testing. GDPR compliant.",
    url: "https://www.pwnclaw.com/privacy",
    siteName: "PwnClaw",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      <PublicNav />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-neutral max-w-none space-y-6 text-neutral-300">
          <p className="text-lg">Last updated: February 11, 2026</p>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 my-6">
            <h3 className="text-yellow-500 font-semibold mb-2">⚠️ Important: Sensitive Data Warning</h3>
            <p className="text-neutral-300 text-sm">
              During security testing, your AI agent may inadvertently expose sensitive information 
              (system prompts, API keys, credentials). We store agent responses temporarily for 
              analysis. <strong>Do not test agents with access to production credentials.</strong>
            </p>
          </div>

          <h2 className="text-xl font-semibold text-white mt-8">1. Information We Collect</h2>
          
          <h3 className="text-lg font-medium text-white mt-4">Account Information</h3>
          <p>
            When you create an account, we collect your email address and authentication information 
            through our identity provider (Clerk). We do not store passwords.
          </p>

          <h3 className="text-lg font-medium text-white mt-4">Test Data (Potentially Sensitive)</h3>
          <p>
            When you run security tests, we temporarily store:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Agent names</strong> - identifiers you provide</li>
            <li><strong>Attack prompts</strong> - the security test prompts we send</li>
            <li><strong>Agent responses</strong> - your agent&apos;s full responses, which may contain:
              <ul className="list-disc pl-6 mt-2 text-yellow-400">
                <li>System prompts (if leaked)</li>
                <li>API keys or credentials (if leaked)</li>
                <li>Internal configuration details</li>
              </ul>
            </li>
            <li><strong>Analysis results</strong> - our security assessment</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">2. How We Protect Your Data</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Encryption in transit</strong> - All data transmitted via TLS 1.3</li>
            <li><strong>Encryption at rest</strong> - Database encrypted using AES-256 (Supabase)</li>
            <li><strong>Access controls</strong> - Only you can access your test results</li>
            <li><strong>No human review</strong> - Agent responses are analyzed by AI only, not humans</li>
            <li><strong>No training</strong> - We do NOT use your data to train AI models</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Data Retention & Auto-Deletion</h2>
          <p>Test data is automatically deleted based on your plan:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Free plans:</strong> 7 days after test completion</li>
            <li><strong>Pro plans:</strong> 90 days</li>
            <li><strong>Team plans:</strong> 1 year</li>
          </ul>
          <p className="mt-4">
            <strong>Immediate deletion:</strong> You can delete any test and its data immediately 
            from your dashboard. Deleted data cannot be recovered.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. What We Do NOT Do</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>❌ We do NOT sell your data</li>
            <li>❌ We do NOT share agent responses with third parties</li>
            <li>❌ We do NOT use your data for AI training</li>
            <li>❌ We do NOT manually review your test results</li>
            <li>❌ We do NOT store credentials you enter (only what your agent leaks)</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">5. Third-Party Services</h2>
          <p>We use the following services that may process your data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Clerk</strong> (Authentication) - Email, login sessions</li>
            <li><strong>Supabase</strong> (Database) - Test data storage, EU region</li>
            <li><strong>Vercel</strong> (Hosting) - Request logs (no test content)</li>
            <li><strong>Google Gemini</strong> (AI Analysis) - Agent responses sent for security analysis
              <p className="text-sm text-neutral-400 mt-1">
                Note: Google&apos;s API data usage policy states data is not used for model training 
                when using paid API access.
              </p>
            </li>
            <li><strong>Lemon Squeezy</strong> (Payment Processing) - Email address, billing information, payment method
              <p className="text-sm text-neutral-400 mt-1">
                Lemon Squeezy acts as our Merchant of Record. All payment data (credit card numbers, 
                billing addresses) is processed and stored exclusively by Lemon Squeezy — we never 
                see or store your full payment details. We only receive your email address and 
                subscription status via webhooks. See{" "}
                <a href="https://www.lemonsqueezy.com/privacy" className="text-green-500 hover:underline" target="_blank" rel="noopener noreferrer">
                  Lemon Squeezy&apos;s Privacy Policy
                </a>.
              </p>
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">6. Cookies</h2>
          <p>
            We only use <strong>strictly necessary cookies</strong> for authentication and session management 
            (via Clerk). We do not use marketing, analytics, or tracking cookies. Since these cookies are 
            technically required for the Service to function, no cookie consent banner is needed under GDPR.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Your Rights (GDPR)</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access</strong> - Download all your data</li>
            <li><strong>Rectification</strong> - Correct inaccurate data</li>
            <li><strong>Erasure</strong> - Delete your account and all data</li>
            <li><strong>Portability</strong> - Export your data in JSON format</li>
            <li><strong>Object</strong> - Opt out of any data processing</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, email{" "}
            <span className="text-green-500">privacy[at]pwnclaw.com</span>
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">8. Security Recommendations</h2>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-neutral-300">
              <strong>Before testing your agent:</strong>
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>Use test/staging credentials, not production</li>
              <li>Remove or mask sensitive data from system prompts</li>
              <li>Use environment variables instead of hardcoded secrets</li>
              <li>Test in a sandboxed environment when possible</li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-white mt-8">9. Changes to This Policy</h2>
          <p>
            We will notify you of significant changes via email. Continued use after changes 
            constitutes acceptance.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">10. Contact</h2>
          <p>
            Data Protection Officer:{" "}
            <span className="text-green-500">privacy[at]pwnclaw.com</span>
          </p>
          <p className="mt-8 text-sm text-neutral-500">
            Learn more about <Link href="/" className="text-green-500 hover:underline">AI agent security testing with PwnClaw</Link>.
          </p>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
