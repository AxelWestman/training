FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json ./apps/api/
RUN npm ci

COPY apps/api ./apps/api
RUN npm run build -w apps/api

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/main"]
