# Etapa 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN node --max-old-space-size=1024 ./node_modules/.bin/nest build

# Etapa 2: Producción
FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --prod

COPY --from=builder /app/dist ./dist
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]
