# @divine/types

Shared Zod schemas and inferred TypeScript types — the **contract** between
`apps/api` and all clients (`apps/web`, future mobile).

## Rule

Any field that crosses the HTTP boundary must be defined here first.
