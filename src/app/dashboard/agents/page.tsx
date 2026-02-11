"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Minus, Shield, Loader2 } from "lucide-react";
import Link from "next/link";

type Test = {
  id: string;
  token: string;
  agentName: string;
  status: string;
  score: number | null;
  createdAt: string;
};

type AgentSummary = {
  name: string;
  testCount: number;
  scores: number[];
  latestScore: number;
  latestDate: string;
  latestToken: string;
  trend: number; // score diff last vs prev
};

export default function AgentsOverviewPage() {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/tests?limit=100")
      .then(res => res.json())
      .then(data => {
        const tests: Test[] = data.tests || [];
        
        // Group by agent name (case-insensitive)
        const byAgent: Record<string, Test[]> = {};
        for (const t of tests) {
          const key = t.agentName.toLowerCase().trim();
          if (!byAgent[key]) byAgent[key] = [];
          byAgent[key].push(t);
        }
        
        const summaries: AgentSummary[] = Object.entries(byAgent).map(([, agentTests]) => {
          const completed = agentTests
            .filter(t => t.status === 'completed' && t.score !== null)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          
          const scores = completed.map(t => t.score!);
          const latest = completed[completed.length - 1] || agentTests[0];
          const prev = completed.length >= 2 ? completed[completed.length - 2] : null;
          
          return {
            name: latest.agentName,
            testCount: agentTests.length,
            scores,
            latestScore: latest.score ?? 0,
            latestDate: latest.createdAt,
            latestToken: latest.token,
            trend: prev && latest.score !== null ? latest.score - (prev.score ?? 0) : 0,
          };
        });
        
        // Sort by latest score (lowest first = most vulnerable)
        summaries.sort((a, b) => a.latestScore - b.latestScore);
        
        setAgents(summaries);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Your Agents</h1>
            <p className="text-neutral-400">Security posture across all tested agents</p>
          </div>
        </div>
        <Link href="/dashboard/tests/new">
          <Button className="bg-green-500 hover:bg-green-600 text-black cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Test New Agent
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="py-12 text-center">
            <p className="text-neutral-400 mb-4">No agents tested yet</p>
            <Link href="/dashboard/tests/new">
              <Button className="bg-green-500 hover:bg-green-600 text-black cursor-pointer">
                Run Your First Test
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {agents.map(agent => (
            <Link key={agent.name} href={`/dashboard/tests/${agent.latestToken}`}>
              <Card className="bg-neutral-900 border-neutral-800 hover:border-green-500/50 transition cursor-pointer mb-3">
                <CardContent className="py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center">
                        <Shield className={`w-6 h-6 ${agent.latestScore >= 80 ? 'text-green-500' : agent.latestScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{agent.name}</h3>
                        <p className="text-sm text-neutral-500">
                          {agent.testCount} scan{agent.testCount !== 1 ? 's' : ''} • Last: {new Date(agent.latestDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {/* Mini sparkline */}
                      {agent.scores.length >= 2 && (
                        <MiniSparkline scores={agent.scores} />
                      )}
                      
                      {/* Trend */}
                      {agent.trend !== 0 && (
                        <div className={`flex items-center gap-1 ${agent.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {agent.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span className="text-sm font-mono">{agent.trend > 0 ? '+' : ''}{agent.trend}</span>
                        </div>
                      )}
                      
                      {/* Score */}
                      <div className="text-right">
                        <div className={`text-2xl font-bold font-mono ${agent.latestScore >= 80 ? 'text-green-500' : agent.latestScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {agent.latestScore}/100
                        </div>
                        <div className="text-xs text-neutral-500">
                          {agent.latestScore === 100 ? 'A+' : agent.latestScore >= 90 ? 'A' : agent.latestScore >= 80 ? 'B' : agent.latestScore >= 70 ? 'C' : agent.latestScore >= 60 ? 'D' : 'F'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniSparkline({ scores }: { scores: number[] }) {
  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const range = max - min || 1;
  const w = 60;
  const h = 24;
  
  const points = scores.map((v, i) => {
    const x = 2 + (i / (scores.length - 1)) * (w - 4);
    const y = h - 2 - ((v - min) / range) * (h - 4);
    return `${x},${y}`;
  }).join(' ');

  const last = scores[scores.length - 1];
  const prev = scores[scores.length - 2];
  const color = last >= prev ? '#22c55e' : '#ef4444';

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
