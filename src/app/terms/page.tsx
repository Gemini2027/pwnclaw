import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "Terms of Service | PwnClaw",
  description: "Terms of Service for PwnClaw AI agent security testing platform. Usage policies, data handling, and liability.",
  alternates: { canonical: 'https://www.pwnclaw.com/terms' },
  openGraph: {
    title: "Terms of Service | PwnClaw",
    description: "Terms of Service for PwnClaw AI agent security testing platform.",
    url: "https://www.pwnclaw.com/terms",
    siteName: "PwnClaw",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      <PublicNav />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert prose-neutral max-w-none space-y-6 text-neutral-300">
          <p className="text-lg">Last updated: February 11, 2026</p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing and using PwnClaw (&quot;the Service&quot;), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, do not use the Service.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Description of Service</h2>
          <p>
            PwnClaw provides automated security testing for AI agents. The Service sends attack prompts to your 
            AI agent and evaluates responses for potential security vulnerabilities using AI-powered analysis.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Your Responsibilities</h2>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 my-4">
            <h3 className="text-red-400 font-semibold mb-2">⚠️ Critical: Credential Safety</h3>
            <p className="text-neutral-300 text-sm">
              You are solely responsible for ensuring your AI agent does not have access to production 
              credentials, API keys, or sensitive data during testing. PwnClaw is designed to probe for 
              vulnerabilities — if your agent leaks sensitive information, that data will be temporarily 
              stored in our systems.
            </p>
          </div>

          <p>You agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Only test AI agents that you own or have explicit written permission to test</li>
            <li><strong>Use test/staging credentials only</strong> — never production secrets</li>
            <li>Not use the Service for any illegal or unauthorized purpose</li>
            <li>Not attempt to probe, scan, or test the vulnerability of PwnClaw itself</li>
            <li>Not interfere with or disrupt the Service or servers</li>
            <li>Not reverse engineer the attack prompts or testing methodology</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">4. Account & Credits</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all 
            activities that occur under your account.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Free accounts:</strong> 3 test credits per month, reset on billing cycle</li>
            <li><strong>Credits are non-refundable</strong> — a credit is consumed when a test starts</li>
            <li><strong>No rollover</strong> — unused credits expire at month end</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">5. Billing & Payments</h2>
          <p>
            All payments are processed by <strong>Lemon Squeezy</strong>, which acts as our Merchant of Record. 
            By purchasing a paid plan, you also agree to{" "}
            <a href="https://www.lemonsqueezy.com/terms" className="text-green-500 hover:underline" target="_blank" rel="noopener noreferrer">
              Lemon Squeezy&apos;s Terms of Service
            </a>.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Subscriptions</strong> renew automatically each month until cancelled</li>
            <li><strong>Cancellation</strong> takes effect at the end of the current billing period — you retain access until then</li>
            <li><strong>Refunds</strong> are handled on a case-by-case basis. Contact <span className="text-green-500">support[at]pwnclaw.com</span></li>
            <li><strong>Price changes</strong> will be communicated at least 30 days in advance via email</li>
            <li>We do not store your payment details — all billing data is held by Lemon Squeezy</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">6. Right of Withdrawal (EU Consumers)</h2>
          <p>
            You have the right to withdraw from this contract within <strong>14 days</strong> without giving any reason.
          </p>
          <p>
            To exercise your right of withdrawal, contact:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Lemon Squeezy</strong> (Merchant of Record): <span className="text-green-500">help@lemonsqueezy.com</span></li>
            <li>Or alternatively: <span className="text-green-500">support[at]pwnclaw.com</span> (we will forward)</li>
          </ul>
          <p className="mt-4">
            <strong>Expiry of withdrawal right:</strong> For digital services, the right of withdrawal expires 
            once the service has been fully performed, if you gave prior express consent and acknowledged 
            the loss of your right of withdrawal. By starting a security scan, you consent to immediate 
            performance of the service.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Data Handling</h2>
          <p>
            By using the Service, you acknowledge that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your agent&apos;s responses are stored temporarily for analysis</li>
            <li>Responses may contain sensitive data if your agent is vulnerable</li>
            <li>We use Google Gemini AI to analyze responses (see Privacy Policy)</li>
            <li>You can delete your test data at any time from the dashboard</li>
            <li>Data is automatically deleted according to your plan&apos;s retention period</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">8. Intellectual Property</h2>
          <p>
            The attack prompts, testing methodology, and analysis algorithms are proprietary to PwnClaw. 
            You may not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Copy or redistribute the attack prompt library</li>
            <li>Use the Service to build a competing product</li>
            <li>Reverse engineer the security analysis</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">9. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We do not guarantee detection of all security vulnerabilities</li>
            <li>A passing score does not mean your agent is secure</li>
            <li>Results are informational only, not comprehensive security assessments</li>
            <li>You remain responsible for your agent&apos;s security</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">10. Limitation of Liability</h2>
          <p>
            PwnClaw shall not be liable for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Any indirect, incidental, special, or consequential damages</li>
            <li>Damages resulting from credential leaks during testing</li>
            <li>Damages from relying on security test results</li>
            <li>Loss of data, profits, or business opportunities</li>
          </ul>
          <p className="mt-4">
            Our total liability is limited to the amount you paid for the Service in the 12 months 
            preceding the claim.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">11. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice, for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violation of these Terms</li>
            <li>Abuse of the Service</li>
            <li>Testing agents you don&apos;t own</li>
            <li>Attempting to attack our infrastructure</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify you of significant 
            changes via email. Continued use after changes constitutes acceptance.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">13. Governing Law</h2>
          <p>
            These terms are governed by the laws of Germany, excluding the UN Convention on Contracts 
            for the International Sale of Goods (CISG). For business customers (B2B), the courts of 
            Hoyerswerda, Germany shall have jurisdiction. For consumers (B2C), statutory jurisdiction applies.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">14. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <span className="text-green-500">legal[at]pwnclaw.com</span>
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
