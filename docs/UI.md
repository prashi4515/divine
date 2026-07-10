# UI

> Component inventory and pointers for Divine frontends.
> **Full design rationale and tokens:** [Design-System.md](./Design-System.md)

## 1. Overview

- **Public design system:** `@divine/ui` tokens + Tailwind preset.
- **Framework:** Next.js 15 (App Router).
- **Components:** shadcn/ui primitives in `apps/web/src/components/ui` (migrate to `@divine/ui` over time).
- **Icons:** lucide-react.
- **Fonts:** Inter (sans) + Instrument Serif (serif) via `next/font`.

## 2. Surfaces

| Surface | Path | Notes |
| ------- | ---- | ----- |
| Public site | `/` | Marketing + future reader — uses design system |
| Admin CMS | `/admin` | Internal shell; same tokens, denser chrome |

## 3. Token consumption

```ts
// apps/web/tailwind.config.ts
import divinePreset from "@divine/ui/tailwind-preset";
```

```css
/* apps/web/src/app/globals.css */
@import "@divine/ui/styles/tokens.css";
```

## 4. Primitives (current)

- `Button` — default, secondary, outline, ghost, link, ink
- `Card` — header / title / description / content
- `Input`, `Badge`, `Skeleton`, `Separator`
- `ThemeProvider`, `ThemeToggle`

## 5. Contribution

See Design-System §17. Do not invent one-off colors in feature folders.
