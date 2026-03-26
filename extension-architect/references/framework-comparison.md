# Framework Comparison (2026)

## WXT (Recommended)

**Status**: Market leader, actively maintained
**Setup**: `npx wxt@latest init`

| Aspect | Detail |
|--------|--------|
| Bundle size | ~400 KB (smallest) |
| HMR | Excellent, includes service worker |
| Framework | Agnostic (React, Vue, Svelte, Solid) |
| Learning curve | Low |
| Community | Large, active |
| Production use | High adoption |

**Best for**: All new projects

## Plasmo

**Status**: Maintenance mode (2026), viability concerns
**Setup**: `npm create plasmo`

| Aspect | Detail |
|--------|--------|
| Bundle size | ~800 KB (larger) |
| HMR | Good |
| Framework | React-first (others via config) |
| Learning curve | Low |
| Unique feature | CSUI (Content Scripts UI) for React injection |
| Concern | Dependent on aging Parcel bundler |

**Best for**: Existing React codebases only. NOT recommended for new projects.

## CRXJS (Vite Plugin)

**Status**: Minimal abstraction, uncertain maintenance
**Setup**: Vite + `@crxjs/vite-plugin`

| Aspect | Detail |
|--------|--------|
| Bundle size | Small |
| HMR | Good |
| Framework | Any (Vite-compatible) |
| Learning curve | Medium (Vite knowledge required) |
| Control | Maximum developer control |

**Best for**: Teams comfortable with Vite internals

## Custom Boilerplate

**Setup**: Manual Rollup/Webpack/Vite configuration

| Aspect | Detail |
|--------|--------|
| Bundle size | Depends on config |
| HMR | Must implement yourself |
| Framework | Any |
| Learning curve | High |
| Maintenance | Your responsibility |

**Best for**: Highly specialized needs, performance-critical extensions

## Decision Matrix

| Factor | WXT | Plasmo | CRXJS | Custom |
|--------|-----|--------|-------|--------|
| Setup time | 5 min | 5 min | 15 min | 30+ min |
| Bundle size | Best | Large | Good | Varies |
| HMR quality | Best | Good | Good | Manual |
| Maintenance | Active | Uncertain | Minimal | You |
| Recommendation | **Go-to** | Avoid | Expert-only | Specialized |

## Migration Note

Migrating between frameworks primarily involves:
1. Moving entrypoint files to new directory structure
2. Updating manifest configuration format
3. Adjusting build scripts in package.json
4. Keeping services/hooks/utils unchanged (framework-agnostic)
