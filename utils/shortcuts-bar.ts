import type { Shortcut, ShortcutsSettings } from './types';

const SHADOW_STYLES = `
  :host {
    display: block;
    width: 100%;
    box-sizing: border-box;
    font-family: "Oracle Sans", "Helvetica Neue", Arial, sans-serif;
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 32px;
    padding: 4px 16px;
    background: #f7f9fc;
    border-bottom: 1px solid #d9dfe8;
    box-sizing: border-box;
  }

  .label {
    flex: 0 0 auto;
    font-size: 12px;
    font-weight: 600;
    color: #4a5568;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .links {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1 1 auto;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .links::-webkit-scrollbar {
    height: 6px;
  }

  .link {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.2;
    color: #0067c5;
    text-decoration: none;
    white-space: nowrap;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
  }

  .link:hover,
  .link:focus-visible {
    background: #e8f2fb;
    border-color: #b8d9f3;
    outline: none;
  }

  .empty {
    font-size: 13px;
    color: #6b7280;
    font-style: italic;
  }

  .settings-link {
    flex: 0 0 auto;
    margin-left: auto;
    font-size: 12px;
    color: #4a5568;
    text-decoration: none;
    white-space: nowrap;
  }

  .settings-link:hover,
  .settings-link:focus-visible {
    color: #0067c5;
    text-decoration: underline;
    outline: none;
  }
`;

function resolveUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return window.location.href;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `${window.location.origin}${trimmed}`;
  }

  return `${window.location.origin}/${trimmed}`;
}

export class ShortcutsBar {
  private host: HTMLElement;
  private shadow: ShadowRoot;
  private linksContainer: HTMLElement;

  constructor(host: HTMLElement) {
    this.host = host;
    this.shadow = host.attachShadow({ mode: 'closed' });
    this.shadow.innerHTML = `
      <style>${SHADOW_STYLES}</style>
      <div class="bar" role="navigation" aria-label="NetSuite shortcuts">
        <span class="label">Shortcuts</span>
        <div class="links"></div>
        <a class="settings-link" href="#">Manage</a>
      </div>
    `;

    this.linksContainer = this.shadow.querySelector('.links')!;
    const settingsLink = this.shadow.querySelector('.settings-link') as HTMLAnchorElement;
    settingsLink.addEventListener('click', (event) => {
      event.preventDefault();
      void browser.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
    });
  }

  render(settings: ShortcutsSettings): void {
    this.host.style.display = settings.enabled ? 'block' : 'none';
    this.linksContainer.replaceChildren();

    if (settings.shortcuts.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'empty';
      empty.textContent = 'No shortcuts configured yet.';
      this.linksContainer.appendChild(empty);
      return;
    }

    for (const shortcut of settings.shortcuts) {
      this.linksContainer.appendChild(this.createLink(shortcut));
    }
  }

  private createLink(shortcut: Shortcut): HTMLAnchorElement {
    const link = document.createElement('a');
    link.className = 'link';
    link.textContent = shortcut.label;
    link.href = resolveUrl(shortcut.url);
    link.title = shortcut.url;

    if (shortcut.openInNewTab) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    link.addEventListener('click', (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      const destination = resolveUrl(shortcut.url);

      if (shortcut.openInNewTab) {
        window.open(destination, '_blank', 'noopener,noreferrer');
      } else {
        window.location.assign(destination);
      }
    });

    return link;
  }

  destroy(): void {
    this.host.remove();
  }
}
