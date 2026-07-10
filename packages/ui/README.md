# @divine/ui

Shared **public** design system for Divine.

## What lives here

| Path | Role |
| ---- | ---- |
| `src/styles/tokens.css` | Color, type, space, radius, shadow, motion tokens |
| `src/tailwind-preset.ts` | Tailwind theme mapping to those tokens |
| `src/index.ts` | Package entry (components migrate here over time) |

## Consumption (apps/web)

```ts
// tailwind.config.ts
import divinePreset from "@divine/ui/tailwind-preset";
export default { presets: [divinePreset], ... };
```

```css
/* globals.css */
@import "@divine/ui/styles/tokens.css";
```

## Rules

- Do not redefine token values in apps — change `tokens.css` once.
- Browser-safe only (no Node APIs).
- Full rationale: `docs/Design-System.md`.
