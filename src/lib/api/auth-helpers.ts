import { NextRequest, NextResponse } from 'next/server';
import { getSession, SessionData } from './session';

/**
 * Helper function to get session from request (for API routes)
 * This can be used in API routes that need authentication
 */
export async function getSessionFromRequest(): Promise<SessionData | null> {
  return await getSession();
}

/**
 * Helper function to require authentication in API routes
 * Returns the session if authenticated, otherwise returns null
 */
export async function requireAuth(): Promise<SessionData | null> {
  const session = await getSession();
  return session;
}

/**
 * Wrapper for protected API routes
 * Use this to protect API routes that require authentication
 */
export async function withAuth(
  handler: (req: NextRequest, session: SessionData) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(req, session);
  };
}

/**
 * Wrapper for API routes that require admin role
 */
export async function withAdminAuth(
  handler: (req: NextRequest, session: SessionData) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    return handler(req, session);
  };
}
