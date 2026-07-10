# Design System — Public Website

> Premium, calm, timeless visual language for Divine’s **public** surfaces.
> Inspired by Apple, Linear, Vercel, and Notion — adapted for long-form
> multilingual scripture reading.
>
> **Foundation only.** No marketing pages, no API wiring in this milestone.
>
> **Source of truth (code):** `packages/ui/src/styles/tokens.css` +
> `packages/ui/src/tailwind-preset.ts`

---

## 1. Principles

| Principle | Meaning |
| --------- | ------- |
| Content first | Typography and whitespace carry the experience; chrome stays quiet |
| Calm | No decorative gradients, glow, or loud brand color fields |
| Timeless | Neutral ink palette; avoid trend-locked purple/neon |
| Readable | Comfortable measure, verse line-height, WCAG AA contrast |
| Premium | Restraint = quality (hairline borders, subtle elevation) |

**Why these inspirations**

- **Apple** — clarity, focus rings, system-like calm.
- **Linear** — dense-but-breathable UI, precise radius, muted labels.
- **Vercel** — high-contrast ink primary, minimal chrome.
- **Notion** — warm-neutral reading comfort for long sessions.

**Explicitly avoided**

- Purple-on-white / indigo gradient SaaS clichés.
- Warm cream + terracotta “AI brochure” look.
- Broadsheet / newspaper dense columns.
- Pill-heavy UI, multi-layer neon shadows, emoji as decoration.

---

## 2. Color palette

### Semantic tokens (light)

| Token | Role | Decision |
| ----- | ---- | -------- |
| `background` / `foreground` | Page canvas + body text | Barely warm near-white (`40 20% 99%`) + warm ink — readable for hours without cream cliché |
| `primary` | Primary CTA fill | **Ink**, not brand hue — Vercel-like authority; scripture product shouldn’t scream color |
| `secondary` / `muted` / `accent` | Soft surfaces | Same family as background; hover/selected states without new hues |
| `ink` | Links / secondary emphasis | Cool slate (`215 18% 36%`) — Apple-like link blue without purple |
| `destructive` / `success` / `warning` | Status only | Functional; never decorative |
| `border` / `input` / `ring` | Structure + focus | Hairline structure; ring matches ink for focus visibility |
| `verse` / `sanskrit` | Reader content | Dedicated content colors so UI chrome can change without harming reading |

### Dark mode

- Background shifts to cool near-black (`240 6% 6%`) — Linear/Vercel dark, not pure `#000` (reduces halation).
- Primary inverts to light ink on dark.
- `ink` lightens for link contrast on dark surfaces.
- Shadows deepen (dark UI needs stronger elevation cues).

**Why HSL channels without `hsl()`?**  
Tailwind alpha modifiers: `bg-primary/90`, `border-border/60`.

---

## 3. Typography scale

| Step | Size | Use |
| ---- | ---- | --- |
| `xs` | 12px | Meta, captions |
| `sm` | 14px | Secondary UI, table cells |
| `base` | 16px | Body |
| `lg` | 18px | Lead paragraphs |
| `xl`–`2xl` | 20–24px | Section titles |
| `3xl`–`6xl` | 30–60px | Display / marketing headlines |

**Families**

- **Sans (`Inter`)** — UI, body, navigation (Linear/Vercel clarity).
- **Serif (`Instrument Serif`)** — brand wordmark, verse display, chapter titles (timeless, literary).
- **Mono** — public IDs (`bg.2.47`), code-like metadata only.

**Leading**

- UI: `1.35–1.5`
- Body: `1.65` (`relaxed`)
- Verse: `1.8` (`--leading-verse`) — Sanskrit/translation need air

**Tracking**

- Display: slight negative (`-0.02em`) for large serif/sans headlines (Apple/Linear).
- Labels: slight positive for uppercase meta if used sparingly.

**Why not one font?**  
UI needs neutrality; scripture benefits from a distinct literary voice. Dual-font is a deliberate hierarchy, not decoration.

---

## 4. Spacing scale

4px base: `1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48, 16=64, 20=80, 24=96`.

**Why 4px?**  
Industry standard (Tailwind default); predictable rhythm; easy mental math for engineers.

**Layout widths**

| Token | Width | Use |
| ----- | ----- | --- |
| `max-w-prose` | 42rem | Verse / article measure |
| `max-w-content` | 72rem | Standard page |
| `max-w-wide` | 80rem | Rare wide tools |

**Why constrain measure?**  
Line lengths past ~75 characters hurt reading. Scripture especially needs a narrow column.

---

## 5. Border radius

| Token | Value | Use |
| ----- | ----- | --- |
| `sm` | 6px | Badges, small controls |
| `md` | 8px | Buttons, inputs (default `--radius`) |
| `lg` | 12px | Cards |
| `xl` | 16px | Large panels only |

**Why not `rounded-full` pills everywhere?**  
Pills date quickly and feel consumer-chatty. Soft rectangles feel more editorial and durable (Linear/Notion).

---

## 6. Shadows (elevation)

| Token | Use |
| ----- | --- |
| `shadow-xs` | Buttons, inputs, resting cards |
| `shadow-sm` | Raised controls |
| `shadow-md` | Popovers, dropdowns |
| `shadow-lg` | Modals |
| `shadow-none` | Flat / border-only |

**Why hairline + light shadow?**  
Prefer **border** for structure; shadow only for true elevation. Avoids muddy “card soup.” No multi-layer neon glow.

---

## 7. Buttons

Variants (shadcn-aligned, token-backed):

| Variant | When |
| ------- | ---- |
| `default` | Primary action (ink fill) |
| `secondary` | Secondary action |
| `outline` | Tertiary / cancel |
| `ghost` | Toolbar, icon actions |
| `link` | Inline textual (`text-ink`) |
| `ink` | Emphasized link-button (slate fill) |

Sizes: `sm` / `default` / `lg` / `icon`.

**Rules**

- One primary button per view region.
- Disabled = `opacity-50` + `pointer-events-none` (honest non-action).
- Always keyboard-focusable with visible ring.

---

## 8. Cards

- Surface: `bg-card` + `border` + `shadow-xs`.
- Use for **interactive or grouped content** (settings, stats, verse meta) — not every paragraph.
- Prefer border over heavy shadow.
- Dashed border reserved for empty states.

---

## 9. Inputs

- Height `h-9` (36px) — aligns with buttons for form rows.
- `shadow-xs` + border; focus = `ring-1 ring-ring`.
- Placeholder uses `muted-foreground`.
- Labels are real `<label>` elements (a11y), never placeholder-only.

---

## 10. Icons

- Library: **lucide-react** (consistent 24px grid, tree-shakeable).
- Default UI size: `h-4 w-4` (16px) beside `text-sm`.
- Stroke inherits `currentColor` — icons follow text tone.
- Decorative icons: `aria-hidden`. Meaningful icons: accessible name on the control.

**Why Lucide?**  
Matches shadcn; neutral metaphor set; no skeuomorphic clutter.

---

## 11. Motion guidelines

| Token | Duration | Use |
| ----- | -------- | --- |
| `fast` | 120ms | Hover color, opacity |
| `base` | 200ms | Standard transitions |
| `slow` | 320ms | Enter/exit, fade-up |

Easing: `--ease-out` (exit-forward, Apple-like).

**Allowed motion**

- Color / opacity / subtle `translateY(6px)` fade-up on enter.
- Theme cross-fade via `next-themes` (`disableTransitionOnChange` already set to avoid flash).

**Forbidden**

- Bounce, springy overshoot, parallax on reading pages, autoplay animation loops.

**`prefers-reduced-motion`**

- Durations collapse to `0ms` in tokens.
- `scroll-smooth` disabled under reduced motion.

Utility: `.transition-divine`, animations `animate-fade-in` / `animate-fade-up`.

---

## 12. Responsive breakpoints

| Name | Min width | Intent |
| ---- | --------- | ------ |
| (base) | 0 | Mobile-first; single column |
| `sm` | 640px | Comfortable phone landscape / small tablet |
| `md` | 768px | Sidebar-capable / 2-column |
| `lg` | 1024px | Desktop reading + nav |
| `xl` | 1280px | Wide content |
| `2xl` | 1536px | Max utilitarian width |

**Rules**

- Design from 320px up.
- Touch targets ≥ 44×44px where primary.
- Tables: horizontal scroll inside card, never crush columns unreadably.
- Type scales down gracefully; don’t hide verse text behind tabs on mobile without a clear pattern.

---

## 13. Accessibility guidelines

1. **Semantic HTML first** — `main`, `nav`, `header`, `article`, headings in order.
2. **Focus visible** — global `:focus-visible` ring; never `outline-none` without replacement.
3. **Contrast** — body text AA vs background; muted text only for non-essential meta.
4. **Hit area** — icon buttons use `h-9 w-9` minimum.
5. **Images** — meaningful `alt`; decorative `alt=""`.
6. **Forms** — every input has a label; errors linked via `aria-describedby`.
7. **Motion** — honor `prefers-reduced-motion`.
8. **Language** — set `lang` on `<html>`; future `[locale]` routes update it.
9. **Skip link** — add when public chrome ships (nav → main).
10. **Don’t rely on color alone** for publish/status — use text or icon + color.

---

## 14. Dark mode strategy

| Decision | Choice | Why |
| -------- | ------ | --- |
| Strategy | `class` on `<html>` | Tailwind `darkMode: "class"`; SSR-safe with `next-themes` |
| Default | `system` | Respect OS; seekers often read at night |
| Storage | `localStorage` via next-themes | Per-device preference |
| Flash | `suppressHydrationWarning` on `<html>` | Avoid theme mismatch warning |
| Tokens | Parallel `.dark { … }` in `tokens.css` | One component API, two themes |
| Public vs Admin | Same tokens | One system; admin may later add density overrides, not a second palette |

**Do not** ship separate “brand dark” with purple glows.

---

## 15. SEO layout guidelines

Design system constraints that protect SEO (implementation later on public routes):

1. **Server Components by default** — content in HTML at first response.
2. **Locale-first URLs** — `/{locale}/…` when i18n ships; `lang` + `hreflang` required.
3. **One `<h1>` per page** — visual display styles must not invent extra `h1`s.
4. **Metadata API** — title template, description, canonical, OG — per route.
5. **Stable verse URLs** — `publicId` in path; never change for vanity.
6. **No content-only-in-JS** — translations readable without client hydration.
7. **Landmark structure** — `header` / `main` / `footer` for crawlers and a11y.
8. **Image discipline** — `next/image`, explicit dimensions, descriptive alt.
9. **Performance as SEO** — font `display: swap`; avoid layout shift from late icons.
10. **Admin is separate** — `/admin` is `noindex`; public design system does not inherit admin density as default.

---

## 16. File map

```
packages/ui/
  src/styles/tokens.css      # CSS variables
  src/tailwind-preset.ts     # Tailwind mapping
  src/index.ts
  README.md

apps/web/
  tailwind.config.ts         # presets: [divinePreset]
  src/app/globals.css        # imports tokens + base a11y
  src/components/ui/*        # Button, Card, Input, … consume tokens
```

---

## 17. Contribution rules

1. Change tokens in `packages/ui` — never hardcode hex in features.
2. New components: shadcn style, CVA variants, `cn()` merges.
3. Before adding a color, ask: is it semantic (`destructive`) or decorative? Prefer semantic.
4. Document token additions in this file.
5. Visual QA in light + dark + reduced motion.

---

## References

- [UI](./UI.md) — component inventory pointer
- [SEO](./SEO.md) — route-level SEO
- [Admin](./Admin.md) — internal CMS (separate shell; shared tokens)
- [Architecture](./Architecture.md)
