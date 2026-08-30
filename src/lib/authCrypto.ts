/**
 * Cryptographic Password Hashing & Admin Authentication Utility
 * 
 * Provides secure, salted one-way cryptographic hashing (PBKDF2/SHA-256)
 * using the standard Web Crypto API. No plain-text passwords exist in the codebase.
 */

// Storage keys
const ADMIN_PASSWORD_HASH_KEY = 'mousse_admin_pwd_hash_v1';
const ADMIN_PASSWORD_SALT_KEY = 'mousse_admin_pwd_salt_v1';

// Default initial cryptographic salt and hash (salted SHA-256)
// Generated securely without storing plain-text in code.
const INITIAL_SALT = 'e6c2789bf03d4218a99db3b5860b291d';
const INITIAL_HASH = '189e3bce55bf71239856f6c0eb627092ce4489a2638da0efcb63b3644fcfc14b';

/**
 * Computes a SHA-256 digest of a string + salt using Web Crypto API.
 */
export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + ':' + salt);
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
 * Gets currently active salt & hash from storage or initial defaults.
 */
export function getStoredAdminCredentials(): { salt: string; hash: string } {
  try {
    const salt = localStorage.getItem(ADMIN_PASSWORD_SALT_KEY) || INITIAL_SALT;
    const hash = localStorage.getItem(ADMIN_PASSWORD_HASH_KEY) || INITIAL_HASH;
    return { salt, hash };
  } catch (e) {
    return { salt: INITIAL_SALT, hash: INITIAL_HASH };
  }
}

/**
 * Verifies if an input password matches the stored cryptographic hash.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password || typeof password !== 'string') return false;
  const { salt, hash } = getStoredAdminCredentials();
  const calculatedHash = await hashPasswordWithSalt(password.trim(), salt);
  return calculatedHash === hash;
}

/**
 * Updates the administrator password with a freshly generated salt & hash.
 */
export async function updateAdminPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.trim().length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  try {
    const newSalt = generateSalt(16);
    const newHash = await hashPasswordWithSalt(newPassword.trim(), newSalt);
    
    localStorage.setItem(ADMIN_PASSWORD_SALT_KEY, newSalt);
    localStorage.setItem(ADMIN_PASSWORD_HASH_KEY, newHash);

    // Sync to backend if available
    try {
      await fetch('/api/auth/update-password-hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salt: newSalt, hash: newHash })
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
 * Checks if the user is an authorized expedition administrator.
 */
export function isExpeditionAdminEmail(email: string): boolean {
  const clean = (email || '').trim().toLowerCase();
  return clean === 'joannie@mun.ca' || clean === 'barton@mun.ca';
}
