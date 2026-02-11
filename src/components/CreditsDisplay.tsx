"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

interface CreditsDisplayProps {
  initialCredits: number;
  maxCredits: number;
  plan: string;
  checkoutUrl: string;
}

export function CreditsDisplay({ 
  initialCredits, 
  maxCredits, 
  plan, 
  checkoutUrl 
}: CreditsDisplayProps) {
  const [credits, setCredits] = useState(initialCredits);
  const isUnlimited = maxCredits === -1;
  const [error, setError] = useState(false);
  
  // Poll for credit updates every 5 seconds when on dashboard
  useEffect(() => {
    const fetchCredits = async () => {
      // Skip polling when tab is not visible to save API calls
      if (document.visibilityState === 'hidden') return;
      try {
        const res = await fetch('/api/user/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.user?.creditsRemaining !== undefined) {
            setCredits(data.user.creditsRemaining);
            setError(false);
          }
        }
      } catch (e) {
        setError(true);
      }
    };

    // V4: Skip initial fetch if we already have props (avoids double request on dashboard load)
    if (initialCredits === undefined || initialCredits === null) {
      fetchCredits();
    }

    // Poll every 120 seconds (reduce unnecessary API calls, skipped when tab hidden)
    const interval = setInterval(fetchCredits, 120000);
    
    // Also listen for custom event when test starts
    const handleCreditUpdate = (e: CustomEvent) => {
      if (e.detail?.credits !== undefined) {
        setCredits(e.detail.credits);
      } else {
        fetchCredits();
      }
    };
    
    window.addEventListener('credits-updated' as any, handleCreditUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('credits-updated' as any, handleCreditUpdate);
    };
  }, []);

  const creditPercent = isUnlimited ? 100 : Math.round((credits / maxCredits) * 100);

  return (
    <div className="bg-neutral-900 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-400">Credits</span>
        <span className="font-mono text-white transition-all duration-300">
          {error ? '?' : isUnlimited ? '∞' : `${credits} / ${maxCredits}`}
        </span>
      </div>
      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${creditPercent}%` }} 
        />
      </div>
      {plan === 'free' ? (
        <div className="space-y-2">
          <a 
            href={checkoutUrl}
            className="flex items-center justify-center gap-2 w-full bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg py-2 text-sm font-medium transition-colors border border-neutral-700"
          >
            <Zap className="w-4 h-4 text-green-500" />
            Upgrade to Pro
          </a>
          <a 
            href={process.env.NEXT_PUBLIC_LEMONSQUEEZY_TEAM_CHECKOUT_URL || "https://noid-privacy.lemonsqueezy.com/checkout/buy/24932884-1785-4448-af51-cee3aa45b467?logo=0"}
            className="flex items-center justify-center gap-2 w-full bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg py-2 text-sm font-medium transition-colors border border-purple-500/50"
          >
            <Zap className="w-4 h-4 text-purple-500" />
            Upgrade to Team
          </a>
        </div>
      ) : plan === 'pro' ? (
        <a 
          href="/dashboard/upgrade-team"
          className="flex items-center justify-center gap-2 w-full bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg py-2 text-sm font-medium transition-colors border border-neutral-700"
        >
          <Zap className="w-4 h-4 text-purple-500" />
          Upgrade to Team
        </a>
      ) : (
        <div className="text-center text-sm text-green-500 font-medium">
          ✓ Team Plan
        </div>
      )}
    </div>
  );
}
