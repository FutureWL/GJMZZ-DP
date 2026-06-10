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
COPY apps/mobile-app/package.json apps/mobile-app/package.json

RUN pnpm install --filter mobile-app... --frozen-lockfile

FROM deps AS build

COPY packages/mock-data packages/mock-data
COPY apps/mobile-app apps/mobile-app

RUN pnpm --filter mobile-app build

FROM nginx:1.27-alpine AS runner

COPY apps/mobile-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/mobile-app/dist/ /usr/share/nginx/html/m/app/

EXPOSE 80
