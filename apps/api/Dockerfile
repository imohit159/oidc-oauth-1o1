# ------------------------
# Stage 1: Prune workspace
# ------------------------
FROM node:24-alpine AS pruner

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm turbo

WORKDIR /app

COPY . .

RUN turbo prune @repo/api --docker


# ------------------------
# Stage 2: Builder
# ------------------------
FROM node:24-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm turbo

WORKDIR /app

# First install dependencies (cached if package.json/lockfile don't change)
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

# Then copy source and build
COPY --from=pruner /app/out/full/ ./

RUN pnpm --filter @repo/api build


# ------------------------
# Stage 3: Runner
# ------------------------
FROM node:24-alpine AS runner

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Copy entire pruned and built app to preserve workspace symlinks
COPY --from=builder /app/ .

EXPOSE 8000

CMD ["node", "apps/api/dist/server.js"]
