import { getOrCreateHost, isNetSuitePage, waitForNavigationAnchor } from '../utils/netsuite-dom';
import { getSettings } from '../utils/storage';
import { ShortcutsBar } from '../utils/shortcuts-bar';

export default defineContentScript({
  matches: ['*://*.netsuite.com/*', '*://*.app.netsuite.com/*'],
  runAt: 'document_idle',
  main() {
    if (!isNetSuitePage()) {
      return;
    }

    let bar: ShortcutsBar | null = null;
    let host: HTMLElement | null = null;

    const mount = async () => {
      const settings = await getSettings();
      if (!settings.enabled && bar) {
        bar.render(settings);
        return;
      }

      const anchor = await waitForNavigationAnchor();
      if (!anchor) {
        return;
      }

      host = getOrCreateHost(anchor);
      bar ??= new ShortcutsBar(host);
      bar.render(settings);
    };

    void mount();

    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync' || !changes.nsShortcutsMenuSettings) {
        return;
      }

      void mount();
    });

    browser.runtime.onMessage.addListener((message) => {
      if (message?.type === 'REFRESH_SHORTCUTS') {
        void mount();
      }
    });
  },
});
