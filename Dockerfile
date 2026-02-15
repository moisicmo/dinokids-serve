# Usamos Node 22
FROM node:22-alpine

# Crear directorio de app
WORKDIR /app

# Copiar package.json
COPY package.json yarn.lock ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar todo
COPY . .

# Build
RUN yarn build

# Exponer puerto
EXPOSE 3001

# Ejecutar
CMD ["node", "dist/main.js"]
