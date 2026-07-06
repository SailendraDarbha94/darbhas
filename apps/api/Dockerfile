# Build and run the NestJS API from the monorepo root:
#   docker build -f apps/api/Dockerfile -t darbha-api .
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /repo

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/config/package.json packages/config/
COPY packages/types/package.json packages/types/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @darbha/api... --filter @darbha/config

COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm --filter @darbha/types build \
  && pnpm --filter @darbha/db build \
  && pnpm --filter @darbha/api build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=builder /repo ./
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
