# ==============================
# 🏗️ 1️⃣ BUILD STAGE
# ==============================
# Usamos Node 22 Alpine (ligero y seguro)
FROM node:22-alpine AS builder

# Directorio interno del contenedor
WORKDIR /app

# Copiamos archivos necesarios para instalar dependencias
# IMPORTANTE: usamos yarn porque tu proyecto usa yarn
COPY package.json yarn.lock ./

# Instalamos TODAS las dependencias (incluye dev)
# Necesarias para poder hacer el build (Nest CLI, TypeScript, etc.)
RUN yarn install --frozen-lockfile

# Copiamos el resto del proyecto
COPY . .

# Generamos el build (crea la carpeta dist)
RUN yarn build


# ==============================
# 🚀 2️⃣ PRODUCTION STAGE
# ==============================
# Nueva imagen limpia para producción
FROM node:22-alpine

WORKDIR /app

# Copiamos solo package.json y yarn.lock
COPY package.json yarn.lock ./

# Instalamos SOLO dependencias de producción
RUN yarn install --frozen-lockfile --production

# Copiamos únicamente el build generado desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Exponemos el puerto donde corre Nest
EXPOSE 3001

# Comando para iniciar la app
# ⚠️ IMPORTANTE:
# Si tu build genera dist/src/main.js cambia a:
# CMD ["node", "dist/src/main.js"]
# Si genera dist/main.js déjalo así:
CMD ["node", "dist/main.js"]
