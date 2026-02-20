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
RUN apk add --no-cache wget openssl
# Copy full node_modules (includes prisma CLI needed for db push at runtime)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY src ./src
COPY package.json ./

EXPOSE 5000

# db push applies schema directly (no migration files required)
CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && node src/server.js"]
