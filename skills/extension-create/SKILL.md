---
name: extension-create
description: "Auto-scaffold Chrome extensions with WXT. Ask user for name/features, run npx wxt init, configure entrypoints. Use when: create extension, scaffold, new extension, wxt."
---

# Extension Create (WXT Scaffolder)

Auto-scaffold a Chrome extension project. Do NOT just explain — execute the workflow.

## Workflow (Execute This)

### Step 1: Gather requirements from user

Ask the user to confirm:
1. **Extension name** (kebab-case, e.g. `my-tab-manager`)
2. **Short description** (1 sentence)
3. **Framework**: React / Vue / Svelte / Vanilla (default: React)
4. **Package manager**: npm / pnpm / yarn / bun (default: pnpm)
5. **Features needed** (pick from list below):
   - Popup UI
   - Content script (modify pages)
   - Background service worker
   - Side panel
   - Options page
   - Context menu
   - Tab management (`tabs` permission)
   - Storage (`storage` permission)
   - Active tab only (`activeTab`)

### Step 2: Scaffold with WXT

```bash
npx wxt@latest init <extension-name> --template <framework>
cd <extension-name>
pnpm install   # or npm/yarn/bun
```

Templates: `react` | `vue` | `svelte` | `solid` | `vanilla`

### Step 3: Configure based on features

Edit `wxt.config.ts` with required permissions and manifest fields.

### Step 4: Create entrypoints

Create files in `entrypoints/` based on chosen features (see below).

### Step 5: Verify setup

```bash
pnpm dev        # Dev mode with hot reload
pnpm build      # Production build → .output/
pnpm zip        # Create store-ready zip
```

---

## Entrypoints Quick Reference

| Feature | File to create |
|---------|---------------|
| Popup | `entrypoints/popup/index.html` + `main.tsx` |
| Background | `entrypoints/background.ts` |
| Content script | `entrypoints/content.ts` |
| Options page | `entrypoints/options/index.html` + `main.tsx` |
| Side panel | `entrypoints/sidepanel/index.html` + `main.tsx` |
| CSS injection | `entrypoints/content.css` |

---

## wxt.config.ts Template

```ts
import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],  // or vue/svelte
  manifest: {
    name: 'My Extension',
    description: 'What it does',
    permissions: ['storage', 'activeTab'],
    host_permissions: ['<all_urls>'],
    action: { default_popup: 'popup.html' },
  },
});
```

---

## Extension Type → Entrypoints Map

| Type | Entrypoints | Permissions |
|------|------------|-------------|
| Popup tool | popup | activeTab |
| Page modifier | content, background | activeTab or host_permissions |
| Side panel assistant | sidepanel, background | sidePanel, storage |
| Tab manager | popup, background | tabs, storage |
| Context menu | background | contextMenus, activeTab |

---

## Post-Scaffold Checklist

- [ ] `pnpm install` completed
- [ ] `wxt.config.ts` has correct permissions
- [ ] Entrypoints created for chosen features
- [ ] `pnpm dev` loads extension without errors
- [ ] Load `chrome://extensions` → enable Developer mode → Load unpacked → `.output/chrome-mv3-dev`

---

## References

- `references/wxt-scaffold-guide.md` — CLI options, project structure, config
- `references/wxt-entrypoints.md` — All entrypoint types, naming, manifest generation
- `references/extension-templates.md` — Ready-to-use patterns per extension type
- `references/chrome-samples-reference.md` — Google's official samples by category

## Related Skills

- `extension-manifest` — Generate/validate manifest.json
- `extension-dev` — Dev workflow, hot reload, debugging
- `extension-publish` — Store submission
