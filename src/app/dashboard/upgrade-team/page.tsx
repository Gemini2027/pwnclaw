"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function UpgradeTeamPage() {
  // V14: Removed unused fetch to /api/user/stats (email comes from checkout prefill)

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Upgrade to Team</h1>
          <p className="text-neutral-400">Two quick steps</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-500 text-sm font-bold">1</span>
              Cancel your Pro subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-400 text-sm">
              Open your Lemon Squeezy customer portal and cancel your current Pro plan. 
              You&apos;ll keep Pro access until the end of your billing period.
            </p>
            <a
              href="https://noid-privacy.lemonsqueezy.com/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors border border-neutral-700"
            >
              Open Billing Portal
              <ArrowRight className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 text-sm font-bold">2</span>
              Subscribe to Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-400 text-sm">
              After cancelling Pro, start your Team subscription. You&apos;ll get 150 scans/month, 
              CI/CD API, GitHub Action integration, and priority support.
            </p>
            <a
              href={process.env.NEXT_PUBLIC_LEMONSQUEEZY_TEAM_CHECKOUT_URL || "https://noid-privacy.lemonsqueezy.com/checkout/buy/24932884-1785-4448-af51-cee3aa45b467?logo=0"}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Start Team Plan — €99/mo
              <ArrowRight className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>

        {/* What you get */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">What&apos;s included in Team</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> 150 scans per month (5x Pro)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> CI/CD API + GitHub Action</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> API key access for automation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Priority support</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> 1 year test history</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
