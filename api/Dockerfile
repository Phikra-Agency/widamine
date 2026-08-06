FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY api/package.json api/
COPY admin/package.json admin/
COPY landing/package.json landing/

RUN npm ci

COPY api ./api
RUN npm run build --workspace=widamine-api

FROM node:22-alpine AS runner
WORKDIR /app/api

# Install OpenSSL 3 for Prisma
RUN apk add --no-cache openssl openssl-dev

ENV NODE_ENV=production

COPY package.json package-lock.json .npmrc /app/
COPY api/package.json /app/api/
COPY admin/package.json /app/admin/
COPY landing/package.json /app/landing/

WORKDIR /app
RUN npm ci --omit=dev --workspace=widamine-api

COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/api/prisma ./api/prisma

# Generate Prisma client for the production platform
WORKDIR /app/api
RUN npx --yes prisma@5.22.0 generate

WORKDIR /app/api
EXPOSE 3000

# Run migrations and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
