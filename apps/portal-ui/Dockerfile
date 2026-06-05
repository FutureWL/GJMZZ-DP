FROM node:22-alpine AS base

WORKDIR /workspace

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

ENV HTTP_PROXY=$HTTP_PROXY
ENV HTTPS_PROXY=$HTTPS_PROXY
ENV NO_PROXY=$NO_PROXY

RUN corepack enable && corepack prepare pnpm@11.5.1 --activate

FROM base AS deps

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/mock-data/package.json packages/mock-data/package.json
COPY apps/portal-ui/package.json apps/portal-ui/package.json

RUN pnpm install --filter portal-ui... --frozen-lockfile

FROM deps AS build

COPY packages/mock-data packages/mock-data
COPY apps/portal-ui apps/portal-ui

RUN pnpm --filter portal-ui build

FROM nginx:1.27-alpine AS runner

COPY apps/portal-ui/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/portal-ui/dist/ /usr/share/nginx/html/portal/

EXPOSE 80
