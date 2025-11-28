import { User } from 'firebase/auth';

/**
 * Make an authenticated API call with Firebase ID token
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  user: User | null
): Promise<Response> {
  if (!user) {
    throw new Error('User must be authenticated to make this request');
  }

  // Get the Firebase ID token
  const idToken = await user.getIdToken();
  
  // Add authentication header
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Make an authenticated API call and return JSON response
 */
export async function authenticatedFetchJson<T>(
  url: string,
  options: RequestInit = {},
  user: User | null
): Promise<T> {
  const response = await authenticatedFetch(url, options, user);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
