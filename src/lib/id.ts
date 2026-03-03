export function sanitizeId(raw?: string | null): string | null {
  if (!raw) return null;
  let v = String(raw).trim();

  // Try to normalize common bad serializations up to a few passes.
  for (let i = 0; i < 4; i++) {
    // Wrapped quotes: "abc" or 'abc'
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1).trim();
      continue;
    }

    // JSON-encoded string or object, e.g. "\"abc\"" or {"id":"abc"}
    if ((v.startsWith('{') && v.endsWith('}')) || (v.startsWith('[') && v.endsWith(']')) || (v.startsWith('"') && v.endsWith('"'))) {
      try {
        const parsed = JSON.parse(v);
        if (typeof parsed === 'string') {
          v = parsed.trim();
          continue;
        }
        if (parsed && typeof parsed === 'object') {
          const maybeId = (parsed as any).id ?? (parsed as any)._id ?? (parsed as any).value;
          if (typeof maybeId === 'string') {
            v = maybeId.trim();
            continue;
          }
        }
      } catch {
        // ignore JSON parse failures and continue normalization
      }
    }

    break;
  }

  // Handle trailing slash from copied URLs
  v = v.replace(/\/+$/, '').trim();

  return v || null;
}

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('userId');
  const clean = sanitizeId(raw);

  // Self-heal localStorage if it had a malformed serialized value.
  if (clean && raw !== clean) {
    localStorage.setItem('userId', clean);
  }

  return clean;
}
