# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Install all deps (including devDependencies needed to compile TypeScript)
COPY package*.json ./
RUN npm ci

# Copy source and compile TypeScript
COPY . .
RUN npm run build

# Prune devDependencies so only production deps are copied to the runtime stage
RUN npm prune --production

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM node:18-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only what's needed at runtime from the builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create the uploads directory with correct ownership.
# On Render: a Persistent Disk is mounted over this path (render.yaml disk.mountPath).
# On local Docker: a named volume is mounted here (docker-compose.yml uploads_data).
# Either way the directory must be owned by nodejs so Multer can write files.
RUN mkdir -p /app/public/uploads && \
    chown -R nodejs:nodejs /app/public

USER nodejs

# Render injects PORT at runtime; default to 5000 for local Docker.
# EXPOSE is documentation-only — the actual port is controlled by the PORT env var.
EXPOSE 5000

CMD ["node", "dist/server.js"]


