
FROM node:18-alpine AS builder

WORKDIR /app

COPY ../backend/package*.json ./
RUN npm ci

COPY ../backend .

RUN npm run build
RUN npm prune --omit=dev

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD [ "node", "dist/server.js" ]
