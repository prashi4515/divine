# apps/web

**Next.js 15 website** — the primary public surface of Divine.

## Stack

- **Next.js 15** (App Router, Server Components, ISR/SSG capable)
- **React 19**
- **TypeScript** (strict)
- **TailwindCSS 3.4** with CSS variables for theming
- **shadcn/ui** (New York style, neutral base) — components live under
  `src/components/ui`
- **next-themes** — dark / light / system with `class` strategy
- **lucide-react** — icons
- **ESLint** (`next/core-web-vitals` + `next/typescript` + `prettier`)
- **Prettier** with `prettier-plugin-tailwindcss` (class sorting)

## Scripts

```bash
pnpm --filter @divine/web dev        # start dev server (http://localhost:3000)
pnpm --filter @divine/web build      # production build
pnpm --filter @divine/web start      # start production server
pnpm --filter @divine/web lint       # eslint
pnpm --filter @divine/web typecheck  # tsc --noEmit
```

## Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout, fonts, ThemeProvider
│   │   ├── page.tsx          # Landing placeholder
│   │   └── globals.css       # Tailwind entry + shadcn CSS variables
│   ├── components/
│   │   ├── theme-provider.tsx  # next-themes wrapper
│   │   ├── theme-toggle.tsx    # dark/light toggle
│   │   └── ui/
│   │       └── button.tsx      # shadcn Button primitive
│   └── lib/
│       └── utils.ts          # cn() classnames helper
├── components.json           # shadcn config
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── next-env.d.ts
└── .eslintrc.json
```

## Notes

- Scripture pages, auth, and features are **not** built here yet — only the
  frontend shell + a landing placeholder.
- All data will come from `apps/api` over HTTP. This app never touches the
  database directly.
