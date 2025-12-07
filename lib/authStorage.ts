// lib/authStorage.ts
// localStorage utilities for authentication token and user data persistence

const AUTH_TOKEN_KEY = 'alma-auth-token';
const AUTH_USER_KEY = 'alma-auth-user';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  providerId?: string;
}

interface AuthSession {
  token: string;
  user: UserData;
}

/**
 * Save authentication token to localStorage
 * @param token - JWT token from backend
 */
export function saveAuthToken(token: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error saving auth token to localStorage:', error);
  }
}

/**
 * Load authentication token from localStorage
 * @returns token string or null if not found
 */
export function loadAuthToken(): string | null {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  } catch (error) {
    console.error('Error loading auth token from localStorage:', error);
    return null;
  }
}

/**
 * Save user data to localStorage
 * @param user - User object with id, email, name, etc.
 */
export function saveUser(user: UserData): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error saving user data to localStorage:', error);
  }
}

/**
 * Load user data from localStorage
 * @returns UserData object or null if not found/invalid
 */
export function loadUser(): UserData | null {
  try {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem(AUTH_USER_KEY);
      if (!userJson) return null;

      const user = JSON.parse(userJson) as UserData;

      // Validate that user has required fields
      if (!user.uid || !user.email) {
        console.warn('Invalid user data in localStorage, clearing...');
        clearAuthStorage();
        return null;
      }

      return user;
    }
    return null;
  } catch (error) {
    console.error('Error loading user data from localStorage:', error);
    return null;
  }
}

/**
 * Load complete auth session (token + user) from localStorage
 * @returns AuthSession object or null if either token or user is missing
 */
export function loadAuthSession(): AuthSession | null {
  try {
    const token = loadAuthToken();
    const user = loadUser();

    if (!token || !user) {
      return null;
    }

    return { token, user };
  } catch (error) {
    console.error('Error loading auth session from localStorage:', error);
    return null;
  }
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthStorage(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (error) {
    console.error('Error clearing auth data from localStorage:', error);
  }
}

/**
 * Check if authentication token exists in localStorage
 * @returns true if token exists, false otherwise
 */
export function hasAuthToken(): boolean {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
    }
    return false;
  } catch (error) {
    console.error('Error checking auth token in localStorage:', error);
    return false;
  }
}
