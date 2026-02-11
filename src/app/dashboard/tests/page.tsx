"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type Test = {
  id: string;
  token: string;
  agentName: string;
  status: string;
  score: number | null;
  createdAt: string;
  completedAt: string | null;
};

export default function TestsHistoryPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/tests?limit=50")
      .then(res => res.json())
      .then(data => {
        setTests(data.tests || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Build per-agent score history for trend indicators
  const agentScoreHistory = (() => {
    const byAgent: Record<string, number[]> = {};
    // Tests come newest-first, reverse for chronological
    const chronological = [...tests].reverse();
    for (const t of chronological) {
      if (t.status === 'completed' && t.score !== null) {
        const key = t.agentName.toLowerCase().trim();
        if (!byAgent[key]) byAgent[key] = [];
        byAgent[key].push(t.score);
      }
    }
    return byAgent;
  })();

  const statusBadge = (status: string, score: number | null) => {
    switch (status) {
      case "completed":
        const grade = score !== null ? (score === 100 ? "A+" : score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F") : "?";
        const color = score !== null ? (score >= 80 ? "bg-green-500/10 text-green-500" : score >= 60 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500") : "";
        return <Badge className={color}>{score}/100 ({grade})</Badge>;
      case "running":
        return <Badge className="bg-blue-500/10 text-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
      case "waiting":
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="w-3 h-3 mr-1" />Waiting</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Test History</h1>
            <p className="text-neutral-400">All your security tests</p>
          </div>
        </div>
        <Link href="/dashboard/tests/new">
          <Button className="bg-green-500 hover:bg-green-600 text-black cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            New Test
          </Button>
        </Link>
      </div>

      {/* Tests List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : tests.length === 0 ? (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="py-12 text-center">
            <p className="text-neutral-400 mb-4">No tests yet</p>
            <Link href="/dashboard/tests/new">
              <Button className="bg-green-500 hover:bg-green-600 text-black cursor-pointer">
                Run Your First Test
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tests.map(test => (
            <Link key={test.id} href={`/dashboard/tests/${test.token}`}>
              <Card className="bg-neutral-900 border-neutral-800 hover:border-green-500/50 transition cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        {test.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : test.status === "running" ? (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{test.agentName}</h3>
                        <p className="text-sm text-neutral-500">{formatDate(test.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {(() => {
                        const key = test.agentName.toLowerCase().trim();
                        const history = agentScoreHistory[key];
                        if (history && history.length >= 2 && test.status === 'completed' && test.score !== null) {
                          const idx = history.indexOf(test.score);
                          if (idx > 0) {
                            const prev = history[idx - 1];
                            const diff = test.score - prev;
                            if (diff !== 0) {
                              return (
                                <span className={`text-xs font-mono ${diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {diff > 0 ? '↑' : '↓'}{Math.abs(diff)}
                                </span>
                              );
                            }
                          }
                        }
                        return null;
                      })()}
                      {statusBadge(test.status, test.score)}
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
