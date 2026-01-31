const DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface StorageItem<T> {
  value: T;
  expiry: number;
}

export function saveWithExpiry<T>(key: string, value: T, expiryMs: number = DEFAULT_EXPIRY_MS): void {
  const item: StorageItem<T> = {
    value,
    expiry: Date.now() + expiryMs,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function loadWithExpiry<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const item: StorageItem<T> = JSON.parse(raw);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch {
    return null;
  }
}

export function clearQuestionnaireStorage(): void {
  localStorage.removeItem('focus-tracker-onboarding');
  localStorage.removeItem('questionnaire-data');
  localStorage.removeItem('big-rocks-order');
}
