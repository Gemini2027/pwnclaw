"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-neutral-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-green-500 font-mono">PWN</span>
          <span className="text-2xl font-bold text-white font-mono">CLAW</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/#how-it-works" className="text-neutral-400 hover:text-white transition">How It Works</Link>
          <Link href="/attacks" className="text-neutral-400 hover:text-white transition">Attacks</Link>
          <Link href="/benchmarks" className="text-neutral-400 hover:text-white transition">Benchmarks</Link>
          <Link href="/#pricing" className="text-neutral-400 hover:text-white transition">Pricing</Link>
          <Link href="/#faq" className="text-neutral-400 hover:text-white transition">FAQ</Link>
          <Link href="/blog" className="text-neutral-400 hover:text-white transition">Blog</Link>
          <Link href="/sign-in" className="cursor-pointer">
            <Button variant="outline" className="border-green-500 text-green-400 font-semibold hover:bg-green-500/20 hover:text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.15)] cursor-pointer">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-neutral-400 hover:text-white transition text-2xl"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden mt-4 pb-4 flex flex-col gap-3 border-t border-neutral-800 pt-4">
          <Link href="/#how-it-works" className="text-neutral-400 hover:text-white transition" onClick={() => setOpen(false)}>How It Works</Link>
          <Link href="/attacks" className="text-neutral-400 hover:text-white transition" onClick={() => setOpen(false)}>Attacks</Link>
          <Link href="/benchmarks" className="text-neutral-400 hover:text-white transition" onClick={() => setOpen(false)}>Benchmarks</Link>
          <Link href="/#pricing" className="text-neutral-400 hover:text-white transition" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/#faq" className="text-neutral-400 hover:text-white transition" onClick={() => setOpen(false)}>FAQ</Link>
          <Link href="/blog" className="text-neutral-400 hover:text-white transition" onClick={() => setOpen(false)}>Blog</Link>
          <Link href="/sign-in" className="cursor-pointer" onClick={() => setOpen(false)}>
            <Button variant="outline" className="border-green-500 text-green-400 font-semibold hover:bg-green-500/20 hover:text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.15)] cursor-pointer w-full">
              Sign In
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
