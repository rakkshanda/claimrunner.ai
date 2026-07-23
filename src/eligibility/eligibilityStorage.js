// Transient local storage for the eligibility form result.
// Lifecycle: written on submit, auto-expires after TTL_MS (checked on every
// read), and cleared explicitly on successful signup. The server-side
// eligibility_forms row is unaffected — only this local copy is transient.

const STORAGE_KEY = 'claimrunner_eligibility';
export const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Save { formId, answers, prefill, eligible } with a timestamp. */
export function saveEligibility({ formId, answers, prefill, eligible }) {
  try {
    const payload = { formId, answers, prefill, eligible, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('[eligibilityStorage] Failed to save:', err);
  }
}

/** Returns the stored payload, or null if absent or expired (expired → deleted). */
export function loadEligibility() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload?.savedAt || Date.now() - payload.savedAt > TTL_MS) {
      clearEligibility();
      return null;
    }
    return payload;
  } catch (err) {
    console.error('[eligibilityStorage] Failed to load:', err);
    return null;
  }
}

export function clearEligibility() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[eligibilityStorage] Failed to clear:', err);
  }
}

/**
 * Schedule a live expiry: calls onExpire and clears storage once the current
 * payload passes its TTL while the page is open. Returns a cancel function.
 */
export function scheduleEligibilityExpiry(onExpire) {
  const payload = loadEligibility();
  if (!payload) return () => {};
  const remaining = payload.savedAt + TTL_MS - Date.now();
  if (remaining <= 0) {
    clearEligibility();
    onExpire?.();
    return () => {};
  }
  const timer = setTimeout(() => {
    clearEligibility();
    onExpire?.();
  }, remaining);
  return () => clearTimeout(timer);
}
