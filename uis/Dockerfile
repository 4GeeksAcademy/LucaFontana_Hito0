FROM node:24-alpine AS base

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY uis/website/package.json ./uis/website/
COPY uis/backoffices/portal/package.json ./uis/backoffices/portal/

RUN corepack pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared

FROM base AS website

COPY uis/website ./uis/website
RUN corepack pnpm --filter website build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["corepack", "pnpm", "--dir", "/app/uis/website", "start", "--hostname", "0.0.0.0", "--port", "3000"]

FROM base AS portal

COPY uis/backoffices/portal ./uis/backoffices/portal

ARG NEXT_PUBLIC_TALENT_API_URL
ARG NEXT_PUBLIC_AUTH_API_URL
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_TALENT_API_URL=${NEXT_PUBLIC_TALENT_API_URL}
ENV NEXT_PUBLIC_AUTH_API_URL=${NEXT_PUBLIC_AUTH_API_URL}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

RUN corepack pnpm --filter backoffice-portal build

ENV NODE_ENV=production
EXPOSE 3001
CMD ["corepack", "pnpm", "--dir", "/app/uis/backoffices/portal", "start", "--hostname", "0.0.0.0", "--port", "3001"]
