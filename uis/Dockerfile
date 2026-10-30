FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY uis/website/package.json ./uis/website/
COPY uis/backoffices/portal/package.json ./uis/backoffices/portal/

RUN corepack pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY uis/website ./uis/website
COPY uis/backoffices/portal ./uis/backoffices/portal
COPY uis/start.sh ./uis/start.sh

EXPOSE 3000
EXPOSE 3001

CMD ["sh", "/app/uis/start.sh"]