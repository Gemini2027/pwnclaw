import { ATTACK_CATEGORIES, getCategory } from '@/lib/attack-categories';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PublicNav } from '@/components/PublicNav';
import { PublicFooter } from '@/components/PublicFooter';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return ATTACK_CATEGORIES.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return {};
  return {
    title: cat.metaTitle,
    description: cat.metaDescription,
    alternates: { canonical: `https://www.pwnclaw.com/attacks/${slug}` },
    openGraph: { title: cat.metaTitle, description: cat.metaDescription, type: 'article' },
  };
}

export default async function AttackCategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: cat.metaTitle,
    description: cat.metaDescription,
    url: `https://www.pwnclaw.com/attacks/${slug}`,
    publisher: { '@type': 'Organization', name: 'PwnClaw', url: 'https://www.pwnclaw.com' },
    about: { '@type': 'Thing', name: cat.title },
  };

  const prevIdx = ATTACK_CATEGORIES.findIndex(c => c.slug === slug) - 1;
  const nextIdx = ATTACK_CATEGORIES.findIndex(c => c.slug === slug) + 1;
  const prev = prevIdx >= 0 ? ATTACK_CATEGORIES[prevIdx] : null;
  const next = nextIdx < ATTACK_CATEGORIES.length ? ATTACK_CATEGORIES[nextIdx] : null;

  return (
    <div className="min-h-screen bg-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PublicNav />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{cat.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-white">{cat.title}</h1>
            <span className="text-green-500 font-mono text-sm">{cat.count} attacks in PwnClaw library</span>
          </div>
        </div>

        <p className="text-neutral-300 leading-relaxed mb-10 text-lg">{cat.intro}</p>

        <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-neutral-300 leading-relaxed mb-10">{cat.howItWorks}</p>

        <h2 className="text-2xl font-bold text-white mb-6">Attack Examples</h2>
        <div className="space-y-4 mb-10">
          {cat.examples.map((ex, i) => (
            <div key={i} className="border border-neutral-800 rounded-lg p-5">
              <h3 className="text-white font-semibold mb-2">{ex.name}</h3>
              <p className="text-neutral-400 text-sm">{ex.description}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Defense Strategies</h2>
        <p className="text-neutral-500 text-sm mb-4">Add these to your agent&apos;s system prompt:</p>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-10">
          <ul className="space-y-3">
            {cat.defense.map((d, i) => (
              <li key={i} className="text-green-300 text-sm font-mono leading-relaxed">
                &quot;{d}&quot;
              </li>
            ))}
          </ul>
        </div>

        {cat.relatedPosts.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">Related Articles</h2>
            <div className="space-y-3 mb-10">
              {cat.relatedPosts.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="block border border-neutral-800 rounded-lg p-4 hover:border-green-500/50 transition">
                  <span className="text-green-400 hover:text-green-300">{post.title} →</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="mt-12 p-8 rounded-lg border border-green-500/30 bg-green-500/5 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Test Your Agent Against {cat.title}</h3>
          <p className="text-neutral-400 mb-4">PwnClaw includes {cat.count} {cat.title.toLowerCase()} in its 112-attack library. Get your score in 5 minutes.</p>
          <Link href="/sign-up">
            <button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2.5 rounded-md transition">
              Start Free Security Scan →
            </button>
          </Link>
        </div>

        {/* Prev/Next Navigation */}
        <div className="flex justify-between mt-12 pt-8 border-t border-neutral-800">
          {prev ? (
            <Link href={`/attacks/${prev.slug}`} className="text-neutral-400 hover:text-white transition">
              ← {prev.icon} {prev.title}
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/attacks/${next.slug}`} className="text-neutral-400 hover:text-white transition">
              {next.icon} {next.title} →
            </Link>
          ) : <span />}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
