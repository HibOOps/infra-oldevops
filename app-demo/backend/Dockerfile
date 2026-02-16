FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl libssl3

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=build --chown=appuser:appgroup /app/src ./src
COPY --from=build --chown=appuser:appgroup /app/prisma ./prisma

USER appuser

EXPOSE 8080

CMD ["node", "src/server.js"]
