# ----------------------------
# 1️⃣ BUILD STAGE
# ----------------------------
FROM node:22-alpine AS builder

# Activamos corepack (para usar yarn moderno)
RUN corepack enable

WORKDIR /app

# Copiamos package.json y yarn.lock primero (mejor cache)
COPY package.json yarn.lock ./

# Instalamos dependencias
RUN yarn install

# Copiamos el resto del código
COPY . .

# Generamos el build de NestJS
RUN yarn build


# ----------------------------
# 2️⃣ PRODUCTION STAGE
# ----------------------------
FROM node:22-alpine

RUN corepack enable

WORKDIR /app

# Copiamos package.json y yarn.lock
COPY package.json yarn.lock ./

# Instalamos solo dependencias de producción
RUN yarn install --production

# Copiamos solo el build generado
COPY --from=builder /app/dist ./dist

# Comando de arranque
CMD ["node", "dist/src/main.js"]