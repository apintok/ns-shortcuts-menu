import { getSettings, saveSettings } from '../../utils/storage';

const enabledInput = document.querySelector<HTMLInputElement>('#enabled')!;

async function loadSettings(): Promise<void> {
  const settings = await getSettings();
  enabledInput.checked = settings.enabled;
}

enabledInput.addEventListener('change', () => {
  void getSettings().then(async (settings) => {
    await saveSettings({ ...settings, enabled: enabledInput.checked });
  });
});

document.querySelector('#open-options')?.addEventListener('click', () => {
  void browser.runtime.openOptionsPage();
});

void loadSettings();
