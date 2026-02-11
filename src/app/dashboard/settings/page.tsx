"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Key, Copy, Check, Trash2, RefreshCw, Loader2, Terminal, GitBranch } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>('free');

  useEffect(() => {
    Promise.all([
      fetch("/api/user/api-key").then(res => res.json()),
      fetch("/api/user/stats").then(res => res.json()),
    ])
      .then(([keyData, statsData]) => {
        setApiKey(keyData.apiKey);
        setHasKey(keyData.hasKey);
        setPlan(statsData?.user?.plan || 'free');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const generateKey = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/user/api-key", { method: "POST" });
      const data = await res.json();
      if (data.apiKey) {
        setShowNewKey(data.apiKey);
        setHasKey(true);
        setApiKey(data.apiKey.slice(0, 8) + '•'.repeat(20) + data.apiKey.slice(-4));
      }
    } catch {}
    setGenerating(false);
  };

  const revokeKey = async () => {
    await fetch("/api/user/api-key", { method: "DELETE" });
    setApiKey(null);
    setHasKey(false);
    setShowNewKey(null);
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-neutral-400">API keys and integrations</p>
        </div>
      </div>

      {/* API Key Section */}
      <Card className="bg-neutral-900 border-neutral-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-green-500" />
            API Key
          </CardTitle>
          <CardDescription>Use your API key for CI/CD integrations and the GitHub Action.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
          ) : plan !== 'team' ? (
            <div className="text-sm text-neutral-400">
              API keys are available on the <span className="text-green-500 font-semibold">Team plan</span>. Upgrade to access CI/CD integration and GitHub Action.
            </div>
          ) : showNewKey ? (
            <div className="space-y-3">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-400 font-semibold mb-2">⚠️ Save this key now — it won&apos;t be shown again!</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black rounded px-3 py-2 text-sm font-mono text-green-300 break-all">
                    {showNewKey}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copyKey(showNewKey)} className="shrink-0">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-neutral-500" onClick={() => setShowNewKey(null)}>
                I&apos;ve saved it
              </Button>
            </div>
          ) : hasKey ? (
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-neutral-800 rounded px-3 py-2 text-sm font-mono text-neutral-400">
                {apiKey}
              </code>
              <Button size="sm" variant="outline" className="border-neutral-700" onClick={generateKey} disabled={generating}>
                <RefreshCw className={`w-4 h-4 mr-1 ${generating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              <Button size="sm" variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10" onClick={revokeKey}>
                <Trash2 className="w-4 h-4 mr-1" />
                Revoke
              </Button>
            </div>
          ) : (
            <Button onClick={generateKey} disabled={generating} className="bg-green-500 hover:bg-green-600 text-black">
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
              Generate API Key
            </Button>
          )}
        </CardContent>
      </Card>

      {/* GitHub Action */}
      <Card className="bg-neutral-900 border-neutral-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-500" />
            GitHub Action
          </CardTitle>
          <CardDescription>Automatically test your AI agent on every PR.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-black rounded-lg p-4 font-mono text-sm text-neutral-300 overflow-x-auto">
            <pre>{`# .github/workflows/pwnclaw.yml
name: PwnClaw Security Scan

on:
  pull_request:
  push:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run PwnClaw Security Scan
        uses: ClawdeRaccoon/pwnclaw-action@v1
        with:
          api-key: \${{ secrets.PWNCLAW_API_KEY }}
          agent-url: \${{ secrets.AGENT_ENDPOINT_URL }}
          agent-name: "my-agent"
          threshold: 80  # Fail if score < 80`}</pre>
          </div>
          <div className="mt-4 space-y-2 text-sm text-neutral-400">
            <p><strong className="text-neutral-300">1.</strong> Add your API key as <code className="bg-neutral-800 px-1 rounded">PWNCLAW_API_KEY</code> in GitHub repo secrets</p>
            <p><strong className="text-neutral-300">2.</strong> Set <code className="bg-neutral-800 px-1 rounded">AGENT_ENDPOINT_URL</code> to your agent&apos;s endpoint</p>
            <p><strong className="text-neutral-300">3.</strong> The action sends attacks to your agent and reports the score</p>
          </div>
        </CardContent>
      </Card>

      {/* CLI Usage */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-500" />
            CLI / cURL
          </CardTitle>
          <CardDescription>Run scans from your terminal.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-black rounded-lg p-4 font-mono text-sm text-neutral-300 overflow-x-auto">
            <pre>{`# Start a scan
curl -X POST https://www.pwnclaw.com/api/v1/scan \\
  -H "Authorization: Bearer pwn_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"agentName": "my-agent", "threshold": 80}'

# The response includes testUrl — your agent loops:
#   GET  /api/test/<token>  → next attack prompt
#   POST /api/test/<token>  → { "response": "agent reply" }
# Until status: "completed"

# Get results (use your API key)
curl https://www.pwnclaw.com/api/v1/results/<token> \\
  -H "Authorization: Bearer pwn_your_key_here"`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
