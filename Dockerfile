# syntax=docker/dockerfile:1

FROM node:24.22.0-alpine3.24@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV HUSKY=0

# The pinned upstream base still carries zlib r0; require Alpine's security fix.
RUN apk add --no-cache libc6-compat zlib=1.3.2-r1

FROM base AS deps

COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM base AS dev

ENV NODE_ENV=development

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .

EXPOSE 3225

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

FROM base AS builder

ENV NODE_ENV=production

ARG NEXT_PUBLIC_API_ORIGIN
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_LEGACY_API_ORIGIN
ARG NEXT_PUBLIC_MEDIA_ORIGIN
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID
ARG NEXT_PUBLIC_YANDEX_MAPS_API_KEY
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY
# Public build metadata only. The upload token is exclusively a BuildKit secret.
ARG SENTRY_RELEASE
ARG SENTRY_ORG=sentry
ARG SENTRY_PROJECT=javascript-react
ARG SENTRY_UPLOAD_SOURCEMAPS=0
ARG SENTRY_SET_COMMITS=0

ENV NEXT_PUBLIC_API_ORIGIN=$NEXT_PUBLIC_API_ORIGIN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_LEGACY_API_ORIGIN=$NEXT_PUBLIC_LEGACY_API_ORIGIN
ENV NEXT_PUBLIC_MEDIA_ORIGIN=$NEXT_PUBLIC_MEDIA_ORIGIN
ENV NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID
ENV NEXT_PUBLIC_YANDEX_MAPS_API_KEY=$NEXT_PUBLIC_YANDEX_MAPS_API_KEY
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY=$NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The online API 2.1 map needs its browser key at build time.
RUN test -n "$NEXT_PUBLIC_YANDEX_MAPS_API_KEY" || (echo "NEXT_PUBLIC_YANDEX_MAPS_API_KEY is required for the production build" >&2; exit 1)
RUN --mount=type=secret,id=sentry_auth_token,env=SENTRY_AUTH_TOKEN \
    npm run build \
    && find .next -type f -name '*.map' -delete \
    && test -z "$(find .next -type f -name '*.map' -print -quit)"

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3225
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# The standalone production server starts directly with Node.js. Remove npm
# and npx from the runtime image to reduce its attack surface.
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3225

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3225/ || exit 1

CMD ["node", "server.js"]
