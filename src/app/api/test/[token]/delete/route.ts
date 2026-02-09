import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTestByToken, getUserByClerkId, db } from '@/lib/db';

// DELETE: Remove a test and all its results
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    // Require authentication
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get test
    const test = await getTestByToken(token);
    
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Verify ownership
    if (test.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete test results first (foreign key constraint)
    await db
      .from('test_results')
      .delete()
      .eq('test_id', test.id);

    // Delete test
    await db
      .from('tests')
      .delete()
      .eq('id', test.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Test and all results deleted permanently' 
    });

  } catch (error) {
    console.error('Error in DELETE /api/test/[token]/delete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
