import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/utils/requireAuth';
import prisma from '@/app/libs/prismadb';

export async function GET() {
  // Check if user is authenticated
  const authResult = await requireAuth();
  if (!authResult.authenticated) {
    return authResult.response;
  }

  // Get user email from session
  // Add null checks to ensure session and user properties exist
  if (!authResult.session) {
    return NextResponse.json({ error: 'User session not found' }, { status: 401 });
  }

  if (!authResult.session.user) {
    return NextResponse.json({ error: 'User data not found in session' }, { status: 401 });
  }

  const userEmail = authResult.session.user.email;
  
  // Check if email exists and is a string
  if (!userEmail) {
    return NextResponse.json({ error: 'User email not found in session' }, { status: 401 });
  }

  try {
    // Fetch user data from database
    const userData = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data
    return NextResponse.json({
      user: {
        ...userData,
        createdAt: userData.createdAt.toISOString(),
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}