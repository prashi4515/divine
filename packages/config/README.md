# @divine/config

Shared configuration presets used across the monorepo.

## Responsibility

- Provide **base** configurations that apps and other packages extend:
  - `tsconfig.base.json` (strict TypeScript defaults)
  - `eslint` preset (rules shared by all workspaces)
  - `tailwind` preset (shared theme + plugins)
  - Optional: prettier config, jest/vitest presets

## Boundaries

- Must not depend on any other workspace package.
- Must not contain runtime code or business logic — only static config.
- Framework-specific presets (e.g. Next.js, NestJS) live here as separate
  exports so apps can pick what they need.

## Expected structure (added later)

```
tsconfig/
├── base.json
├── nextjs.json
└── nestjs.json

eslint/
├── base.cjs
├── react.cjs
└── node.cjs

tailwind/
└── preset.cjs
```

Consumers reference these via `@divine/config/tsconfig/base.json`, etc.
