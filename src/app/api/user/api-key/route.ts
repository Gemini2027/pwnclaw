import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, generateApiKey, revokeApiKey } from '@/lib/db';

// GET — return current API key (masked)
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ apiKey: null });

  return NextResponse.json({
    apiKey: user.api_key ? maskKey(user.api_key) : null,
    hasKey: !!user.api_key,
  });
}

// POST — generate new API key (Team plan only)
export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (user.plan !== 'team') {
    return NextResponse.json({ error: 'API keys are available on the Team plan. Upgrade to access CI/CD integration.' }, { status: 403 });
  }

  const key = await generateApiKey(user.id);
  if (!key) return NextResponse.json({ error: 'Failed to generate key' }, { status: 500 });

  // Return the FULL key only on creation — never again
  return NextResponse.json({ apiKey: key, warning: 'Save this key — it won\'t be shown again in full.' });
}

// DELETE — revoke API key
export async function DELETE() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await revokeApiKey(user.id);
  return NextResponse.json({ success: true });
}

function maskKey(key: string): string {
  if (key.length <= 8) return '****';
  return key.slice(0, 8) + '•'.repeat(key.length - 12) + key.slice(-4);
}
