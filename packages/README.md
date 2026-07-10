# packages/

Shared, reusable libraries consumed by `apps/*`. Each package is a private
workspace (`@divine/*`) that is **never published to npm**.

## Members

| Package  | Purpose                                                   | Consumed by            |
| -------- | --------------------------------------------------------- | ---------------------- |
| `ui`     | Shared React UI components (shadcn-based, Tailwind)       | `apps/web`             |
| `config` | Shared configuration presets (eslint, tsconfig, tailwind) | all apps + packages    |
| `types`  | Shared TypeScript types, DTOs, and Zod schemas            | `apps/web`, `apps/api` |

## Rules

- Packages must be **framework-agnostic where possible**. `@divine/ui` may
  depend on React; `@divine/types` and `@divine/config` must not.
- Packages must **never** import from `apps/*` (one-way dependency flow).
- A package may depend on another package only if the dependency is
  strictly lower in the layer:  
  `types` → (nothing) → `config` → (nothing) → `ui` → `types`.
- Every public export must be added intentionally via the package's entry
  point — no deep imports across workspaces.
