import { getAllPosts } from '@/lib/blog';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PublicNav } from '@/components/PublicNav';
import { PublicFooter } from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'PwnClaw Blog — AI Agent Security Research & Insights',
  description: 'Learn about AI agent security, prompt injection attacks, jailbreak prevention, and how to harden your LLM agents. Practical guides and research from the PwnClaw team.',
  alternates: { canonical: 'https://www.pwnclaw.com/blog' },
  openGraph: {
    title: 'PwnClaw Blog — AI Agent Security Research & Insights',
    description: 'Practical guides on AI agent security: prompt injection, jailbreaks, MCP poisoning, data exfiltration, and emerging attack vectors. Research from the PwnClaw team.',
    url: 'https://www.pwnclaw.com/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PwnClaw Blog — AI Agent Security Research & Insights',
    description: 'Practical guides on AI agent security: prompt injection, jailbreaks, and emerging attack vectors.',
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-black">
      <PublicNav />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-4">AI Agent Security Blog</h1>
        <p className="text-neutral-400 mb-12 text-lg">
          Practical guides on securing AI agents against prompt injection, jailbreaks, and emerging attack vectors.
          From the team behind <Link href="/" className="text-green-500 hover:text-green-400 underline">PwnClaw — AI agent security testing</Link>.
        </p>

        {posts.length === 0 ? (
          <p className="text-neutral-500">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-8">
            {posts.map(post => (
              <article key={post.slug} className="border border-neutral-800 rounded-lg p-6 hover:border-green-500/50 transition">
                <Link href={`/blog/${post.slug}`}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-mono">{tag}</span>
                    ))}
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2 hover:text-green-400 transition">{post.title}</h2>
                  <p className="text-neutral-400 text-sm mb-3">{post.description}</p>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <time>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    <span>{post.readingTime}</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
