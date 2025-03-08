import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return {
      authenticated: false,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    };
  }
  
  return {
    authenticated: true,
    session
  };
}