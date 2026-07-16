# =========================================================================
# Divine API — production Docker image
#
# IMPORTANT: build this from the REPO ROOT so the pnpm workspace is intact:
#   docker build -f apps/api/Dockerfile -t divine-api .
#
# Multi-stage:
#   1) builder  — install workspace deps, generate Prisma client, compile TS
#   2) runner   — slim runtime with only the API's production deps
# =========================================================================

# ---- Stage 1: builder ---------------------------------------------------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable
WORKDIR /app

# Copy the workspace manifests first for better layer caching.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json

# Install only the API workspace and its dependencies.
RUN pnpm install --filter @divine/api...

# Copy sources and build (prisma generate runs inside build).
COPY packages/types packages/types
COPY apps/api apps/api
WORKDIR /app/apps/api
RUN pnpm build

# Produce a self-contained deployable folder with prod-only node_modules.
WORKDIR /app
RUN pnpm --filter @divine/api deploy --prod /app/deploy

# `pnpm deploy` installs @prisma/client but does not run `prisma generate`.
WORKDIR /app/deploy
RUN cp -r /app/apps/api/prisma ./prisma \
    && npx --yes prisma@6.19.3 generate --schema=./prisma/schema.prisma

# ---- Stage 2: runner ----------------------------------------------------
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

# Non-root user for safety.
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -S nestjs

COPY --from=builder --chown=nestjs:nodejs /app/deploy/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/deploy/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/deploy/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma

USER nestjs
EXPOSE 8080
CMD ["node", "dist/main.js"]
