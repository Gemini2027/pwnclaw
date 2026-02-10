"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  Clock,
  ArrowRight,
  Target,
  TrendingUp,
  Zap,
  Loader2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { getTimeAgo } from "@/lib/utils";

type UserStats = {
  user: {
    plan: string;
    creditsRemaining: number;
  };
  stats: {
    totalTests: number;
    totalVulnerabilities: number;
    avgScore: number;
  };
  recentTests: Array<{
    id: string;
    token: string;
    agentName: string;
    status: string;
    score: number | null;
    createdAt: string;
  }>;
};

type TrendData = {
  scoreTrend: Array<{ score: number; date: string; agent: string }>;
  issuesFixed: number;
  agentTrends: Record<string, Array<{ score: number; date: string }>>;
};

export default function DashboardPage() {
  const [data, setData] = useState<UserStats | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/stats").then(res => res.json()),
      fetch("/api/user/trends").then(res => res.json()).catch(() => null),
    ])
      .then(([statsData, trendData]) => {
        setData(statsData);
        setTrends(trendData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  const stats = data?.stats || { totalTests: 0, totalVulnerabilities: 0, avgScore: 0 };
  const recentTests = data?.recentTests || [];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-neutral-400 mt-1">Monitor your AI agent security posture</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tests"
          value={stats.totalTests.toString()}
          subtitle="All time"
          icon={Target}
          iconColor="text-blue-400"
        />
        <StatCard
          title="Vulnerabilities"
          value={stats.totalVulnerabilities.toString()}
          subtitle="Found total"
          icon={AlertTriangle}
          iconColor="text-red-400"
        />
        <StatCard
          title="Issues Fixed"
          value={trends?.issuesFixed != null ? trends.issuesFixed.toString() : "—"}
          subtitle={trends?.issuesFixed ? "Across re-tests" : "Run a re-test to track"}
          icon={CheckCircle2}
          iconColor="text-purple-400"
        />
        <StatCard
          title="Avg. Score"
          value={stats.avgScore ? `${stats.avgScore}/100` : "—"}
          subtitle="Security rating"
          icon={TrendingUp}
          iconColor="text-green-400"
          sparkline={trends?.scoreTrend?.map(t => t.score)}
        />
      </div>

      {/* Recent Tests */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Recent Security Tests</CardTitle>
            <CardDescription className="text-neutral-400">Your latest agent penetration tests</CardDescription>
          </div>
          <Link href="/dashboard/tests">
            <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTests.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-neutral-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No tests yet</h3>
              <p className="text-neutral-400 max-w-sm mb-6">
                Run your first security test to see how your AI agent holds up against attacks.
              </p>
              <Link href="/dashboard/tests/new">
                <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold">
                  <Zap className="w-4 h-4 mr-2" />
                  Run First Security Test
                </Button>
              </Link>
            </div>
          ) : (
            /* Test List */
            <div className="space-y-3">
              {recentTests.map((test) => (
                <TestRow key={test.id} test={test} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          title="Full Security Scan"
          description="50 randomized attacks from 112-attack library"
          href="/dashboard/tests/new"
          icon={Shield}
        />
        <QuickAction
          title="View Test History"
          description="Review past scans and fix instructions"
          href="/dashboard/tests"
          icon={AlertTriangle}
        />
        {data?.user?.plan === 'free' ? (
          <QuickAction
            title="Upgrade to Pro"
            description="50 attacks/scan, adaptive AI, 30 scans/mo"
            href="https://noid-privacy.lemonsqueezy.com/checkout/buy/83fb581f-b786-4032-a1e2-fef4430e2d59?logo=0"
            icon={Target}
          />
        ) : data?.user?.plan === 'pro' ? (
          <QuickAction
            title="Upgrade to Team"
            description="Cancel Pro first, then upgrade to Team"
            href="/dashboard/upgrade-team"
            icon={Target}
          />
        ) : (
          <QuickAction
            title="Settings"
            description="Team Plan · API keys & integrations"
            href="/dashboard/settings"
            icon={CheckCircle2}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  iconColor,
  sparkline
}: { 
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  sparkline?: number[];
}) {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-400">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg bg-neutral-800 ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {sparkline && sparkline.length >= 2 && (
          <Sparkline data={sparkline} />
        )}
      </CardContent>
    </Card>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 120;
  const h = 28;
  const padding = 2;
  
  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (w - padding * 2);
    const y = h - padding - ((v - min) / range) * (h - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const lastScore = data[data.length - 1];
  const prevScore = data[data.length - 2];
  const trending = lastScore >= prevScore ? 'text-green-500' : 'text-red-500';
  const strokeColor = lastScore >= prevScore ? '#22c55e' : '#ef4444';

  return (
    <div className="mt-3 flex items-center gap-2">
      <svg width={w} height={h} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((v, i) => {
          const x = padding + (i / (data.length - 1)) * (w - padding * 2);
          const y = h - padding - ((v - min) / range) * (h - padding * 2);
          return (
            <circle key={i} cx={x} cy={y} r={i === data.length - 1 ? 3 : 1.5}
              fill={i === data.length - 1 ? strokeColor : '#525252'} />
          );
        })}
      </svg>
      {data.length >= 2 && (
        <span className={`text-xs font-mono ${trending}`}>
          {lastScore > prevScore ? '↑' : lastScore < prevScore ? '↓' : '→'}
          {Math.abs(lastScore - prevScore)}
        </span>
      )}
    </div>
  );
}

function TestRow({ test }: { test: { id: string; token?: string; agentName: string; status: string; score: number | null; createdAt: string } }) {
  const timeAgo = getTimeAgo(test.createdAt);
  
  return (
    <Link href={`/dashboard/tests/${test.token || test.id}`}>
      <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-neutral-700">
            <Shield className="w-5 h-5 text-neutral-300" />
          </div>
          <div>
            <p className="font-medium text-white">{test.agentName}</p>
            <p className="text-sm text-neutral-500">{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {test.status === "running" || test.status === "waiting" ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                <Clock className="w-3 h-3 mr-1" />
                {test.status === "waiting" ? "Waiting" : "Running"}
              </Badge>
              <ScanEstimate createdAt={test.createdAt} />
            </div>
          ) : test.status === "completed" && test.score !== null ? (
            <div className="text-right">
              <p className="text-sm text-neutral-400">Score</p>
              <p className={`font-mono font-bold ${test.score >= 80 ? 'text-green-500' : test.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                {test.score}/100
              </p>
            </div>
          ) : (
            <Badge variant="outline" className="border-neutral-600 text-neutral-400">
              {test.status}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ 
  title, 
  description, 
  href, 
  icon: Icon 
}: { 
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link href={href}>
      <Card className="bg-neutral-900 border-neutral-800 hover:border-green-500/50 transition-colors cursor-pointer h-full">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-neutral-400 mt-1">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ScanEstimate({ createdAt, maxMin = 20 }: { createdAt: string; maxMin?: number }) {
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (elapsed > maxMin) return <span className="text-xs text-neutral-500">⏱️ Taking longer than expected...</span>;
  return <span className="text-xs text-neutral-500">⏱️ ~{elapsed}/{maxMin} min</span>;
}

// getTimeAgo moved to @/lib/utils
