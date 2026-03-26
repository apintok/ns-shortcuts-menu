# Browser Extension Skills for AI Coding Agents

> Production-grade skills for building, testing, analyzing, and publishing Chrome & browser extensions with AI coding agents. Powered by [Extension Booster](https://extensionbooster.com/).

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![MV3](https://img.shields.io/badge/Manifest-V3-orange)](https://developer.chrome.com/docs/extensions/develop/migrate)
[![Powered by Extension Booster](https://img.shields.io/badge/Powered_by-Extension_Booster-purple)](https://extensionbooster.com/)

### Compatible AI Coding Agents

| Agent | Type | Skills Support |
|-------|------|---------------|
| [Claude Code](https://docs.claude.com/en/docs/claude-code) | CLI / IDE extension | Native skill loading |
| [Cursor](https://cursor.com/) | AI-powered IDE | Via `.cursor/rules/` |
| [Windsurf (Codeium)](https://codeium.com/windsurf) | AI-powered IDE | Via `.windsurfrules` |
| [GitHub Copilot](https://github.com/features/copilot) | IDE extension | Via `.github/copilot-instructions.md` |
| [Cline](https://github.com/cline/cline) | VS Code extension | Via `.clinerules` |
| [Aider](https://aider.chat/) | CLI agent | Via `.aider.conf.yml` conventions |
| [Continue](https://continue.dev/) | IDE extension | Via `.continue/` config |
| [Roo Code](https://roo.dev/) | VS Code extension | Via `.roo/rules/` |
| [Augment Code](https://www.augmentcode.com/) | IDE extension | Via project instructions |
| [Amazon Q Developer](https://aws.amazon.com/q/developer/) | IDE extension | Via project context |

## Why These Skills?

Built by [Extension Booster](https://extensionbooster.com/), these skills address the real pain points of Chrome extension development: scattered documentation, confusing permission warnings, multi-context debugging, and opaque Chrome Web Store reviews. They turn Claude Code into an extension development expert that can:

- **Scaffold** a complete extension project in seconds
- **Develop** features with proper API usage and framework detection
- **Generate** optimized manifest.json with minimum permissions
- **Analyze** code for security vulnerabilities and CWS compliance
- **Test** across all extension contexts (service worker, content script, popup)
- **Create** all required icons and store listing assets
- **Publish** to Chrome Web Store with CI/CD automation
- **Migrate** existing extensions from Manifest V2 to V3

---

## Skills Overview

| Skill | Description | Use When |
|-------|-------------|----------|
| [`extension-create`](skills/extension-create/) | Auto-scaffold Chrome extensions with WXT framework | Starting a new extension project |
| [`extension-dev`](skills/extension-dev/) | Develop features with framework detection and Chrome API guidance | Building new features, debugging |
| [`extension-manifest`](skills/extension-manifest/) | Generate manifest.json with optimal permissions from code analysis | Setting up or updating manifest |
| [`extension-analyze`](skills/extension-analyze/) | Security audit, best practices, CWS compliance checking | Pre-submission review, code quality |
| [`extension-test`](skills/extension-test/) | Unit, integration, and E2E testing with Puppeteer | Writing and running tests |
| [`extension-assets`](skills/extension-assets/) | Generate icons, screenshots, and store listing images | Preparing visual assets |
| [`extension-publish`](skills/extension-publish/) | Chrome Web Store submission, listing optimization, CI/CD | Publishing and updates |
| [`extension-migration`](skills/extension-migration/) | Migrate from Manifest V2 to V3 with step-by-step guidance | Upgrading legacy extensions |

---

## Installation

### Recommended: Using Skills CLI

Install all skills at once using the [Skills CLI](https://github.com/vercel-labs/skills):

```bash
# Install all skills to your project
npx skills add nicepkg/browser-extension-skills

# Install globally (available in all projects)
npx skills add nicepkg/browser-extension-skills -g

# Install specific skills only
npx skills add nicepkg/browser-extension-skills -s extension-create,extension-dev

# List available skills before installing
npx skills add nicepkg/browser-extension-skills -l
```

### Alternative: Manual Installation

```bash
# Clone the repository
git clone https://github.com/nicepkg/browser-extension-skills.git

# Copy all skills to your project
cp -r browser-extension-skills/skills/* .claude/skills/

# Or copy to global Claude Code skills
cp -r browser-extension-skills/skills/* ~/.claude/skills/
```

### Alternative: Install Individual Skills

```bash
# Copy only the skills you need
cp -r browser-extension-skills/skills/extension-create .claude/skills/
cp -r browser-extension-skills/skills/extension-dev .claude/skills/
```

---

## Quick Start

### 1. Create a New Extension

```
> Create a Chrome extension that highlights all links on a page
```

Claude Code activates `extension-create` → scaffolds with WXT → sets up entrypoints → configures manifest.

### 2. Develop Features

```
> Add a popup that shows link count and lets users toggle highlighting
```

Claude Code activates `extension-dev` → detects WXT + React → implements popup with chrome.tabs API.

### 3. Generate Assets

```
> Generate all icons and store listing screenshots for my extension
```

Claude Code activates `extension-assets` → creates icons (16/32/48/128px) → generates listing images.

### 4. Analyze Before Publishing

```
> Analyze my extension for security issues and CWS compliance
```

Claude Code activates `extension-analyze` → scans permissions, CSP, message handlers → reports issues.

### 5. Publish

```
> Prepare and publish my extension to Chrome Web Store
```

Claude Code activates `extension-publish` → validates listing → packages → submits via CI/CD.

---

## Skill Details

### extension-create

Automatically scaffolds a Chrome extension using the [WXT framework](https://wxt.dev/) with samples from [Chrome Extensions Samples](https://github.com/GoogleChrome/chrome-extensions-samples).

**Supports:** React, Vue, Svelte, Solid, Vanilla TypeScript
**Features:** Auto-scaffold, framework selection, entrypoint generation, wxt.config.ts setup

### extension-dev

Develops new features by detecting your current framework and stack, then finding proper documentation online.

**References:**
- [Getting Started](https://developer.chrome.com/docs/extensions/get-started)
- [Development Guide](https://developer.chrome.com/docs/extensions/develop)
- [API Reference](https://developer.chrome.com/docs/extensions/reference/api)
- [Permissions List](https://developer.chrome.com/docs/extensions/reference/permissions-list)

### extension-manifest

Generates optimal `manifest.json` by analyzing your codebase for Chrome API usage and mapping to minimum required permissions.

**References:**
- [Manifest Reference](https://developer.chrome.com/docs/extensions/reference/manifest)
- [Permissions List](https://developer.chrome.com/docs/extensions/reference/permissions-list)

### extension-analyze

Audits extensions for security vulnerabilities, performance issues, and Chrome Web Store policy compliance.

**Checks:** Permissions, CSP, message handlers, storage security, XSS vectors, dependencies, CWS compliance

### extension-test

Sets up and runs unit, integration, and E2E tests for Chrome extensions.

**Stack:** Jest for unit/integration, Puppeteer for E2E, chrome API mocks
**Key constraint:** Extensions cannot run in headless mode

### extension-assets

Generates all required icons and Chrome Web Store listing assets.

**Supports:** ImageMagick CLI generation, Gemini API for AI-generated images, prompt templates for manual generation

### extension-publish

Handles Chrome Web Store submission, listing optimization, and CI/CD automation.

**Features:** Pre-submission checklist, listing SEO, common rejections guide, GitHub Actions workflow

### extension-migration

Step-by-step migration from Manifest V2 to V3.

**Reference:** [Migration Guide](https://developer.chrome.com/docs/extensions/develop/migrate)
**Covers:** Service workers, declarativeNetRequest, CSP changes, API replacements

---

## Requirements

| Requirement | Details |
|-------------|---------|
| [Claude Code](https://docs.claude.com/en/docs/claude-code) | CLI or IDE extension |
| Node.js | v18+ recommended |
| npm/pnpm/yarn/bun | Any package manager |
| Chrome | For testing and debugging |
| Gemini API Key | Optional, for AI-generated assets (`extension-assets`) |

---

## Tips & Best Practices

### Permission Optimization
- Always prefer `activeTab` over broad `tabs` + host permissions
- Use optional permissions for non-essential features
- Run `extension-analyze` before every CWS submission

### Performance
- Keep content scripts under 50KB (lazy-load heavy logic)
- Service workers should be event-driven (no polling)
- Use `chrome.storage.session` for temporary data

### Security
- Validate all message senders (`sender.id === chrome.runtime.id`)
- Never use `innerHTML` with untrusted data
- No API keys in source code; use a proxy server

### Testing
- Extensions cannot run in headless Chrome — always use `headless: false`
- Each E2E test should get a fresh browser instance
- Mock `chrome.*` APIs consistently with `jest-chrome` or manual mocks

### Publishing
- First 150 characters of description appear in search results
- Screenshots at 1280x800 showing features in action convert best
- Single-purpose policy: one clear function per extension

---

## Architecture

Each skill follows the [progressive disclosure](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices) pattern for optimal token efficiency:

```
skills/
├── extension-create/
│   ├── SKILL.md              # Quick reference (< 150 lines, always loaded)
│   └── references/           # Detailed docs (loaded on-demand by Claude)
│       ├── wxt-scaffold-guide.md
│       ├── wxt-entrypoints.md
│       ├── extension-templates.md
│       └── chrome-samples-reference.md
├── extension-dev/
├── extension-manifest/
├── extension-analyze/
├── extension-test/
├── extension-assets/
├── extension-publish/
└── extension-migration/
```

- **SKILL.md** — Always loaded when skill activates. Concise, actionable, < 150 lines.
- **references/** — Loaded only when Claude needs deeper context. < 150 lines each.

---

## Contributing

1. Fork the repository
2. Create your skill under `skills/` following the structure above
3. Ensure SKILL.md < 150 lines, each reference < 150 lines
4. Test the skill with Claude Code on real extension projects
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## Resources

- [Extension Booster](https://extensionbooster.com/) — Build, optimize, and grow Chrome extensions
- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions)
- [Chrome Web Store Publishing](https://developer.chrome.com/docs/webstore)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/develop/migrate)
- [WXT Framework](https://wxt.dev/)

---

## Powered by Extension Booster

These skills are powered by [Extension Booster](https://extensionbooster.com/) — the platform for Chrome extension developers to build, optimize, and grow their extensions faster.

Visit [extensionbooster.com](https://extensionbooster.com/) to supercharge your extension development workflow.

---

## License

[MIT](LICENSE)
