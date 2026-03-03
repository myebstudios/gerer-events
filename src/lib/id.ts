export function sanitizeId(raw?: string | null): string | null {
  if (!raw) return null;
  let v = String(raw).trim();

  // Handle accidentally stringified ids: "abc123"
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }

  // Handle trailing slash from copied URLs
  v = v.replace(/\/+$/, '');

  return v || null;
}

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return sanitizeId(localStorage.getItem('userId'));
}
