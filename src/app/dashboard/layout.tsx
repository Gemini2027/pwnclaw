import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { 
  Plus,
  Menu
} from "lucide-react";
import { getUserByClerkId, getOrCreateUser } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/supabase";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { MobileSidebar } from "@/components/MobileSidebar";
import { DashboardNav } from "@/components/DashboardNav";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';
  
  // Get or create user in database (ensures user exists before any purchase)
  const dbUser = user?.id ? await getOrCreateUser(user.id, userEmail) : null;
  const credits = dbUser?.credits_remaining ?? 3;
  const plan = dbUser?.plan ?? 'free';
  const maxCredits = PLAN_LIMITS[plan]?.credits ?? 3;
  
  // Build Lemon Squeezy checkout URL with user email pre-filled
  // NOTE: NEXT_PUBLIC_ vars are inlined at build time. If not set during build, the fallback URL is used.
  // Store: noid-privacy.lemonsqueezy.com (shared store for PwnClaw + NoID Privacy)
  const baseCheckoutUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL || "https://noid-privacy.lemonsqueezy.com/checkout/buy/83fb581f-b786-4032-a1e2-fef4430e2d59?logo=0";
  const checkoutUrl = userEmail 
    ? `${baseCheckoutUrl}?checkout[email]=${encodeURIComponent(userEmail)}&checkout[custom][user_id]=${user?.id || ''}&checkout[custom][source]=pwnclaw`
    : `${baseCheckoutUrl}?checkout[custom][source]=pwnclaw`;
  return (
    <div className="min-h-screen flex bg-black">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-neutral-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-500 font-mono">PWN</span>
          <span className="text-xl font-bold text-white font-mono">CLAW</span>
        </Link>
        <MobileSidebar plan={plan} credits={credits} maxCredits={maxCredits} checkoutUrl={checkoutUrl} />
      </div>
      
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 border-r border-neutral-800 bg-neutral-950 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-500 font-mono">PWN</span>
            <span className="text-xl font-bold text-white font-mono">CLAW</span>
          </Link>
        </div>

        {/* New Test Button */}
        <div className="p-4">
          <Link
            href="/dashboard/tests/new"
            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-black rounded-lg py-3 font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Security Test
          </Link>
        </div>

        {/* Navigation */}
        <DashboardNav />

        {/* Usage / Upgrade - Live updating */}
        <div className="p-4 border-t border-neutral-800">
          <CreditsDisplay 
            initialCredits={credits}
            maxCredits={maxCredits}
            plan={plan}
            checkoutUrl={checkoutUrl}
          />
        </div>

        {/* User */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Account</p>
              <p className={`text-xs ${plan === 'free' ? 'text-neutral-500' : 'text-green-500'}`}>
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </p>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
            <Link href="/terms" className="hover:text-neutral-300 transition">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-neutral-300 transition">Privacy</Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-black pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}

// NavItem extracted to DashboardNav client component for active state support
