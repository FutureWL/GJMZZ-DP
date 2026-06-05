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
COPY apps/cockpit-ui/package.json apps/cockpit-ui/package.json

RUN pnpm install --filter cockpit-ui... --frozen-lockfile

FROM deps AS build

COPY packages/mock-data packages/mock-data
COPY apps/cockpit-ui apps/cockpit-ui

RUN pnpm --filter cockpit-ui build

FROM nginx:1.27-alpine AS runner

COPY apps/cockpit-ui/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/cockpit-ui/dist/ /usr/share/nginx/html/cockpit/

EXPOSE 80
