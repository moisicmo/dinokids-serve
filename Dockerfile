FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

# Copiar script de entrada
COPY entrypoint.sh ./entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]
