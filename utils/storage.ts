import {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  type ShortcutsSettings,
} from './types';

export async function getSettings(): Promise<ShortcutsSettings> {
  const result = await browser.storage.sync.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY] as ShortcutsSettings | undefined;

  if (!stored) {
    return structuredClone(DEFAULT_SETTINGS);
  }

  return {
    enabled: stored.enabled ?? true,
    shortcuts: Array.isArray(stored.shortcuts) ? stored.shortcuts : [],
  };
}

export async function saveSettings(settings: ShortcutsSettings): Promise<void> {
  await browser.storage.sync.set({ [STORAGE_KEY]: settings });
}

export async function ensureDefaultSettings(): Promise<void> {
  const result = await browser.storage.sync.get(STORAGE_KEY);
  if (!result[STORAGE_KEY]) {
    await saveSettings(structuredClone(DEFAULT_SETTINGS));
  }
}
