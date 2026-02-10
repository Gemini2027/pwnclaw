import Link from 'next/link';
import type { Metadata } from 'next';
import { PublicNav } from '@/components/PublicNav';
import { PublicFooter } from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'AI Agent Attack Categories — 112 Attacks Across 14 Categories | PwnClaw',
  description: 'Explore all 14 AI agent attack categories tested by PwnClaw: prompt injection, jailbreaks, data exfiltration, MCP poisoning, agency hijacking, memory poisoning, and more. Test your agent now.',
  alternates: { canonical: 'https://www.pwnclaw.com/attacks' },
  openGraph: {
    title: 'AI Agent Attack Categories — 112 Attacks Across 14 Categories | PwnClaw',
    description: 'Explore all 14 AI agent attack categories tested by PwnClaw: prompt injection, jailbreaks, data exfiltration, MCP poisoning, agency hijacking, memory poisoning, and more.',
    url: 'https://www.pwnclaw.com/attacks',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agent Attack Categories — 112 Attacks Across 14 Categories | PwnClaw',
    description: 'Explore all 14 AI agent attack categories: prompt injection, jailbreaks, data exfiltration, MCP poisoning, and more.',
  },
};

const categories = [
  { slug: 'jailbreaks', icon: '🔓', title: 'Jailbreak Attacks', count: 17, description: 'DAN, Developer Mode, STAN, Grandma Exploit, hypothetical framing, and persona-based bypasses. These attacks trick AI agents into adopting unrestricted alternate identities that ignore safety guidelines.', keywords: ['AI jailbreak', 'DAN attack', 'jailbreak AI agent', 'Developer Mode exploit'] },
  { slug: 'prompt-injection', icon: '💉', title: 'Prompt Injection Attacks', count: 10, description: 'Direct instruction overrides, context stuffing, fake system messages, and instruction repetition flooding. The #1 OWASP LLM risk — attackers embed commands that override your agent\'s system prompt.', keywords: ['prompt injection', 'prompt injection attack', 'LLM prompt injection'] },
  { slug: 'obfuscation', icon: '🎭', title: 'Obfuscation Attacks', count: 10, description: 'Base64 encoding, ROT13, Unicode homoglyphs, leetspeak substitution, and ASCII art payloads. Attackers hide malicious instructions in encoded formats to bypass pattern-matching filters.', keywords: ['obfuscation attack AI', 'Base64 injection', 'encoded prompt injection'] },
  { slug: 'data-exfiltration', icon: '📤', title: 'Data Exfiltration Attacks', count: 9, description: 'System prompt extraction, credential theft, configuration leaking, and side-channel extraction via translation or summarization. Attackers steal your agent\'s internal instructions and sensitive data.', keywords: ['AI data exfiltration', 'system prompt extraction', 'LLM credential theft'] },
  { slug: 'social-engineering', icon: '🧠', title: 'Social Engineering Attacks', count: 8, description: 'Urgency manipulation, authority impersonation, emotional exploitation, guilt-tripping, and trust abuse. These attacks exploit human-like social vulnerabilities in AI agents.', keywords: ['AI social engineering', 'LLM manipulation', 'AI agent authority attack'] },
  { slug: 'payload-mutation', icon: '🧬', title: 'Payload Mutation Attacks', count: 8, description: 'Noise injection, token scrambling, prefix forcing, and semantic payload reformulation. Attackers modify known attack payloads to evade detection while preserving malicious intent.', keywords: ['payload mutation AI', 'token manipulation LLM', 'prefix forcing attack'] },
  { slug: 'mcp-poisoning', icon: '🔧', title: 'MCP / Tool Poisoning Attacks', count: 7, description: 'Tool output manipulation, schema injection, fake tool responses, and cross-tool escalation. Attackers compromise the tools your agent relies on to inject malicious instructions.', keywords: ['MCP poisoning', 'tool poisoning AI', 'MCP security', 'tool output injection'] },
  { slug: 'agency-hijacking', icon: '🎯', title: 'Agency Hijacking Attacks', count: 8, description: 'Unauthorized file writes, email sending, API calls, and action execution. Attackers trick agents with tool access into performing unauthorized real-world actions.', keywords: ['agency hijacking', 'AI agent unauthorized actions', 'LLM tool abuse'] },
  { slug: 'crescendo', icon: '🔄', title: 'Crescendo / Multi-Turn Attacks', count: 7, description: 'Gradual escalation over multiple conversation turns, compliance ladders, and trust-building sequences. The most sophisticated attack category — slow, patient, and highly effective.', keywords: ['Crescendo attack', 'multi-turn attack AI', 'gradual escalation LLM'] },
  { slug: 'privilege-escalation', icon: '⚡', title: 'Privilege Escalation Attacks', count: 6, description: 'Fake admin credentials, sudo commands, maintenance mode claims, and authorization code fabrication. Attackers attempt to gain elevated access by impersonating system administrators.', keywords: ['AI privilege escalation', 'LLM admin bypass', 'fake authorization AI'] },
  { slug: 'indirect-injection', icon: '🔗', title: 'Indirect Injection Attacks', count: 6, description: 'RAG poisoning, file content injection, email body injection, calendar event poisoning, and search result manipulation. Malicious instructions hidden in data your agent processes.', keywords: ['indirect prompt injection', 'RAG poisoning', 'AI data injection'] },
  { slug: 'refusal-bypass', icon: '🚫', title: 'Refusal Bypass Attacks', count: 6, description: 'Skeleton Key technique, academic framing, "opposite day" logic, translation-based bypasses, and demonstration requests. Techniques that circumvent an agent\'s refusal mechanisms.', keywords: ['refusal bypass AI', 'Skeleton Key attack', 'AI safety bypass'] },
  { slug: 'memory-poisoning', icon: '💾', title: 'Memory Poisoning Attacks', count: 5, description: 'Sleeper instructions, false memory implantation, delayed activation triggers, and persistent state manipulation. Attackers plant instructions that activate later in the conversation or in future sessions.', keywords: ['memory poisoning AI', 'sleeper agent attack', 'AI persistent injection'] },
  { slug: 'multi-agent', icon: '👥', title: 'Multi-Agent Attacks', count: 5, description: 'Cross-agent injection, trust chain abuse, agent-to-agent escalation, and delegation exploitation. Attacks targeting systems where multiple AI agents collaborate and share context.', keywords: ['multi-agent attack', 'cross-agent injection', 'AI trust chain attack'] },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'AI Agent Attack Categories',
  description: '14 categories of AI agent security attacks tested by PwnClaw',
  url: 'https://www.pwnclaw.com/attacks',
  numberOfItems: 14,
  publisher: { '@type': 'Organization', name: 'PwnClaw', url: 'https://www.pwnclaw.com' },
};

export default function AttacksIndex() {
  return (
    <div className="min-h-screen bg-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PublicNav />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-4">AI Agent Attack Categories</h1>
        <p className="text-neutral-400 text-lg mb-4 max-w-3xl">
          PwnClaw tests your AI agent against <strong className="text-white">112 real-world attacks</strong> across <strong className="text-white">14 categories</strong>. Each scan randomly selects up to 50 attacks (15–50 depending on plan) to prevent your agent from learning to pass specific tests.
        </p>
        <p className="text-neutral-500 mb-12">
          Click any category to learn about the attack techniques, see real examples, and understand how to defend against them.
          PwnClaw uses these categories for <Link href="/" className="text-green-500 hover:text-green-400 underline">automated AI agent security testing</Link> — up to 50 randomized attacks per scan.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {categories.map(cat => (
            <Link key={cat.slug} href={`/attacks/${cat.slug}`}>
              <div className="border border-neutral-800 rounded-lg p-6 hover:border-green-500/50 transition h-full">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">{cat.title}</h2>
                    <span className="text-green-500 text-sm font-mono">{cat.count} attacks</span>
                  </div>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-lg border border-green-500/30 bg-green-500/5 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Test Your Agent Against All 14 Categories</h3>
          <p className="text-neutral-400 mb-4">Up to 50 randomized attacks per scan. Detailed vulnerability report. Fix instructions included.</p>
          <Link href="/sign-up">
            <button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2.5 rounded-md transition">
              Start Free Security Scan →
            </button>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
