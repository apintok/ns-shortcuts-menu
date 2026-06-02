import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'NetSuite Shortcuts Menu',
    description:
      'A customizable shortcuts menu for NetSuite, displayed below the Navigation Centre menu on every page.',
    permissions: ['storage'],
    host_permissions: [
      'https://*.netsuite.com/*',
      'https://*.app.netsuite.com/*',
    ],
    action: {
      default_title: 'NetSuite Shortcuts Menu',
      default_popup: 'popup.html',
    },
    icons: {
      128: 'icon/128.svg',
    },
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
  },
});
