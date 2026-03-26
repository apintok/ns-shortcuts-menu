# Browser Extension Skills for Claude Code

A comprehensive set of [Claude Code skills](https://docs.claude.com/en/docs/claude-code/skills) for building, testing, publishing, and maintaining browser extensions. Designed to resolve real pain points extension developers face daily.

## Skills

| Skill | Description | Pain Points Solved |
|-------|-------------|-------------------|
| [extension-architect](./extension-architect/) | Project scaffolding, framework selection, architecture patterns | Choosing between WXT/Plasmo/custom, folder structure decisions, cross-browser setup |
| [extension-manifest](./extension-manifest/) | Manifest V3 generation, validation, templates | Manifest syntax errors, missing fields, MV3 format confusion |
| [extension-permissions](./extension-permissions/) | Permission analysis, warning preview, minimum permissions | Over-requesting permissions, scary user warnings, CWS rejections |
| [extension-testing](./extension-testing/) | Unit/integration/E2E testing setup with Puppeteer | No good testing framework, chrome API mocking, headless mode limitations |
| [extension-publishing](./extension-publishing/) | Chrome Web Store submission, listing optimization, CI/CD | Slow reviews, unclear rejections, listing optimization |
| [extension-security](./extension-security/) | CSP audit, message validation, vulnerability scanning | CSP restrictions, XSS in extensions, insecure message passing |
| [extension-debugging](./extension-debugging/) | Multi-context debugging, performance profiling | Console logs scattered across contexts, service worker crashes |
| [extension-migration](./extension-migration/) | MV2 to MV3 migration guide and checklist | Breaking API changes, service worker conversion, webRequest removal |

## Installation

### Option 1: Install all skills

```bash
# Clone to your Claude Code skills directory
git clone https://github.com/user/browser-extension-skills.git
cp -r browser-extension-skills/extension-* ~/.claude/skills/
```

### Option 2: Install individual skills

```bash
# Copy only the skills you need
cp -r browser-extension-skills/extension-architect ~/.claude/skills/
cp -r browser-extension-skills/extension-testing ~/.claude/skills/
# ... etc
```

### Option 3: Use as project-level skills

```bash
# Add to your extension project
cp -r browser-extension-skills/extension-* .claude/skills/
```

## Usage

Skills activate automatically when Claude Code detects relevant context:

```
# Start a new extension project
"Create a Chrome extension that blocks ads on YouTube"

# Analyze permissions
"What permissions does my extension need for tab access and storage?"

# Debug issues
"My service worker keeps terminating and losing state"

# Prepare for publishing
"Prepare my extension for Chrome Web Store submission"

# Migrate from MV2
"Migrate this extension from Manifest V2 to V3"
```

## Skill Architecture

Each skill follows the [progressive disclosure](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices) pattern:

```
extension-*/
├── SKILL.md              # Quick reference (< 150 lines)
└── references/           # Detailed docs loaded on-demand
    ├── topic-a.md        # < 150 lines each
    └── topic-b.md
```

- **SKILL.md**: Always loaded when skill activates. Concise, actionable.
- **references/**: Loaded only when Claude needs deeper context. Token-efficient.

## Research Background

These skills were built from comprehensive research of:
- [Chrome Extensions official docs](https://developer.chrome.com/docs/extensions)
- Developer pain points from Reddit, Stack Overflow, GitHub issues
- Modern tooling ecosystem (WXT, Plasmo, CRXJS, Puppeteer)
- Chrome Web Store publishing policies and common rejections
- Security best practices (OWASP, CSP, message validation)

## Contributing

1. Fork the repository
2. Create a skill following the structure above
3. Ensure SKILL.md is < 150 lines, references < 150 lines each
4. Submit a pull request

## License

MIT
