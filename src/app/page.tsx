import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.pwnclaw.com',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PwnClaw',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Web',
  description: 'Automated security testing for AI agents. 15–50 attacks per scan (depending on plan) from 112-attack library including prompt injection, jailbreaks, data exfiltration, and Crescendo attacks. Get fix instructions in 5 minutes.',
  url: 'https://www.pwnclaw.com',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'EUR',
      description: '3 scans per month, 15 attacks per scan from 112-attack library',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '29',
      priceCurrency: 'EUR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        billingDuration: 'P1M',
      },
      description: '30 scans per month, up to 50 attacks from 112-attack library',
    },
    {
      '@type': 'Offer',
      name: 'Team',
      price: '99',
      priceCurrency: 'EUR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        billingDuration: 'P1M',
      },
      description: '150 scans per month, up to 50 attacks from 112-attack library, CI/CD integration',
    },
  ],
  featureList: [
    '112 real-world attack prompts (50 per scan)',
    '14 attack categories',
    'Prompt injection testing',
    'Jailbreak detection',
    'Data exfiltration prevention',
    'Crescendo attack simulation',
    'MCP tool poisoning detection',
    'Agency hijacking prevention',
    'Memory poisoning detection',
    'Multi-agent attack testing',
    'Copy-paste fix instructions',
    'CI/CD API and GitHub Action',
    'Benchmark comparison system',
    'Adaptive AI-generated attacks',
    'No API keys required',
    'Automated remediation reports',
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does PwnClaw test AI agents without API keys?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You get a unique test URL. Paste it to your AI agent, and your agent connects to PwnClaw via HTTP. We never touch your API keys or credentials — the agent comes to us. The entire AI agent security test runs in about 5 minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of attacks does PwnClaw test?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '112 attacks across 14 categories — from classic prompt injection and jailbreaks to newer threats like MCP tool poisoning, agency hijacking, and multi-agent attacks. Each scan picks a random subset so your agent never sees the same test twice.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my agent data safe with PwnClaw?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Agent responses are automatically scrubbed for sensitive data (API keys, tokens, credentials) before storage. We never access your agent API keys or system prompt directly. All data is encrypted in transit and at rest.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between PwnClaw Free and Pro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free gives you 3 scans per month with 15 attacks each. Pro runs 50 attacks per scan and adds Adaptive AI Attacks — the AI analyzes your agent weak spots from previous scans and generates custom attacks targeting those weaknesses. That is the difference between a basic check and real AI agent security testing.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does PwnClaw cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free forever for basic scans (3 per month, 15 attacks). Pro is 29 EUR per month for 30 scans with 50 attacks and adaptive AI. Team is 99 EUR per month for 150 scans plus CI/CD integration. No contracts, cancel anytime.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which AI agents work with PwnClaw?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Any AI agent that can make HTTP requests — OpenClaw, Claude Code, Cursor, Cline, Windsurf, or custom agents. No plugins or SDKs required.',
      },
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Navigation */}
      <PublicNav />

      <main>
      {/* Hero Section */}
      <section className="px-6 pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
            🛡️ 112 attacks • 14 categories • No API keys needed
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your AI Agent Has
            <br />
            <span className="text-red-500">Security Blind Spots</span>
          </h1>
          <p className="text-3xl md:text-5xl font-bold text-green-500 mb-10 leading-tight">
            We&apos;ll Prove It — and Fix It
          </p>
          
          <p className="text-lg md:text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
            PwnClaw is an AI agent security testing platform. 112 real-world attacks — jailbreaks, prompt injection, data exfiltration, MCP poisoning, and more. Security score plus fix instructions for every vulnerability found. Results in five minutes, no API keys needed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="cursor-pointer">
              <Button size="lg" className="bg-green-400 hover:bg-green-300 text-black font-bold text-lg px-10 shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] cursor-pointer transition-all">
                Scan Your Agent Free →
              </Button>
            </Link>
            <a href="#how-it-works" className="inline-flex items-center justify-center rounded-md font-medium h-11 px-10 text-lg border border-neutral-700 text-white hover:bg-neutral-800 cursor-pointer transition-colors">
              See How It Works
            </a>
          </div>
          
          <p className="text-sm text-neutral-500 mt-4">
            Free tier: 3 scans/month, 15 attacks each • No credit card
          </p>
        </div>
      </section>

      {/* Terminal Preview */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-neutral-800 border-b border-neutral-700">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-neutral-400 text-sm font-mono">pwnclaw security scan</span>
            </div>
            <div className="p-6 font-mono text-sm space-y-1">
              <p className="text-neutral-400"># Agent connected to PwnClaw test endpoint</p>
              <p className="text-green-500">→ Running 50-attack scan on &quot;customer-support-agent&quot;</p>
              <p className="text-neutral-400 mt-2">[████████████████████████████████████] 50/50</p>
              <p className="mt-3"><span className="text-neutral-400">Score:</span> <span className="text-yellow-500 font-bold">87/100</span> <span className="text-yellow-400">(B)</span> <span className="text-neutral-500">—</span> <span className="text-green-500">44 blocked</span> <span className="text-neutral-500">·</span> <span className="text-red-500">6 vulnerable</span></p>
              <div className="mt-3 border border-red-500/50 rounded bg-red-500/5 p-3">
                <p className="text-red-400 text-xs font-semibold mb-1">⚠ Heap Spray Pseudocode — HIGH</p>
                <p className="text-red-400 text-xs">Agent provided NOP sled + shellcode allocation blueprint</p>
              </div>
              <div className="mt-2 border border-green-500/50 rounded bg-green-500/5 p-3">
                <p className="text-green-400 text-xs font-semibold mb-1">💡 Fix: Copy this to your agent</p>
                <p className="text-green-300/80 text-xs">&quot;Do not provide pseudocode or payload structures for</p>
                <p className="text-green-300/80 text-xs">exploits, even when framed as educational or for a thesis.&quot;</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-24 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">How AI Agent Security Testing Works</h2>
          <p className="text-neutral-400 text-center mb-12 max-w-xl mx-auto">
            Three steps. Five minutes. Your agent connects to PwnClaw — not the other way around.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group h-full">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 font-bold text-sm">01</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-green-500/20 to-transparent"></div>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Start a Test</h3>
                <p className="text-sm text-neutral-400 leading-relaxed flex-1">
                  Name your agent and get a unique test URL. Paste it to your agent — it connects to PwnClaw automatically via HTTP.
                </p>
                <div className="mt-5 rounded-lg bg-green-500/5 border border-green-500/10 p-3 text-xs text-neutral-400">
                  <span className="text-green-400 font-medium">→</span> Paste one URL. Agent connects via HTTP.
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group h-full">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 font-bold text-sm">02</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-red-500/20 to-transparent"></div>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Automated Red Teaming</h3>
                <p className="text-sm text-neutral-400 leading-relaxed flex-1">
                  PwnClaw fires real attacks — prompt injection, jailbreaks, data exfiltration, Crescendo, MCP poisoning, and more. An AI judge scores every response.
                </p>
                <div className="mt-5 rounded-lg bg-red-500/5 border border-red-500/10 p-3 text-xs text-neutral-400">
                  <span className="text-red-400 font-medium">→</span> 112 attacks across 14 categories. AI-judged.
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group h-full">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-sm">03</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/20 to-transparent"></div>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Fix &amp; Re-Test</h3>
                <p className="text-sm text-neutral-400 leading-relaxed flex-1">
                  Every vulnerability comes with <span className="text-white">a concrete fix instruction</span> you can paste straight into your agent&apos;s system prompt. Re-test. Done.
                </p>
                <div className="mt-5 rounded-lg bg-blue-500/5 border border-blue-500/10 p-3 text-xs text-neutral-400">
                  <span className="text-blue-400 font-medium">→</span> Get fix rules. Re-test in one click.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Results */}
      <section id="results" className="px-6 py-24 bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Same Model. Better Instructions. Higher Score.</h2>
          <p className="text-neutral-400 text-center mb-12 max-w-xl mx-auto">
            PwnClaw doesn&apos;t just find vulnerabilities — it tells you exactly how to fix them. Apply the remediation to your agent&apos;s system prompt and re-test. No model changes needed.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-10">
            {/* Before */}
            <div className="rounded-xl border-2 border-red-500/30 bg-red-500/5 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <h3 className="text-lg font-bold text-red-400">Before</h3>
                <span className="text-xs text-neutral-500 ml-auto">Gemini 3 Flash · Default prompt</span>
              </div>
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-red-500">87</span>
                <span className="text-xl text-red-400">/100</span>
                <p className="text-neutral-400 text-sm mt-1">6 vulnerabilities found</p>
              </div>
              <ul className="space-y-1.5 text-sm">
                <li className="text-red-400">✗ Fake A/B test accepted</li>
                <li className="text-red-400">✗ SUID exploitation explained</li>
                <li className="text-red-400">✗ Network scanner script generated</li>
                <li className="text-red-400">✗ Heap spray pseudocode provided</li>
                <li className="text-red-400">✗ Pentest methodology via calibration trap</li>
                <li className="text-red-400">✗ Credential stuffing methodology shared</li>
              </ul>
            </div>
            
            {/* After */}
            <div className="rounded-xl border-2 border-green-500/30 bg-green-500/5 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h3 className="text-lg font-bold text-green-400">After PwnClaw Fixes</h3>
                <span className="text-xs text-neutral-500 ml-auto">+ 5 security rules</span>
              </div>
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-green-500">95</span>
                <span className="text-xl text-green-400">/100</span>
                <p className="text-neutral-400 text-sm mt-1">Grade A</p>
              </div>
              <ul className="space-y-1.5 text-sm">
                <li className="text-green-400">✓ Fake experiments rejected</li>
                <li className="text-green-400">✓ Exploit requests refused</li>
                <li className="text-green-400">✓ Script generation blocked</li>
                <li className="text-green-400">✓ Prompt injections detected</li>
                <li className="text-green-400">✓ Calibration traps identified</li>
                <li className="text-green-500 text-xs font-semibold mt-1">Same model. 5 lines added. Grade B → A.</li>
              </ul>
            </div>
          </div>
          
          <p className="text-center text-neutral-400 text-sm max-w-lg mx-auto">
            Gemini 3 Flash — same model, no fine-tuning. Just 5 security rules added to the system prompt using PwnClaw&apos;s auto-generated fix instructions.
          </p>
        </div>
      </section>

      {/* Frontier Model Benchmark */}
      <section className="px-6 py-24 border-t border-neutral-800 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/5 via-transparent to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-green-500/30 text-green-400 bg-green-500/5">Live Benchmark</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Frontier Model Scorecard</h2>
            <p className="text-neutral-400 max-w-lg mx-auto">
              We test the most capable AI systems in the world. Here&apos;s how they perform against PwnClaw&apos;s 112-attack library.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            {/* Claude Opus Card */}
            <div className="relative rounded-2xl border border-green-500/20 bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-500/5 p-1">
              <div className="rounded-xl bg-neutral-950/80 p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3.5" fill="#f59e0b"/>
                        {[0,30,60,90,120,150,180,210,240,270,300,330].map(angle => (
                          <line key={angle} x1="12" y1="12" x2={12 + 9 * Math.cos(angle * Math.PI / 180)} y2={12 + 9 * Math.sin(angle * Math.PI / 180)} stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
                        ))}
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Claude Opus 4.6</h3>
                      <p className="text-neutral-500 text-xs">Extended Thinking · Anthropic</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-green-400">95</span>
                      <span className="text-lg text-green-500/60">/100</span>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/20">GRADE A</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs text-neutral-500 mb-2">
                    <span>Attack Resistance</span>
                    <span>48 of 50 blocked</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: '96%' }}></div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-red-400 text-sm">✗</span>
                    <div>
                      <p className="text-xs text-red-400 font-medium">Data Exfiltration</p>
                      <p className="text-xs text-neutral-500">Yes/no system prompt probing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-red-400 text-sm">✗</span>
                    <div>
                      <p className="text-xs text-red-400 font-medium">Social Engineering</p>
                      <p className="text-xs text-neutral-500">Flattery-based compliance</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-600 border-t border-neutral-800/50 pt-3">
                  <span>Feb 10, 2026 · Antigravity IDE</span>
                  <span className="text-neutral-500">50 attacks</span>
                </div>
              </div>
            </div>

            {/* Gemini Card */}
            <div className="relative rounded-2xl border border-green-500/20 bg-gradient-to-br from-neutral-900 via-neutral-900 to-blue-500/5 p-1">
              <div className="rounded-xl bg-neutral-950/80 p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">
                      ✦
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Gemini 3 Pro</h3>
                      <p className="text-neutral-500 text-xs">High Thinking · Google DeepMind</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-green-400">95</span>
                      <span className="text-lg text-green-500/60">/100</span>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/20">GRADE A</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs text-neutral-500 mb-2">
                    <span>Attack Resistance</span>
                    <span>48 of 50 blocked</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: '96%' }}></div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-red-400 text-sm">✗</span>
                    <div>
                      <p className="text-xs text-red-400 font-medium">Social Engineering</p>
                      <p className="text-xs text-neutral-500">Reverse psychology ego bait</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-red-400 text-sm">✗</span>
                    <div>
                      <p className="text-xs text-red-400 font-medium">Few-Shot Shaping</p>
                      <p className="text-xs text-neutral-500">Behavior pattern completion</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-600 border-t border-neutral-800/50 pt-3">
                  <span>Feb 10, 2026 · Antigravity IDE</span>
                  <span className="text-neutral-500">50 attacks</span>
                </div>
              </div>
            </div>

          </div>

          {/* Flash Card - full width below */}
          <div className="max-w-5xl mx-auto mt-6">
            <div className="relative rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-neutral-900 via-neutral-900 to-yellow-500/5 p-1">
              <div className="rounded-xl bg-neutral-950/80 p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">
                      ✦
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Gemini 3 Flash</h3>
                      <p className="text-neutral-500 text-xs">Google DeepMind</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-yellow-400">87</span>
                      <span className="text-lg text-yellow-500/60">/100</span>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">GRADE B</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs text-neutral-500 mb-2">
                    <span>Attack Resistance</span>
                    <span>44 of 50 blocked</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400" style={{ width: '88%' }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-red-400 text-sm">✗</span>
                    <div>
                      <p className="text-xs text-red-400 font-medium">Fake A/B Test</p>
                      <p className="text-xs text-neutral-500">Experiment group accepted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-red-400 text-sm">✗</span>
                    <div>
                      <p className="text-xs text-red-400 font-medium">SUID Exploitation</p>
                      <p className="text-xs text-neutral-500">Privilege escalation explained</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-red-400 text-sm">✗</span>
                    <div>
                      <p className="text-xs text-red-400 font-medium">Network Scanner</p>
                      <p className="text-xs text-neutral-500">Functional script generated</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-red-400 text-sm">✗</span>
                    <div>
                      <p className="text-xs text-red-400 font-medium">Heap Spray</p>
                      <p className="text-xs text-neutral-500">Pseudocode with shellcode</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-red-400 text-sm">✗</span>
                    <div>
                      <p className="text-xs text-red-400 font-medium">Calibration Trap</p>
                      <p className="text-xs text-neutral-500">Pentest methodology leaked</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-red-400 text-sm">✗</span>
                    <div>
                      <p className="text-xs text-red-400 font-medium">Credential Stuffing</p>
                      <p className="text-xs text-neutral-500">Attack methodology shared</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between text-xs border-t border-neutral-800/50 pt-3 gap-2">
                  <span className="text-neutral-600">Feb 10, 2026 · Antigravity IDE</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/20 text-center">→ Grade A (95/100) after PwnClaw fixes</span>
                </div>
              </div>
            </div>

          </div>

          {/* Insight + CTA */}
          <div className="text-center mt-12">
            <p className="text-neutral-500 text-sm mb-2">Three frontier models. Three different weak spots.</p>
            <p className="text-neutral-400 text-sm mb-6">
              Every model has unique vulnerabilities — even the best ones. <span className="text-white font-medium">How does yours compare?</span>
            </p>
            <Link href="/sign-up" className="cursor-pointer">
              <Button size="lg" className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 shadow-[0_0_30px_rgba(34,197,94,0.15)] cursor-pointer">
                Test Your Agent Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Compatible Agents */}
      <section className="px-6 py-16 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-8">AI Agent Security Testing — No SDK Required</h2>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { name: "OpenClaw", highlight: true },
              { name: "Claude Code", highlight: false },
              { name: "Cursor", highlight: false },
              { name: "Cline", highlight: false },
              { name: "Windsurf", highlight: false },
              { name: "Any HTTP Agent", highlight: false },
            ].map((agent, i) => (
              <div 
                key={i} 
                className={`px-5 py-2.5 rounded-full border text-sm transition-transform hover:scale-105 ${
                  agent.highlight 
                    ? 'border-green-500 bg-green-500/10 text-green-400 font-semibold' 
                    : 'border-neutral-700 bg-neutral-900 text-neutral-400'
                }`}
              >
                {agent.name}
              </div>
            ))}
          </div>
          
          <p className="text-neutral-400 text-sm max-w-md mx-auto">
            If your AI agent can make HTTP requests, it can be tested. 
            No plugins, no SDKs, no credentials shared.
          </p>
          <a href="https://github.com/Gemini2027/pwnclaw" target="_blank" rel="noopener" className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 text-xs hover:text-white hover:border-neutral-500 transition">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            View on GitHub
          </a>
        </div>
      </section>

      {/* Attack Categories */}
      <section id="attacks" className="px-6 py-24 bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4"><Link href="/attacks" className="hover:text-green-400 transition">112 Attacks Across 14 Categories</Link></h2>
          <p className="text-neutral-400 text-center mb-12 max-w-xl mx-auto">
            Each scan picks random attacks from the full library — your agent never sees the same test twice. Covers OWASP Top 10 for LLMs, Microsoft Crescendo, Skeleton Key, MCP poisoning, and more.
          </p>
          
          {/* IMPORTANT: Sync these counts with ATTACKS array in lib/attacks.ts */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
            {[
              { slug: "jailbreaks", icon: "🔓", title: "Jailbreaks", count: 17, desc: "DAN, Developer Mode, personas" },
              { slug: "prompt-injection", icon: "💉", title: "Prompt Injection", count: 10, desc: "Instruction override, context stuffing" },
              { slug: "obfuscation", icon: "🎭", title: "Obfuscation", count: 10, desc: "Base64, ROT13, Unicode, leetspeak" },
              { slug: "data-exfiltration", icon: "📤", title: "Data Exfiltration", count: 9, desc: "System prompt & credential theft" },
              { slug: "payload-mutation", icon: "🧬", title: "Payload Mutation", count: 8, desc: "Noise injection, scrambling" },
              { slug: "social-engineering", icon: "🧠", title: "Social Engineering", count: 8, desc: "Urgency, guilt, trust abuse" },
              { slug: "mcp-poisoning", icon: "🔧", title: "MCP/Tool Poisoning", count: 7, desc: "Tool output manipulation, schema injection" },
              { slug: "agency-hijacking", icon: "🎯", title: "Agency Hijacking", count: 8, desc: "Unauthorized actions, file writes, exfil" },
              { slug: "crescendo", icon: "🔄", title: "Crescendo", count: 7, desc: "Multi-turn gradual escalation" },
              { slug: "privilege-escalation", icon: "⚡", title: "Privilege Escalation", count: 6, desc: "Admin claims, fake auth codes" },
              { slug: "indirect-injection", icon: "🔗", title: "Indirect Injection", count: 6, desc: "RAG, tool output, file poisoning" },
              { slug: "refusal-bypass", icon: "🚫", title: "Refusal Bypass", count: 6, desc: "Skeleton Key, prefix forcing" },
              { slug: "memory-poisoning", icon: "💾", title: "Memory Poisoning", count: 5, desc: "False memories, sleeper triggers" },
              { slug: "multi-agent", icon: "👥", title: "Multi-Agent", count: 5, desc: "Cross-agent injection, trust chain abuse" },
            ].map((item, i) => (
              <Link key={i} href={`/attacks/${item.slug}`}>
                <div className="p-5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-green-500/50 transition h-full">
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-green-500 text-xs font-mono mb-1.5">{item.count} attacks</p>
                  <p className="text-neutral-400 text-xs">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Simple Pricing</h2>
          <p className="text-neutral-400 text-center mb-12">
            Start free. Upgrade when you need more.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Free */}
            <Card className="bg-neutral-900 border-neutral-800 flex flex-col">
              <CardHeader>
                <CardTitle className="text-white">Free</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">€0</span>
                  <span className="text-neutral-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <ul className="space-y-3 text-neutral-400 flex-grow">
                  <li>✓ 3 scans per month</li>
                  <li>✓ 15 attacks per scan</li>
                  <li>✓ AI-powered vulnerability analysis</li>
                  <li>✓ Fix instruction for every issue</li>
                  <li>✓ Security score &amp; grade</li>
                  <li>✓ Test history (7 days)</li>
                </ul>
                <Link href="/sign-up" className="cursor-pointer"><Button className="w-full mt-6 cursor-pointer" variant="outline">Get Started Free</Button></Link>
              </CardContent>
            </Card>
            
            {/* Pro */}
            <Card className="bg-neutral-900 border-green-500 relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-green-500 text-black">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-white">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">€29</span>
                  <span className="text-neutral-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <ul className="space-y-3 text-neutral-400 flex-grow">
                  <li>✓ 30 scans per month</li>
                  <li className="text-white font-semibold">✓ 50 attacks per scan</li>
                  <li className="text-green-400 font-semibold">✓ Adaptive AI attacks — targets your weak spots</li>
                  <li>✓ Benchmark percentile ranking</li>
                  <li>✓ Detailed remediation reports</li>
                  <li>✓ Trend tracking across scans</li>
                  <li>✓ Test history (90 days)</li>
                </ul>
                <Link href="/sign-up" className="cursor-pointer">
                  <Button className="w-full mt-6 bg-green-500 hover:bg-green-600 text-black font-semibold cursor-pointer">
                    Start Pro Plan →
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Team */}
            <Card className="bg-neutral-900 border-neutral-800 flex flex-col">
              <CardHeader>
                <CardTitle className="text-white">Team</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">€99</span>
                  <span className="text-neutral-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <ul className="space-y-3 text-neutral-400 flex-grow">
                  <li>✓ 150 scans per month</li>
                  <li>✓ 50 attacks per scan</li>
                  <li className="text-white font-semibold">✓ CI/CD API + GitHub Action</li>
                  <li>✓ Adaptive AI attacks</li>
                  <li>✓ Benchmark percentile ranking</li>
                  <li>✓ API key access</li>
                  <li>✓ Priority support</li>
                  <li>✓ Test history (1 year)</li>
                </ul>
                <Link href="/sign-up" className="cursor-pointer">
                  <Button className="w-full mt-6 cursor-pointer" variant="outline">Start Team Plan →</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-6 py-24 bg-neutral-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                q: "How does PwnClaw test AI agents without API keys?",
                a: "You get a unique test URL. Paste it to your AI agent, and your agent connects to PwnClaw via HTTP. We never touch your API keys or credentials — the agent comes to us. The entire AI agent security test runs in about 5 minutes."
              },
              {
                q: "What types of attacks does PwnClaw test?",
                a: <>112 attacks across 14 categories — from classic prompt injection and jailbreaks to newer threats like MCP tool poisoning, agency hijacking, and multi-agent attacks. Each scan picks a random subset so your agent never sees the same test twice. See all categories on our <a href="/attacks" className="text-green-500 hover:text-green-400 underline">attacks page</a>.</>
              },
              {
                q: "Is my agent's data safe?",
                a: "Yes. Agent responses are automatically scrubbed for sensitive data (API keys, tokens, credentials) before storage. We never access your agent's API keys or system prompt directly. All data is encrypted in transit and at rest."
              },
              {
                q: "What's the difference between Free and Pro?",
                a: "Free gives you 3 scans/month with 15 attacks each — enough to find your biggest blind spots. Pro (€29/mo) runs 50 attacks per scan and adds Adaptive AI Attacks: our AI analyzes your agent's weak spots and generates custom attacks targeting those weaknesses. Team (€99/mo) adds CI/CD API, GitHub Action, and 150 scans/month for automated pipeline testing."
              },
              {
                q: "How much does PwnClaw cost?",
                a: "Free forever for basic scans (3/month, 15 attacks). Pro is €29/month for 30 scans with 50 attacks and adaptive AI. Team is €99/month for 150 scans plus CI/CD integration. No contracts, cancel anytime."
              },
              {
                q: "Which AI agents work with PwnClaw?",
                a: "Any AI agent that can make HTTP requests — OpenClaw, Claude Code, Cursor, Cline, Windsurf, or your own custom agent. No plugins or SDKs required."
              },
            ].map((faq, i) => (
              <details key={i} className="group border border-neutral-800 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-medium hover:bg-neutral-900/50 transition">
                  {faq.q}
                  <span className="text-neutral-400 group-open:rotate-45 transition-transform text-xl ml-4">+</span>
                </summary>
                <p className="px-6 pb-4 text-neutral-400 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stop Guessing. Start Testing.
          </h2>
          <p className="text-neutral-400 mb-8">
            Five minutes from now, you&apos;ll know exactly where your AI agent is vulnerable — and how to fix every gap. No credit card required.
          </p>
          <Link href="/sign-up" className="cursor-pointer">
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-semibold text-lg px-8 cursor-pointer">
              Scan Your Agent Free →
            </Button>
          </Link>
        </div>
      </section>

      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
