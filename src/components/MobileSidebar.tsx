"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, FlaskConical, Plus, Bot, Settings } from "lucide-react";

interface MobileSidebarProps {
  plan: string;
  credits: number;
  maxCredits: number;
  checkoutUrl: string;
  teamCheckoutUrl?: string;
}

export function MobileSidebar({ plan, credits, maxCredits, checkoutUrl, teamCheckoutUrl }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-neutral-400 hover:text-white"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <span className="text-xl font-bold text-green-500 font-mono">PWN</span>
                <span className="text-xl font-bold text-white font-mono">CLAW</span>
              </Link>
              <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-white" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* New Test */}
            <div className="p-4">
              <Link
                href="/dashboard/tests/new"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-black rounded-lg py-3 font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Security Test
              </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1">
              {[
                { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                { href: "/dashboard/tests", icon: FlaskConical, label: "Tests" },
                { href: "/dashboard/agents", icon: Bot, label: "Agents" },
                { href: "/dashboard/settings", icon: Settings, label: "Settings" },
              ].map(({ href, icon: Icon, label }) => {
                const isActive = href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "text-white bg-neutral-800"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Credits */}
            <div className="p-4 border-t border-neutral-800">
              <div className="text-sm text-neutral-400">
                {credits === -1 ? '∞' : credits}/{maxCredits === -1 ? '∞' : maxCredits} scans
              </div>
              <div className="text-xs text-neutral-500 capitalize">{plan} Plan</div>
              {plan === 'free' ? (
                <div className="space-y-1">
                  <a href={checkoutUrl} className="block text-xs text-green-500 hover:underline">
                    Upgrade to Pro →
                  </a>
                  <a href={teamCheckoutUrl || checkoutUrl} className="block text-xs text-purple-500 hover:underline">
                    Upgrade to Team →
                  </a>
                </div>
              ) : plan === 'pro' ? (
                <a href="/dashboard/upgrade-team" className="text-xs text-purple-500 hover:underline">
                  Upgrade to Team →
                </a>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-800">
              <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
                <Link href="/terms" className="hover:text-neutral-300" onClick={() => setOpen(false)}>Terms</Link>
                <span>•</span>
                <Link href="/privacy" className="hover:text-neutral-300" onClick={() => setOpen(false)}>Privacy</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
