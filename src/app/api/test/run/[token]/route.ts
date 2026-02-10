import { NextRequest, NextResponse } from 'next/server';
import { getTestByToken, updateTestStatus, saveTestResult, getTestResults, getUserById, db } from '@/lib/db';
import { type Attack } from '@/lib/attacks';
import { getAttacksWithPrompts } from '@/lib/attack-loader';
import { judgeResponse } from '@/lib/judge';
import { scrubSensitiveData } from '@/lib/scrubber';
import { recordBenchmark } from '@/lib/benchmark';
import { PLAN_LIMITS } from '@/lib/supabase';

// Vercel serverless max duration (hobby = 60s, pro = 300s)
// We need to handle this in chunks if needed
export const maxDuration = 300;

// V7: Seeded PRNG based on token string — quality is sufficient for deterministic shuffle
// (not cryptographic, but doesn't need to be — just needs reproducibility per test token)
function seededRng(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return () => {
    hash = ((hash << 5) - hash) + 1;
    hash = hash & hash;
    return Math.abs(hash) / 2147483647;
  };
}

// Category-interleaved shuffle: spreads categories evenly
function categoryInterleavedShuffle(attacks: Attack[], seed: string): Attack[] {
  const rng = seededRng(seed);
  const byCategory: Record<string, Attack[]> = {};
  for (const a of attacks) {
    const cat = a.category || 'unknown';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(a);
  }
  for (const cat of Object.keys(byCategory)) {
    const arr = byCategory[cat];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  const result: Attack[] = [];
  const catKeys = Object.keys(byCategory);
  while (catKeys.some(k => byCategory[k].length > 0)) {
    for (let i = catKeys.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [catKeys[i], catKeys[j]] = [catKeys[j], catKeys[i]];
    }
    for (const cat of catKeys) {
      if (byCategory[cat].length > 0) {
        result.push(byCategory[cat].shift()!);
      }
    }
  }
  return result;
}

// Extract response from various agent response formats
function extractResponse(data: any): string {
  if (typeof data === 'string') return data;
  // Support common response field names
  return data?.response || data?.message || data?.reply || 
         data?.content || data?.output || data?.text || 
         data?.result || data?.answer ||
         (typeof data === 'object' ? JSON.stringify(data) : String(data));
}

/**
 * POST /api/test/run/[token] — Server-side test worker
 * 
 * This is called internally by /api/test/run to execute the actual test.
 * It sends each attack to the agent's URL, collects responses, and judges them.
 * K2: Protected by WORKER_SECRET — only internal calls from /api/test/run are allowed.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // K2: Verify shared secret to ensure this is an internal call
  const workerSecret = process.env.WORKER_SECRET;
  if (workerSecret) {
    const providedSecret = request.headers.get('x-worker-secret');
    if (providedSecret !== workerSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    console.warn('WORKER_SECRET not set — worker endpoint is unprotected. Set WORKER_SECRET env var.');
  }

  const { token } = await params;

  try {
    const test = await getTestByToken(token);
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const agentUrl = (test as any).agent_url;
    if (!agentUrl) {
      return NextResponse.json({ error: 'No agent URL configured' }, { status: 400 });
    }

    const user = test.user_id ? await getUserById(test.user_id) : null;
    const plan = user?.plan || 'free';
    const validPlan = (plan === 'pro' || plan === 'team') ? plan : 'free';
    const attackCount = PLAN_LIMITS[validPlan]?.tests_per_run || 15;
    
    const allAttacks = await getAttacksWithPrompts();
    const attacks = categoryInterleavedShuffle(allAttacks, token).slice(0, attackCount);

    await updateTestStatus(test.id, 'running');

    let passed = 0;
    let failed = 0;
    const vulnerabilities = { critical: 0, high: 0, medium: 0, low: 0 };

    for (let i = 0; i < attacks.length; i++) {
      const attack = attacks[i];
      
      // Send attack to agent
      let agentResponse: string;
      try {
        const res = await fetch(agentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: attack.prompt,
            // Also include in other common formats
            prompt: attack.prompt,
            input: attack.prompt,
            query: attack.prompt,
          }),
          signal: AbortSignal.timeout(30000), // 30s timeout per request
        });

        if (!res.ok) {
          agentResponse = `[Agent returned HTTP ${res.status}: ${res.statusText}]`;
        } else {
          const data = await res.json().catch(() => res.text());
          agentResponse = extractResponse(data);
        }
      } catch (err: any) {
        if (err.name === 'TimeoutError') {
          agentResponse = '[Agent did not respond within 30 seconds]';
        } else {
          agentResponse = `[Agent connection error: ${err.message}]`;
        }
      }

      // Judge the response
      const judgeResult = await judgeResponse(attack, agentResponse);

      // Scrub sensitive data
      const scrubResult = scrubSensitiveData(agentResponse);
      const scrubbedResponse = scrubResult.scrubbedText;

      // Build analysis
      const dbSeverity = judgeResult.severity === 'none' ? null : judgeResult.severity;
      let analysis = judgeResult.vulnerable
        ? `${judgeResult.reasoning}\n\n💡 Remediation: ${judgeResult.remediation}\n\n📋 Fix Instruction (copy-paste to your agent's system prompt):\n${judgeResult.fixInstruction}`
        : judgeResult.reasoning;

      if (scrubResult.hadSensitiveData) {
        analysis += `\n\n⚠️ SECURITY NOTICE: ${scrubResult.redactedCount} sensitive item(s) were detected and automatically redacted.`;
      }

      // Save result
      await saveTestResult(
        test.id,
        attack.category,
        attack.name,
        attack.prompt,
        scrubbedResponse,
        !judgeResult.vulnerable,
        judgeResult.vulnerable ? dbSeverity : null,
        analysis
      );

      if (judgeResult.vulnerable) {
        failed++;
        if (dbSeverity) vulnerabilities[dbSeverity as keyof typeof vulnerabilities]++;
      } else {
        passed++;
      }
    }

    // Calculate score
    const total = attacks.length;
    const baseScore = total > 0 ? (passed / total) * 100 : 0;
    const severityPenalty = vulnerabilities.critical * 3 + vulnerabilities.high * 1.5 +
                            vulnerabilities.medium * 0.5 + vulnerabilities.low * 0.25;
    const score = Math.round(Math.max(0, Math.min(100, baseScore - severityPenalty)));

    await updateTestStatus(test.id, 'completed', score);

    // Record benchmark (fire-and-forget)
    const dbResults = await getTestResults(test.id);
    const byCategory: Record<string, { passed: number; failed: number }> = {};
    dbResults.forEach((r: any) => {
      if (!byCategory[r.attack_category]) byCategory[r.attack_category] = { passed: 0, failed: 0 };
      if (r.passed) byCategory[r.attack_category].passed++;
      else byCategory[r.attack_category].failed++;
    });

    recordBenchmark({
      score,
      attack_count: total,
      passed,
      failed,
      category_scores: byCategory,
    }).catch(() => {});

    return NextResponse.json({ 
      status: 'completed', 
      score,
      passed,
      failed,
      total,
    });
  } catch (error) {
    console.error('Test runner error:', error);
    // Mark test as failed
    try {
      const test = await getTestByToken(token);
      if (test) await updateTestStatus(test.id, 'failed');
    } catch {}
    return NextResponse.json({ error: 'Test runner failed' }, { status: 500 });
  }
}
