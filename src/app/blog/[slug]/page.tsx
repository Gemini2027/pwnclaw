import { getAllPosts, getPost } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PublicNav } from '@/components/PublicNav';
import { PublicFooter } from '@/components/PublicFooter';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://www.pwnclaw.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

// Simple markdown to HTML (no external deps)
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMarkdown(md: string): string {
  // First: escape HTML in code blocks and inline code to prevent XSS
  // Protect code blocks first
  const codeBlocks: string[] = [];
  let escaped = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre class="bg-neutral-900 border border-neutral-800 rounded-lg p-4 overflow-x-auto my-6"><code class="text-sm text-green-300 font-mono">${escapeHtml(code)}</code></pre>`);
    return `%%CODEBLOCK_${idx}%%`;
  });
  // Protect inline code
  const inlineCodes: string[] = [];
  escaped = escaped.replace(/`([^`]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code class="bg-neutral-800 px-1.5 py-0.5 rounded text-green-400 text-sm font-mono">${escapeHtml(code)}</code>`);
    return `%%INLINECODE_${idx}%%`;
  });
  // Escape any remaining raw HTML tags in text
  escaped = escaped.replace(/<(?!%%)(script|iframe|object|embed|form|input|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
  escaped = escaped.replace(/<(script|iframe|object|embed|form|input|style)[^>]*\/?>/gi, '');

  let html = escaped
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-white mt-10 mb-4">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-12 mb-4">$1</h2>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // Links (internal links stay in tab, external open new tab)
    .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2" class="text-green-400 hover:text-green-300 underline">$1</a>')
    // W8: rel="noopener noreferrer" to prevent reverse tabnapping and referrer leakage
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" class="text-green-400 hover:text-green-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="text-neutral-300 ml-4">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="text-neutral-300 ml-4 list-decimal">$1</li>')
    // Paragraphs (lines not already tagged)
    .replace(/^(?!<[hluop]|<li|<pre|<code)(.+)$/gm, '<p class="text-neutral-300 leading-relaxed mb-4">$1</p>')
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="list-disc space-y-2 my-4 pl-2">$1</ul>');

  // Tables (must run after other transforms)
  html = html.replace(/(?:^|\n)(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm, (_, header, _sep, body) => {
    const heads = header.split('|').filter((c: string) => c.trim()).map((c: string) => 
      `<th class="px-4 py-2 text-left text-white font-semibold text-sm border-b border-neutral-700">${c.trim()}</th>`
    ).join('');
    const rows = body.trim().split('\n').map((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) =>
        `<td class="px-4 py-2 text-neutral-300 text-sm border-b border-neutral-800">${c.trim()}</td>`
      ).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-neutral-800 rounded-lg"><thead><tr>${heads}</tr></thead><tbody>${rows}</tbody></table></div>`;
  });

  // Restore code blocks and inline code
  codeBlocks.forEach((block, i) => { html = html.replace(`%%CODEBLOCK_${i}%%`, block); });
  inlineCodes.forEach((code, i) => { html = html.replace(`%%INLINECODE_${i}%%`, code); });

  return html;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'PwnClaw', url: 'https://www.pwnclaw.com' },
    mainEntityOfPage: `https://www.pwnclaw.com/blog/${slug}`,
    keywords: post.tags.join(', '),
  };

  return (
    <div className="min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <PublicNav />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-mono">{tag}</span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-12">
          <time>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          <span>{post.readingTime}</span>
          <span>by {post.author}</span>
        </div>

        <article
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        <div className="mt-16 p-8 rounded-lg border border-green-500/30 bg-green-500/5 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Run an AI Agent Security Test Now</h3>
          <p className="text-neutral-400 mb-4"><Link href="/" className="text-green-400 hover:text-green-300 underline">PwnClaw&apos;s AI agent pentesting</Link> covers 112 attacks across 14 categories. Detailed fix instructions. Free tier available.</p>
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
