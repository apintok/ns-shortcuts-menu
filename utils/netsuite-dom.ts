const HOST_ID = 'ns-shortcuts-menu-root';

const NAV_MENU_SELECTORS = [
  '[data-automation-id="NavigationMenu"]',
  '[data-automation-id*="NavigationMenu"]',
  '[data-automation-id*="navigation-menu"]',
  '#div__nav',
  '[id^="div__nav"]',
  '.ns-nav',
  '#uir-header-menu',
  '[id^="uir-header-menu"]',
];

const HEADER_SELECTORS = [
  '#div__header',
  '[data-automation-id="Header"]',
  '[data-automation-id*="Header"]',
  'header',
];

const ACTION_BUTTON_MARKERS = [
  '#submitter',
  '#tbl_submit',
  '#tdbody_submitter',
  'input[name="submitter"]',
  '#cancel',
  '#tbl_cancel',
  '[id^="tbl_secondary"]',
];

export function isNetSuitePage(): boolean {
  return /(^|\.)netsuite\.com$/i.test(window.location.hostname);
}

export function isEditModePage(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('e') === 'T';
}

function isActionButtonBar(element: HTMLElement): boolean {
  if (element.classList.contains('uir-header-buttons')) {
    return true;
  }

  if (element.closest('.uir-header-buttons')) {
    return true;
  }

  return ACTION_BUTTON_MARKERS.some((selector) =>
    element.querySelector(selector),
  );
}

function queryNavigationMenu(root: ParentNode): HTMLElement | null {
  for (const selector of NAV_MENU_SELECTORS) {
    const element = root.querySelector(selector);
    if (element instanceof HTMLElement && !isActionButtonBar(element)) {
      return element;
    }
  }

  return null;
}

function findHeaderElement(): HTMLElement | null {
  for (const selector of HEADER_SELECTORS) {
    const header = document.querySelector(selector);
    if (header instanceof HTMLElement) {
      return header;
    }
  }

  return null;
}

export function findNavigationAnchor(): HTMLElement | null {
  const header = findHeaderElement();
  if (header) {
    const navInHeader = queryNavigationMenu(header);
    if (navInHeader) {
      return navInHeader;
    }
  }

  for (const selector of NAV_MENU_SELECTORS) {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement && !isActionButtonBar(element)) {
      return element;
    }
  }

  if (header) {
    const nav = header.querySelector(
      '[role="navigation"], [class*="nav-menu"], [class*="NavMenu"]',
    );
    if (nav instanceof HTMLElement && !isActionButtonBar(nav)) {
      return nav;
    }
  }

  return null;
}

function getNavigationRow(anchor: HTMLElement): HTMLElement {
  const rowLike = anchor.closest(
    'tr, [data-automation-id="HeaderRow"], [class*="header-row"], [class*="HeaderRow"]',
  );

  if (rowLike instanceof HTMLElement && !isActionButtonBar(rowLike)) {
    return rowLike;
  }

  return anchor;
}

function getInsertionPoint(anchor: HTMLElement): {
  parent: ParentNode;
  before: Node | null;
} {
  const navRow = getNavigationRow(anchor);
  const parent = navRow.parentNode;

  if (!parent) {
    return { parent: document.body, before: null };
  }

  let before: Node | null = navRow.nextSibling;

  // On edit pages, keep the shortcuts bar above Save/Cancel even if the
  // navigation anchor resolves to a shared container with the button row.
  const header = findHeaderElement();
  const buttonBar = header?.querySelector('.uir-header-buttons');

  if (buttonBar instanceof HTMLElement) {
    const buttonRow = buttonBar.closest('tr') ?? buttonBar;
    const navFollowsButtons =
      navRow.compareDocumentPosition(buttonRow) &
      Node.DOCUMENT_POSITION_PRECEDING;

    if (navFollowsButtons) {
      before = buttonRow;
    } else if (
      navRow !== buttonRow &&
      navRow.compareDocumentPosition(buttonRow) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      before = buttonRow;
    }
  }

  return { parent, before };
}

export function getOrCreateHost(anchor: HTMLElement): HTMLElement {
  let host = document.getElementById(HOST_ID);

  if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
    host.setAttribute('data-ns-shortcuts-menu', 'true');
  }

  if (!isHostCorrectlyPlaced(host, anchor)) {
    const { parent, before } = getInsertionPoint(anchor);
    parent.insertBefore(host, before);
  }

  return host;
}

function isHostCorrectlyPlaced(host: HTMLElement, anchor: HTMLElement): boolean {
  const { parent, before } = getInsertionPoint(anchor);
  return host.parentNode === parent && host.nextSibling === before;
}

export function repositionHostIfNeeded(): boolean {
  const anchor = findNavigationAnchor();
  if (!anchor) {
    return false;
  }

  const host = document.getElementById(HOST_ID);
  if (!host) {
    return false;
  }

  if (isHostCorrectlyPlaced(host, anchor)) {
    return false;
  }

  getOrCreateHost(anchor);
  return true;
}

export function watchHostPlacement(): () => void {
  let frame = 0;

  const scheduleCheck = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      repositionHostIfNeeded();
    });
  };

  const observer = new MutationObserver(scheduleCheck);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  return () => {
    window.cancelAnimationFrame(frame);
    observer.disconnect();
  };
}

export function waitForNavigationAnchor(
  timeoutMs = 30_000,
): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const tryResolve = (): HTMLElement | null => {
      const anchor = findNavigationAnchor();
      if (!anchor) {
        return null;
      }

      const host = document.getElementById(HOST_ID);
      if (host && !isHostCorrectlyPlaced(host, anchor)) {
        getOrCreateHost(anchor);
      }

      return anchor;
    };

    const existing = tryResolve();
    if (existing) {
      resolve(existing);
      return;
    }

    const deadline = Date.now() + timeoutMs;
    const observer = new MutationObserver(() => {
      const anchor = tryResolve();
      if (anchor) {
        observer.disconnect();
        resolve(anchor);
      } else if (Date.now() >= deadline) {
        observer.disconnect();
        resolve(null);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    window.setTimeout(() => {
      observer.disconnect();
      resolve(tryResolve());
    }, timeoutMs);
  });
}
