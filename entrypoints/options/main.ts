import { getSettings, saveSettings } from '../../utils/storage';
import type { Shortcut } from '../../utils/types';

const enabledInput = document.querySelector<HTMLInputElement>('#enabled')!;
const shortcutList = document.querySelector<HTMLUListElement>('#shortcut-list')!;
const emptyState = document.querySelector<HTMLParagraphElement>('#empty-state')!;
const template = document.querySelector<HTMLTemplateElement>('#shortcut-item-template')!;
const statusEl = document.querySelector<HTMLSpanElement>('#status')!;

function createId(): string {
  return crypto.randomUUID();
}

function readShortcutFromItem(item: HTMLLIElement): Shortcut {
  return {
    id: item.dataset.id ?? createId(),
    label: item.querySelector<HTMLInputElement>('.field-label')!.value.trim(),
    url: item.querySelector<HTMLInputElement>('.field-url')!.value.trim(),
    openInNewTab: item.querySelector<HTMLInputElement>('.field-new-tab')!.checked,
  };
}

function createShortcutItem(shortcut: Shortcut): HTMLLIElement {
  const fragment = template.content.cloneNode(true) as DocumentFragment;
  const item = fragment.querySelector('li') as HTMLLIElement;
  item.dataset.id = shortcut.id;
  item.querySelector<HTMLInputElement>('.field-label')!.value = shortcut.label;
  item.querySelector<HTMLInputElement>('.field-url')!.value = shortcut.url;
  item.querySelector<HTMLInputElement>('.field-new-tab')!.checked =
    shortcut.openInNewTab;

  item.querySelector('.move-up')?.addEventListener('click', () => {
    const previous = item.previousElementSibling;
    if (previous) {
      shortcutList.insertBefore(item, previous);
      updateEmptyState();
    }
  });

  item.querySelector('.move-down')?.addEventListener('click', () => {
    const next = item.nextElementSibling;
    if (next) {
      shortcutList.insertBefore(next, item);
      updateEmptyState();
    }
  });

  item.querySelector('.remove')?.addEventListener('click', () => {
    item.remove();
    updateEmptyState();
  });

  return item;
}

function updateEmptyState(): void {
  const hasItems = shortcutList.children.length > 0;
  emptyState.classList.toggle('hidden', hasItems);
}

function readForm(): { enabled: boolean; shortcuts: Shortcut[] } {
  const shortcuts = Array.from(shortcutList.children).map((child) =>
    readShortcutFromItem(child as HTMLLIElement),
  );

  return {
    enabled: enabledInput.checked,
    shortcuts,
  };
}

function showStatus(message: string): void {
  statusEl.textContent = message;
  window.setTimeout(() => {
    if (statusEl.textContent === message) {
      statusEl.textContent = '';
    }
  }, 2500);
}

async function loadSettings(): Promise<void> {
  const settings = await getSettings();
  enabledInput.checked = settings.enabled;
  shortcutList.replaceChildren();

  for (const shortcut of settings.shortcuts) {
    shortcutList.appendChild(createShortcutItem(shortcut));
  }

  updateEmptyState();
}

async function saveForm(): Promise<void> {
  const form = readForm();
  const invalid = form.shortcuts.find(
    (shortcut) => !shortcut.label || !shortcut.url,
  );

  if (invalid) {
    showStatus('Each shortcut needs a label and URL.');
    return;
  }

  await saveSettings(form);
  showStatus('Saved. Changes sync to open NetSuite tabs automatically.');
}

document.querySelector('#add-shortcut')?.addEventListener('click', () => {
  shortcutList.appendChild(
    createShortcutItem({
      id: createId(),
      label: '',
      url: '',
      openInNewTab: false,
    }),
  );
  updateEmptyState();
});

document.querySelector('#save')?.addEventListener('click', () => {
  void saveForm();
});

void loadSettings();
