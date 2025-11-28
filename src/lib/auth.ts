import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from './firebase-admin';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role?: 'admin' | 'user';
}

export class AuthError extends Error {
  constructor(message: string, public code: string = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Verify Firebase ID token and return authenticated user
 */
export async function verifyIdToken(idToken: string): Promise<AuthenticatedUser> {
  try {
    const auth = getAuth(getAdminApp());
    const decodedToken = await auth.verifyIdToken(idToken);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.admin ? 'admin' : 'user'
    };
  } catch (_error) {
    throw new AuthError('Invalid or expired token', 'INVALID_TOKEN');
  }
}

/**
 * Extract and verify authentication token from request headers
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    throw new AuthError('Missing authorization header', 'NO_AUTH_HEADER');
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token || token === authHeader) {
    throw new AuthError('Invalid authorization format. Use: Bearer <token>', 'INVALID_AUTH_FORMAT');
  }

  return await verifyIdToken(token);
}

/**
 * Verify user has admin role
 */
export function requireAdmin(user: AuthenticatedUser): void {
  if (user.role !== 'admin') {
    throw new AuthError('Admin access required', 'INSUFFICIENT_PERMISSIONS');
  }
}

/**
 * API route wrapper that ensures authentication
 */
export function withAuth<T extends unknown[]>(
  handler: (request: NextRequest, user: AuthenticatedUser, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      const user = await authenticateRequest(request);
      return await handler(request, user, ...args);
    } catch (error) {
      if (error instanceof AuthError) {
        return Response.json(
          {
            success: false,
            error: 'Authentication failed',
            code: error.code
          },
          { status: 401 }
        );
      }

      console.error('Unexpected authentication error:', error);
      return Response.json(
        {
          success: false,
          error: 'Internal server error'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * API route wrapper that ensures admin authentication
 */
export function withAdminAuth<T extends unknown[]>(
  handler: (request: NextRequest, user: AuthenticatedUser, ...args: T) => Promise<Response>
) {
  return withAuth(async (request: NextRequest, user: AuthenticatedUser, ...args: T) => {
    requireAdmin(user);
    return await handler(request, user, ...args);
  });
}