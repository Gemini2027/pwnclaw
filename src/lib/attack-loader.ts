// Loads attack prompts from Supabase at runtime.
// The public attacks.ts has redacted prompts — real prompts live only in DB.
import { db } from './db';
import { ATTACKS, type Attack } from './attacks';

let cachedAttacks: Attack[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 min (attacks change rarely)

/**
 * Returns the full attack library with real prompts from Supabase.
 * Falls back to static attacks.ts if DB is unavailable.
 */
export async function getAttacksWithPrompts(): Promise<Attack[]> {
  const now = Date.now();
  if (cachedAttacks && now - cacheTime < CACHE_TTL) {
    return cachedAttacks;
  }

  try {
    const { data, error } = await db
      .from('attack_prompts')
      .select('id, prompt, success_indicators');

    if (error || !data || data.length === 0) {
      console.warn('Failed to load attack prompts from DB, using static fallback:', error?.message);
      return ATTACKS;
    }

    const promptMap = new Map(
      data.map((d: { id: string; prompt: string; success_indicators: string[] }) => [
        d.id,
        { prompt: d.prompt, successIndicators: d.success_indicators }
      ])
    );

    cachedAttacks = ATTACKS.map(a => ({
      ...a,
      prompt: promptMap.get(a.id)?.prompt || a.prompt,
      successIndicators: promptMap.get(a.id)?.successIndicators || a.successIndicators,
    }));
    cacheTime = now;

    return cachedAttacks;
  } catch (err) {
    console.error('Attack loader error:', err);
    return ATTACKS;
  }
}
