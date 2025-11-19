FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build authentication

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/common ./common
COPY --from=builder /app/config ./config
COPY --from=builder /app/core ./core

EXPOSE 3001

CMD ["node", "dist/apps/authentication/apps/authentication/src/main"]

