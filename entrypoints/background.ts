import { ensureDefaultSettings } from '../utils/storage';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    void ensureDefaultSettings();
  });

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'OPEN_OPTIONS') {
      void browser.runtime.openOptionsPage();
      sendResponse({ ok: true });
      return true;
    }

    return undefined;
  });
});
