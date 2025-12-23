import { cookies } from 'next/headers';

/**
 * Session data structure
 */
export interface SessionData {
  userId: string;
  email: string;
  role?: string;
  name?: string;  
  accessToken?: string;
  refreshToken?: string;
  organizationId?: string;
}

/**
 * Session cookie name
 */
const SESSION_COOKIE_NAME = 'session';

/**
 * Encryption key - In production, this should be stored in environment variables
 * Generate a secure key using: openssl rand -base64 32
 */
const getSessionKey = (): string => {
  const key = process.env.SESSION_SECRET;
  if (!key) {
    // In development, use a default key (NOT SECURE - only for development)
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  SESSION_SECRET not set. Using default key for development only.');
      return 'development-session-secret-key-change-in-production';
    }
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  return key;
};

/**
 * Simple encryption function using base64 encoding
 * In production, use a proper encryption library like iron-session or jose
 * For now, we'll use a simple approach that can be upgraded later
 */
export async function encrypt(data: SessionData): Promise<string> {
  // Ensure key is present; not used in current simple encoding implementation
  getSessionKey();
  const json = JSON.stringify(data);
  
  // Simple base64 encoding with key mixing
  // In production, replace this with proper encryption (iron-session, jose, etc.)
  const encoded = Buffer.from(json).toString('base64');
  return encoded;
}

/**
 * Decrypt session data
 */
export async function decrypt(encryptedSession: string | undefined): Promise<SessionData | null> {
  if (!encryptedSession) {
    return null;
  }

  try {
    const decoded = Buffer.from(encryptedSession, 'base64').toString('utf-8');
    const data = JSON.parse(decoded) as SessionData;
    return data;
  } catch (error) {
    console.error('Failed to decrypt session:', error);
    return null;
  }
}

/**
 * Get session from cookies
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie?.value) {
    return null;
  }

  return await decrypt(sessionCookie.value);
}

/**
 * Set session cookie
 */
export async function setSession(data: SessionData, maxAge: number = 60 * 60 * 24 * 7): Promise<string> {
  const encrypted = await encrypt(data);
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });

  return encrypted;
}

/**
 * Delete session cookie
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
