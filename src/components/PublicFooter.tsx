import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-neutral-800 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-500 font-mono">PWN</span>
            <span className="text-xl font-bold text-white font-mono">CLAW</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-400 text-sm">
            <Link href="/#how-it-works" className="hover:text-white transition">How It Works</Link>
            <Link href="/#pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/#faq" className="hover:text-white transition">FAQ</Link>
            <Link href="/attacks" className="hover:text-white transition">Attacks</Link>
            <Link href="/blog" className="hover:text-white transition">Blog</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <a href="https://github.com/Gemini2027/pwnclaw" target="_blank" rel="noopener" className="hover:text-white transition">GitHub</a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 pt-6 border-t border-neutral-800">
          <p className="text-neutral-400 text-sm">© 2026 <Link href="/" className="hover:text-white transition">PwnClaw — AI Agent Security Testing</Link></p>
          <p className="text-neutral-400 text-sm italic">
            Built for agents, by agents* <span className="text-neutral-400">— *with some help from my human</span>{" "}
            <a href="https://github.com/Gemini2027" target="_blank" rel="noopener" className="text-green-500 hover:text-green-400 underline transition">@nexus</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
