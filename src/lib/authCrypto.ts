/**
 * Cryptographic Password Hashing & Admin Authentication Utility
 * 
 * Provides flexible first-time setup and salted one-way cryptographic hashing (SHA-256)
 * using the standard Web Crypto API. No rigid hardcoded passwords lock users out.
 */

// Storage keys
const ADMIN_PASSWORD_HASH_KEY = 'mousse_admin_pwd_hash_v2';
const ADMIN_PASSWORD_SALT_KEY = 'mousse_admin_pwd_salt_v2';
const ADMIN_PASSWORD_CONFIGURED_KEY = 'mousse_admin_pwd_configured_v2';

/**
 * Checks if an administrator password has been explicitly chosen/set.
 */
export function isPasswordConfigured(): boolean {
  try {
    const configured = localStorage.getItem(ADMIN_PASSWORD_CONFIGURED_KEY);
    const hash = localStorage.getItem(ADMIN_PASSWORD_HASH_KEY);
    return Boolean(configured === 'true' && hash);
  } catch (e) {
    return false;
  }
}

/**
 * Normalizes password string by stripping extra spaces.
 */
export function normalizePasswordString(p: string): string {
  return (p || '').trim();
}

/**
 * Computes a SHA-256 digest of a string + salt using Web Crypto API.
 */
export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const normalized = normalizePasswordString(password);
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized + ':' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generates a random cryptographic salt.
 */
export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Gets currently active salt & hash from storage if configured.
 */
export function getStoredAdminCredentials(): { salt: string | null; hash: string | null; isConfigured: boolean } {
  try {
    const isConfigured = isPasswordConfigured();
    const salt = localStorage.getItem(ADMIN_PASSWORD_SALT_KEY);
    const hash = localStorage.getItem(ADMIN_PASSWORD_HASH_KEY);
    return { salt, hash, isConfigured };
  } catch (e) {
    return { salt: null, hash: null, isConfigured: false };
  }
}

/**
 * Verifies if an input password matches the stored cryptographic hash.
 * If no password has been configured yet, returns true.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  // If no password configured yet, allow access
  if (!isPasswordConfigured()) {
    return true;
  }

  if (!password || typeof password !== 'string') return false;
  const { salt, hash } = getStoredAdminCredentials();
  if (!salt || !hash) return true;
  
  const calculatedHash = await hashPasswordWithSalt(password, salt);
  if (calculatedHash === hash) return true;

  // Also test case-insensitive match
  const lowerHash = await hashPasswordWithSalt(password.toLowerCase(), salt);
  if (lowerHash === hash) return true;

  return false;
}

/**
 * Updates or sets the administrator password with a freshly generated salt & hash.
 */
export async function updateAdminPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.trim().length < 4) {
    return { success: false, error: 'Password must be at least 4 characters long.' };
  }

  try {
    const newSalt = generateSalt(16);
    const newHash = await hashPasswordWithSalt(newPassword.trim(), newSalt);
    
    localStorage.setItem(ADMIN_PASSWORD_SALT_KEY, newSalt);
    localStorage.setItem(ADMIN_PASSWORD_HASH_KEY, newHash);
    localStorage.setItem(ADMIN_PASSWORD_CONFIGURED_KEY, 'true');

    // Sync to backend if available
    try {
      await fetch('/api/auth/update-password-hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salt: newSalt, hash: newHash, isConfigured: true })
      });
    } catch (apiErr) {
      // Backend sync is optional on static hosts
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update password.' };
  }
}

/**
 * Clears/Resets the administrator password so the prompt appears again.
 */
export async function clearAdminPassword(): Promise<void> {
  try {
    localStorage.removeItem(ADMIN_PASSWORD_SALT_KEY);
    localStorage.removeItem(ADMIN_PASSWORD_HASH_KEY);
    localStorage.removeItem(ADMIN_PASSWORD_CONFIGURED_KEY);
    
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      // ignore
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Checks if the user is an authorized expedition administrator.
 */
export function isExpeditionAdminEmail(email: string): boolean {
  const clean = (email || '').trim().toLowerCase();
  return clean === 'joannie@mun.ca' || clean === 'barton@mun.ca';
}
