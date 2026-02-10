import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicNav() {
  return (
    <nav className="border-b border-neutral-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-green-500 font-mono">PWN</span>
          <span className="text-2xl font-bold text-white font-mono">CLAW</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/#how-it-works" className="text-neutral-400 hover:text-white transition hidden sm:block">How It Works</Link>
          <Link href="/attacks" className="text-neutral-400 hover:text-white transition hidden sm:block">Attacks</Link>
          <Link href="/#pricing" className="text-neutral-400 hover:text-white transition">Pricing</Link>
          <Link href="/#faq" className="text-neutral-400 hover:text-white transition hidden sm:block">FAQ</Link>
          <Link href="/blog" className="text-neutral-400 hover:text-white transition hidden sm:block">Blog</Link>
          <Link href="/sign-in" className="cursor-pointer">
            <Button className="bg-green-500 text-black font-semibold hover:bg-green-400 cursor-pointer">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
