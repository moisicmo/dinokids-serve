# Etapa 1: Build
FROM node:22-slim AS builder

ENV NODE_ENV=development
ENV NODE_OPTIONS=--max-old-space-size=1024

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

# Etapa 2: Producción
FROM node:22-slim

ENV NODE_ENV=production

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --prod

COPY --from=builder /app/dist ./dist
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]
