# =====================
# ORIXA API - Dockerfile
# =====================

# Stage 1: Build
FROM node:18-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package first
RUN pnpm --filter @orixa/shared run build

# Build API
RUN pnpm --filter @orixa/api run build

# Stage 2: Production
FROM node:18-alpine AS production

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Set ownership
RUN chown -R nestjs:nodejs /app

USER nestjs

WORKDIR /app/apps/api

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main"]
