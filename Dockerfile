FROM node:22-alpine

# 1. Recibe DATABASE_URL como argumento del build (desde Railway o Docker)
ARG DATABASE_URL

# 2. Lo define como variable de entorno disponible en tiempo de ejecución
ENV DATABASE_URL=${DATABASE_URL}

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

# Copiar script de entrada
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]
