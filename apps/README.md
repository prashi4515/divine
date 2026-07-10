# apps/

Deployable applications. Each subfolder is an **independently deployable
unit** with its own `package.json`, build, and lifecycle.

## Members

| App   | Purpose                                                   | Deploys to     |
| ----- | --------------------------------------------------------- | -------------- |
| `web` | Next.js 15 website — public reader, SEO, multilingual     | Vercel         |
| `api` | NestJS backend — domain API for web / mobile / AI clients | Railway or VPS |

## Rules

- Apps may depend on any workspace under `packages/*`.
- Apps must **not** import from other apps. They talk over HTTP only.
- Apps must **not** be imported by `packages/*` — dependency flow is
  one-way: `apps/* → packages/*`.
- Each app owns its own environment variables and deployment config.
- Future apps (`mobile`, `admin`, `ai-guru`) will be added here.
