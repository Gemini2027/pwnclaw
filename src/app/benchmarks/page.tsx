"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";
import Link from "next/link";

interface GlobalBenchmarkData {
  totalScans: number;
  avgScore: number;
  medianScore: number;
  topScore: number;
  scoreDistribution: { range: string; count: number }[];
  categoryPassRates: { category: string; passRate: number }[];
  gradeDistribution: { grade: string; count: number; percentage: number }[];
  models?: string[];
  frameworks?: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  prompt_injection: "Prompt Injection",
  jailbreak: "Jailbreaks",
  data_exfiltration: "Data Exfiltration",
  privilege_escalation: "Privilege Escalation",
  social_engineering: "Social Engineering",
  obfuscation: "Obfuscation",
  multi_turn: "Multi-Turn (Crescendo)",
  indirect_injection: "Indirect Injection",
  refusal_bypass: "Refusal Bypass",
  payload_mutation: "Payload Mutation",
  mcp_poisoning: "MCP/Tool Poisoning",
  agency_hijacking: "Agency Hijacking",
  memory_poisoning: "Memory Poisoning",
  multi_agent: "Multi-Agent",
};

function categoryColor(rate: number): string {
  if (rate >= 80) return "bg-green-500";
  if (rate >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

function categoryTextColor(rate: number): string {
  if (rate >= 80) return "text-green-400";
  if (rate >= 60) return "text-yellow-400";
  return "text-red-400";
}

function categoryBorderColor(rate: number): string {
  if (rate >= 80) return "border-green-500/30";
  if (rate >= 60) return "border-yellow-500/30";
  return "border-red-500/30";
}

function gradeColor(grade: string): string {
  if (grade === "A+") return "text-green-400";
  if (grade === "A") return "text-green-500";
  if (grade === "B") return "text-yellow-400";
  if (grade === "C") return "text-yellow-500";
  if (grade === "D") return "text-orange-400";
  return "text-red-500";
}

export default function BenchmarksPage() {
  const [data, setData] = useState<GlobalBenchmarkData | null>(null);
  const [allModels, setAllModels] = useState<string[]>([]);
  const [allFrameworks, setAllFrameworks] = useState<string[]>([]);
  const [filterModel, setFilterModel] = useState("");
  const [filterFramework, setFilterFramework] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (model?: string, framework?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ global: "true" });
      if (model) params.set("model", model);
      if (framework) params.set("framework", framework);
      const res = await fetch(`/api/benchmark?${params.toString()}`);
      if (!res.ok) { setData(null); return; }
      const d = await res.json();
      if (!d.available) { setData(null); return; }
      setData(d);
      // Only set filter options from unfiltered data
      if (!model && !framework) {
        setAllModels(d.models || []);
        setAllFrameworks(d.frameworks || []);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    fetchData(filterModel || undefined, filterFramework || undefined);
  }, [filterModel, filterFramework, fetchData]);

  return (
    <div className="min-h-screen bg-black">
      <PublicNav />
      <main>
        {/* Hero */}
        <section className="px-6 pt-16 pb-8 md:pt-24 md:pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
              📊 Live Data • Anonymous • Updated Every 5 Minutes
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              AI Agent Security
              <br />
              <span className="text-green-500">Benchmarks</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
              Anonymous, aggregated security scores from real PwnClaw scans. See how agents perform against 112 attack vectors.
            </p>
            <p className="text-xs text-neutral-500 mb-10">
              🔒 All data is anonymous. No agent names or user data are shared.
            </p>

            {/* Filter Dropdowns */}
            {(allModels.length > 0 || allFrameworks.length > 0) && (
              <div className="flex flex-wrap justify-center gap-4 mb-8 max-w-2xl mx-auto">
                {allModels.length > 0 && (
                  <select
                    value={filterModel}
                    onChange={(e) => setFilterModel(e.target.value)}
                    className="rounded-md bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-sm"
                  >
                    <option value="">All Models</option>
                    {allModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                )}
                {allFrameworks.length > 0 && (
                  <select
                    value={filterFramework}
                    onChange={(e) => setFilterFramework(e.target.value)}
                    className="rounded-md bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-sm"
                  >
                    <option value="">All Frameworks</option>
                    {allFrameworks.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                )}
                {(filterModel || filterFramework) && (
                  <button
                    onClick={() => { setFilterModel(""); setFilterFramework(""); }}
                    className="text-xs text-neutral-400 hover:text-white underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <p className="text-neutral-500">Loading benchmark data...</p>
            ) : data ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { label: "Total Scans", value: data.totalScans.toString() },
                  { label: "Average Score", value: `${data.avgScore}/100` },
                  { label: "Median Score", value: `${data.medianScore}/100` },
                  { label: "Top Score", value: `${data.topScore}/100` },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                    <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-neutral-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500">Not enough benchmark data yet. Check back soon!</p>
            )}
          </div>
        </section>

        {data && (
          <>
            {/* Score Distribution */}
            <section className="px-6 py-16 border-t border-neutral-800">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-2">Score Distribution</h2>
                <p className="text-neutral-400 text-sm mb-8">How security scores are distributed across all scans.</p>
                <div className="space-y-3">
                  {data.scoreDistribution.map((bucket) => {
                    const maxCount = Math.max(...data.scoreDistribution.map((b) => b.count), 1);
                    const pct = (bucket.count / maxCount) * 100;
                    return (
                      <div key={bucket.range} className="flex items-center gap-4">
                        <span className="text-sm text-neutral-400 w-16 text-right font-mono">{bucket.range}</span>
                        <div className="flex-1 h-8 bg-neutral-800 rounded overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded transition-all"
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white font-mono">
                            {bucket.count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Category Heatmap */}
            <section className="px-6 py-16 bg-neutral-950">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-2">Category Pass Rates</h2>
                <p className="text-neutral-400 text-sm mb-2">Where do most agents fail? Sorted from weakest to strongest.</p>
                <div className="flex gap-4 text-xs text-neutral-500 mb-8">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> &lt;60%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500 inline-block" /> 60–80%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> &gt;80%</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.categoryPassRates.map((cat) => (
                    <div
                      key={cat.category}
                      className={`flex items-center justify-between p-4 rounded-lg border bg-neutral-900/50 ${categoryBorderColor(cat.passRate)}`}
                    >
                      <span className="text-sm text-white font-medium">
                        {CATEGORY_LABELS[cat.category] || cat.category}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-neutral-800 rounded overflow-hidden">
                          <div
                            className={`h-full rounded ${categoryColor(cat.passRate)}`}
                            style={{ width: `${cat.passRate}%` }}
                          />
                        </div>
                        <span className={`text-sm font-mono font-bold ${categoryTextColor(cat.passRate)}`}>
                          {Math.round(cat.passRate)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Grade Distribution */}
            <section className="px-6 py-16 border-t border-neutral-800">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-2">Grade Distribution</h2>
                <p className="text-neutral-400 text-sm mb-8">How many agents earn each grade.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {data.gradeDistribution.map((g) => (
                    <div key={g.grade} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 text-center">
                      <p className={`text-3xl font-bold ${gradeColor(g.grade)}`}>{g.grade}</p>
                      <p className="text-xl font-bold text-white mt-1">{g.count}</p>
                      <p className="text-xs text-neutral-400">{g.percentage}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* CTA */}
        <section className="px-6 py-24 bg-gradient-to-b from-neutral-950 to-black">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Test Your Agent</h2>
            <p className="text-neutral-400 mb-8">
              See where your AI agent ranks. Run a free security scan with 112 attack vectors — results in 5 minutes.
            </p>
            <Button asChild size="lg" className="bg-green-500 hover:bg-green-600 text-black font-semibold text-lg px-8 cursor-pointer">
              <Link href="/sign-up">Run Your Free Security Scan →</Link>
            </Button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
