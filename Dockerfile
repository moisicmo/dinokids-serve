FROM node:22-alpine

# 1. Capturar la variable desde Railway (en build)
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

# Copiar y dar permisos al script de entrada
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]
