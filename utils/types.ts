export interface Shortcut {
  id: string;
  label: string;
  url: string;
  openInNewTab: boolean;
}

export interface ShortcutsSettings {
  enabled: boolean;
  shortcuts: Shortcut[];
}

export const STORAGE_KEY = 'nsShortcutsMenuSettings';

export const DEFAULT_SETTINGS: ShortcutsSettings = {
  enabled: true,
  shortcuts: [
    {
      id: crypto.randomUUID(),
      label: 'Home',
      url: '/app/center/card.nl',
      openInNewTab: false,
    },
    {
      id: crypto.randomUUID(),
      label: 'Saved Searches',
      url: '/app/common/search/search.nl?searchtype=Search',
      openInNewTab: false,
    },
  ],
};
