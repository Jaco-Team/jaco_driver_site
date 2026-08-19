# syntax=docker/dockerfile:1

FROM node:24-alpine AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV HUSKY=0

RUN apk add --no-cache libc6-compat

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

ENV NEXT_PUBLIC_API_ORIGIN=$NEXT_PUBLIC_API_ORIGIN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_LEGACY_API_ORIGIN=$NEXT_PUBLIC_LEGACY_API_ORIGIN
ENV NEXT_PUBLIC_MEDIA_ORIGIN=$NEXT_PUBLIC_MEDIA_ORIGIN
ENV NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3225
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3225

CMD ["node", "server.js"]