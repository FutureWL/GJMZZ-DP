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
COPY apps/factory-api/package.json apps/factory-api/package.json
COPY apps/factory-api/prisma apps/factory-api/prisma

RUN pnpm install --filter factory-api... --frozen-lockfile
RUN pnpm --filter factory-api exec prisma generate

FROM deps AS build

COPY apps/factory-api/tsconfig.json apps/factory-api/tsconfig.json
COPY apps/factory-api/tsconfig.build.json apps/factory-api/tsconfig.build.json
COPY apps/factory-api/src apps/factory-api/src

RUN pnpm --filter factory-api build

FROM node:22-alpine AS runner

ENV NODE_ENV=production

WORKDIR /workspace/apps/factory-api

COPY --from=deps /workspace/node_modules /workspace/node_modules
COPY --from=deps /workspace/apps/factory-api/node_modules ./node_modules
COPY --from=build /workspace/apps/factory-api/dist ./dist
COPY apps/factory-api/package.json ./package.json

EXPOSE 3001

CMD ["node", "dist/main.js"]
