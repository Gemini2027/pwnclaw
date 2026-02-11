import Link from "next/link";
import type { Metadata } from "next";
import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "Imprint | PwnClaw",
  description: "Legal information and imprint for PwnClaw AI agent security testing platform.",
  alternates: { canonical: 'https://www.pwnclaw.com/imprint' },
};

export default function ImprintPage() {
  return (
    <div className="min-h-screen bg-black">
      <PublicNav />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Imprint</h1>
        
        <div className="prose prose-invert prose-neutral max-w-none space-y-6 text-neutral-300">
          <h2 className="text-xl font-semibold text-white mt-8">Information according to § 5 DDG (German Digital Services Act)</h2>
          <p>
            Fabio Mantegna<br />
            c/o Autorenglück #52020<br />
            Albert-Einstein-Straße 47<br />
            02977 Hoyerswerda<br />
            Germany
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Contact</h2>
          <p>
            Email: <span className="text-green-500">support[at]pwnclaw.com</span>
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">VAT ID</h2>
          <p>
            VAT identification number according to §27a UStG (German VAT Act): DE363585915
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Responsible for content according to § 18 Abs. 2 MStV</h2>
          <p>
            Fabio Mantegna<br />
            c/o Autorenglück #52020<br />
            Albert-Einstein-Straße 47<br />
            02977 Hoyerswerda<br />
            Germany
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Merchant of Record</h2>
          <p>
            Payment processing, invoicing, and refunds are handled by{" "}
            <a href="https://www.lemonsqueezy.com" className="text-green-500 hover:underline" target="_blank" rel="noopener noreferrer">
              Lemon Squeezy, LLC
            </a>{" "}
            (USA) as Merchant of Record.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">EU Online Dispute Resolution</h2>
          <p>
            The European Commission provides a platform for online dispute resolution (ODR):{" "}
            <a href="https://ec.europa.eu/consumers/odr" className="text-green-500 hover:underline" target="_blank" rel="noopener noreferrer">
              https://ec.europa.eu/consumers/odr
            </a>
          </p>
          <p>
            We are not willing or obliged to participate in dispute resolution proceedings 
            before a consumer arbitration board.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Liability for Content</h2>
          <p>
            As a service provider, we are responsible for our own content on these pages in accordance 
            with general legislation. However, we are not obliged to monitor transmitted or stored 
            third-party information or to investigate circumstances that indicate illegal activity. 
            Obligations to remove or block the use of information under general law remain unaffected.
          </p>

          <p className="mt-8 text-sm text-neutral-500">
            <Link href="/privacy" className="text-green-500 hover:underline">Privacy Policy</Link>
            {" · "}
            <Link href="/terms" className="text-green-500 hover:underline">Terms of Service</Link>
            {" · "}
            <Link href="/" className="text-green-500 hover:underline">Back to PwnClaw</Link>
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
