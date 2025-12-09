FROM oven/bun:1-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/package.json
COPY tooling/typescript/package.json ./tooling/typescript/package.json
RUN bun install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

RUN bun run build --filter=@repo/web

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3001

CMD bun ./apps/web/server.js
