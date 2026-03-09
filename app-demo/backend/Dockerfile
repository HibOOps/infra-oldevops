# Stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install ALL deps (prisma is a devDependency, needed for generate)
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

# Stage production
FROM node:20-alpine AS production
WORKDIR /app
RUN apk upgrade --no-cache && apk add --no-cache wget openssl
COPY package*.json ./
RUN npm ci --omit=dev
# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY src ./src

EXPOSE 5000

# db push applies schema directly (no migration files required)
CMD ["sh", "-c", "npx prisma db push && (node prisma/seed.js || echo 'Seed skipped (data already exists)') && node src/server.js"]
