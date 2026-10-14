# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
# Media hosts allowed for next/image, baked in at build time (see next.config.ts).
ARG IMAGE_HOSTS=""
ENV IMAGE_HOSTS=$IMAGE_HOSTS \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# No backend is reachable while building: pages that read the API prerender their error state and revalidate at runtime.
# A fixed Server Actions key (a build secret, so it stays out of the image history) keeps action IDs the same across
# builds whose actions didn't change; with Next's per-build random key, every deploy broke saves in already-open tabs.
# Without the secret (local and CI builds), Next generates a key as before.
RUN --mount=type=secret,id=next_actions_key,required=false \
    if [ -s /run/secrets/next_actions_key ]; then export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$(cat /run/secrets/next_actions_key)"; fi; \
    API_URL=http://127.0.0.1:9 npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "server.js"]
